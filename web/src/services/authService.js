import { supabase } from '../lib/supabase'

export async function signInWithEmailAndPassword({ email, password }) {
  const cleanEmail = email?.trim().toLowerCase()

  const { data, error } = await supabase.auth.signInWithPassword({
    email: cleanEmail,
    password,
  })

  if (error) throw error

  return data
}

export async function signOutFromSupabase() {
  const { error } = await supabase.auth.signOut()

  if (error) throw error
}
