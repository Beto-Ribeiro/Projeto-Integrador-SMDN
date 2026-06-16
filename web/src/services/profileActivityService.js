import { supabase } from '../lib/supabase'

function isMissingRelationError(error) {
  return error?.code === '42P01' || String(error?.message || '').toLowerCase().includes('does not exist')
}

const FIELD_MESSAGES = {
  name: { noun: 'nome', self: 'seu nome' },
  phone: { noun: 'telefone', self: 'seu telefone' },
  email: { noun: 'e-mail de contato', self: 'seu e-mail de contato' },
  avatar: { noun: 'avatar', self: 'seu avatar' },
  type: { noun: 'tipo de perfil', self: 'seu tipo de perfil' },
  permissions: { noun: 'permissões', self: 'suas permissões' },
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

function describeSingleChange(change, viewerIsTarget, actorIsTarget, actorName) {
  const field = FIELD_MESSAGES[change?.key] || { noun: change?.label || 'perfil', self: 'seu perfil' }
  const newValue = String(change?.newValue ?? '').trim()
  const removed = !newValue || newValue === '—' || newValue === 'null'

  if (actorIsTarget) {
    if (change?.key === 'avatar' && removed) return 'Você removeu seu avatar.'
    return `Você alterou ${field.self}.`
  }

  if (viewerIsTarget) {
    if (change?.key === 'avatar' && removed) return 'Seu avatar foi retirado por um administrador.'
    return `${field.self.charAt(0).toUpperCase()}${field.self.slice(1)} foi alterado por um administrador.`
  }

  if (change?.key === 'avatar' && removed) return `${actorName} removeu o avatar deste usuário.`
  return `${actorName} alterou ${field.self}.`
}

export function formatUserActivity(activity, currentUser) {
  const metadata = activity?.atu_metadata || {}
  const changes = Array.isArray(metadata.changes) ? metadata.changes : []
  const actorName = metadata.actorName || 'Administrador'
  const viewerIsTarget = currentUser?.id === activity?.atu_user_id
  const actorIsTarget = activity?.atu_actor_id && activity?.atu_actor_id === activity?.atu_user_id

  if (metadata.kind === 'reset_profile') {
    if (viewerIsTarget) return 'Seu perfil de acesso foi removido por um administrador.'
    return `${actorName} removeu o perfil de acesso deste usuário.`
  }

  if (changes.length === 1) {
    return describeSingleChange(changes[0], viewerIsTarget, actorIsTarget, actorName)
  }

  if (actorIsTarget) return 'Você alterou seu perfil.'
  if (viewerIsTarget) return 'Seu perfil foi alterado por um administrador.'
  return `${actorName} alterou o perfil deste usuário.`
}
