import { supabase } from '../supabase/client.js'

function mapAuthError(error) {
  const message = String(error?.message || '')

  if (message.toLowerCase().includes('invalid login credentials')) {
    return 'Credenciais inválidas no Supabase. Confira se o email é exatamente o usuário Auth e se a senha foi redefinida nesse usuário.'
  }

  if (message.toLowerCase().includes('email not confirmed')) {
    return 'Email ainda não confirmado no Supabase Auth.'
  }

  return message || 'Não foi possível autenticar no Supabase.'
}

export async function signInWithEmailAndPassword({ email, password }) {
  const cleanEmail = email?.trim().toLowerCase()
  const cleanPassword = String(password ?? '')

  console.info('[SMDN Auth] Tentando login no Supabase:', { email: cleanEmail })

  const { data, error } = await supabase.auth.signInWithPassword({
    email: cleanEmail,
    password: cleanPassword,
  })

  if (error) {
    console.error('[SMDN Auth] Erro no login:', {
      name: error.name,
      message: error.message,
      status: error.status,
    })
    throw new Error(mapAuthError(error))
  }

  console.info('[SMDN Auth] Login Auth OK:', {
    userId: data?.user?.id,
    hasSession: Boolean(data?.session),
  })

  if (!data?.session?.user) {
    throw new Error('Supabase autenticou, mas não retornou sessão válida.')
  }

  return data
}

export async function signOutFromSupabase() {
  const { error } = await supabase.auth.signOut()

  if (error) throw error
}
