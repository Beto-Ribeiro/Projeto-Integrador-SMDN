import { createContext, useEffect, useMemo, useState } from 'react'
import { supabase } from '../lib/supabase'
import { signInWithEmailAndPassword, signOutFromSupabase } from '../services/authService'
import { getWebAccessForUser } from '../services/webAccessService'

export const AuthContext = createContext()

export const AuthProvider = ({ children }) => {
  const [session, setSession] = useState(null)
  const [user, setUser] = useState(null)
  const [loading, setLoading] = useState(true)
  const [accessError, setAccessError] = useState('')

  async function applySession(nextSession, { signOutWhenUnauthorized = true } = {}) {
    if (!nextSession?.user) {
      setSession(null)
      setUser(null)
      setAccessError('')
      return null
    }

    const access = await getWebAccessForUser(nextSession.user)

    console.info('[SMDN Auth] Resultado da autorização web:', {
      allowed: access?.allowed,
      role: access?.role,
      isAdmin: access?.isAdmin,
      reason: access?.reason,
    })

    if (!access.allowed) {
      setSession(null)
      setUser(null)
      setAccessError(access.reason)

      if (signOutWhenUnauthorized) {
        await supabase.auth.signOut()
      }

      return access
    }

    setSession(nextSession)
    setUser(access.user)
    setAccessError('')

    return access
  }

  useEffect(() => {
    let mounted = true

    async function loadSession() {
      try {
        const { data, error } = await supabase.auth.getSession()

        if (error) throw error
        if (!mounted) return

        await applySession(data?.session ?? null)
      } catch (error) {
        console.error('[SMDN Auth] Erro ao carregar sessão:', error)
        if (mounted) {
          setAccessError(error.message || 'Não foi possível carregar a sessão.')
          setSession(null)
          setUser(null)
        }
      } finally {
        if (mounted) setLoading(false)
      }
    }

    loadSession()

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, nextSession) => {
      // Evita fazer consultas Supabase diretamente dentro do callback síncrono do Auth.
      setTimeout(() => {
        if (!mounted) return

        applySession(nextSession)
          .catch((error) => {
            console.error('[SMDN Auth] Erro ao aplicar sessão:', error)
            if (mounted) {
              setAccessError(error.message || 'Não foi possível validar a sessão.')
              setSession(null)
              setUser(null)
            }
          })
          .finally(() => {
            if (mounted) setLoading(false)
          })
      }, 0)
    })

    return () => {
      mounted = false
      subscription.unsubscribe()
    }
  }, [])

  async function signIn({ email, password }) {
    setAccessError('')

    const data = await signInWithEmailAndPassword({ email, password })
    const access = await applySession(data.session)

    if (!access?.allowed) {
      throw new Error(access?.reason || 'Usuário sem permissão para acessar o painel web.')
    }

    return data
  }

  async function signOut() {
    await signOutFromSupabase()
    setSession(null)
    setUser(null)
    setAccessError('')
  }

  const value = useMemo(
    () => ({
      session,
      user,
      setUser,
      loading,
      accessError,
      isAuthenticated: Boolean(session?.user && user),
      isAdmin: Boolean(user?.isAdmin || user?.role === 'admin'),
      signIn,
      signOut,
    }),
    [session, user, loading, accessError]
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}
