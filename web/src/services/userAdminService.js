import { supabase } from '../lib/supabase'
import { formatBrazilPhone } from '../utils/phone.js'

function isMissingRelationError(error) {
  return error?.code === '42P01' || String(error?.message || '').toLowerCase().includes('does not exist')
}

function normalize(value) {
  return String(value ?? '').trim()
}

async function getCurrentUserId() {
  const { data } = await supabase.auth.getUser()
  return data?.user?.id || null
}

function buildChangeSummary(before, after) {
  const changes = []

  if (normalize(before.prf_nome) !== normalize(after.prf_nome)) {
    changes.push(`nome: ${before.prf_nome || '—'} → ${after.prf_nome || '—'}`)
  }

  if (normalize(before.prf_tipo) !== normalize(after.prf_tipo)) {
    changes.push(`tipo: ${before.prf_tipo || '—'} → ${after.prf_tipo || '—'}`)
  }

  if (normalize(before.prf_email_contato) !== normalize(after.prf_email_contato)) {
    changes.push(`e-mail de contato: ${before.prf_email_contato || '—'} → ${after.prf_email_contato || '—'}`)
  }

  if (normalize(before.prf_telefone) !== normalize(after.prf_telefone)) {
    changes.push(`telefone: ${before.prf_telefone || '—'} → ${after.prf_telefone || '—'}`)
  }

  if (normalize(before.prf_avatar_url) !== normalize(after.prf_avatar_url)) {
    changes.push('foto de perfil atualizada')
  }

  return changes
}

export async function listUsersForAdmin() {
  const { data, error } = await supabase
    .from('Perfis')
    .select('prf_id, prf_nome, prf_tipo, prf_telefone, prf_email_contato, prf_avatar_url, prf_created_at')
    .order('prf_nome', { ascending: true })

  if (error) {
    if (isMissingRelationError(error)) {
      return { data: [], missingSchema: true }
    }
    throw error
  }

  return { data: data || [], missingSchema: false }
}

export async function updateUserProfileByAdmin({ user, form }) {
  if (!user?.prf_id) throw new Error('Usuário inválido para edição.')

  const actorUserId = await getCurrentUserId()
  const payload = {
    prf_nome: normalize(form.name),
    prf_tipo: normalize(form.type) || null,
    prf_email_contato: normalize(form.email).toLowerCase() || null,
    prf_telefone: formatBrazilPhone(form.phone) || null,
    prf_avatar_url: normalize(form.avatarUrl) || null,
  }

  const before = {
    prf_nome: user.prf_nome,
    prf_tipo: user.prf_tipo,
    prf_email_contato: user.prf_email_contato,
    prf_telefone: user.prf_telefone,
    prf_avatar_url: user.prf_avatar_url,
  }

  const { data, error } = await supabase
    .from('Perfis')
    .update(payload)
    .eq('prf_id', user.prf_id)
    .select('prf_id, prf_nome, prf_tipo, prf_telefone, prf_email_contato, prf_avatar_url, prf_created_at')
    .single()

  if (error) throw error

  const changes = buildChangeSummary(before, data)
  const detail = changes.length > 0
    ? `Administrador alterou seu perfil: ${changes.join('; ')}.`
    : 'Administrador salvou seu perfil sem alterações visíveis.'

  const activityPayload = {
    atu_user_id: user.prf_id,
    atu_actor_id: actorUserId,
    atu_action: 'Perfil atualizado pelo administrador',
    atu_detail: detail,
    atu_metadata: { before, after: data, changes },
  }

  const { error: activityError } = await supabase
    .from('Atividade_Usuario')
    .insert(activityPayload)

  if (activityError && !isMissingRelationError(activityError)) {
    console.warn('Não foi possível registrar atividade do usuário:', activityError.message)
  }

  const { error: auditError } = await supabase
    .from('Audit_Log')
    .insert({
      actor_user_id: actorUserId,
      action: 'admin_updated_user_profile',
      entity_type: 'Perfis',
      entity_id: user.prf_id,
      detail,
      metadata: { before, after: data, changes },
    })

  if (auditError && !isMissingRelationError(auditError)) {
    console.warn('Não foi possível registrar auditoria:', auditError.message)
  }

  return data
}
