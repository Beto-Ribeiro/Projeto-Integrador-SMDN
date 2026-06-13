import { supabase } from '../lib/supabase'

function isMissingRelationError(error) {
  return error?.code === '42P01' || String(error?.message || '').toLowerCase().includes('does not exist')
}

export async function listUserActivities(userId, limit = 20) {
  if (!userId) return []

  const { data, error } = await supabase
    .from('Atividade_Usuario')
    .select('atu_id, atu_user_id, atu_actor_id, atu_action, atu_detail, atu_metadata, atu_created_at')
    .eq('atu_user_id', userId)
    .order('atu_created_at', { ascending: false })
    .limit(limit)

  if (error) {
    if (isMissingRelationError(error)) return []
    throw error
  }

  return data || []
}

export function formatActivityDate(value) {
  if (!value) return '—'

  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}
