import { supabase } from '../supabase/client.js'

function isMissingRelationError(error) {
  return error?.code === '42P01' || String(error?.message || '').toLowerCase().includes('does not exist')
}

function emptyBecauseMissingSchema(error) {
  return {
    data: [],
    missingSchema: true,
    message: error?.message || 'Tabela ainda não criada no Supabase. Aplique o SQL de backend quando essa etapa for liberada.',
  }
}

async function getCurrentUserId() {
  const { data } = await supabase.auth.getUser()
  return data?.user?.id || null
}

async function getProfileName(userId) {
  if (!userId) return 'Administrador'

  const { data } = await supabase
    .from('Perfis')
    .select('prf_nome')
    .eq('prf_id', userId)
    .maybeSingle()

  return data?.prf_nome || 'Administrador'
}

function changesToActivityList(changes = {}) {
  return Object.entries(changes).map(([key, change]) => ({
    key,
    label: change.label,
    oldValue: change.old,
    newValue: change.value ?? change.new,
  }))
}

async function safeAuditLog(payload) {
  const { error } = await supabase.from('Audit_Log').insert(payload)
  if (error && !isMissingRelationError(error)) {
    console.warn('Não foi possível registrar auditoria:', error.message)
  }
}

async function safeUserActivity(payload) {
  const { error } = await supabase.from('Atividade_Usuario').insert(payload)
  if (error && !isMissingRelationError(error)) {
    console.warn('Não foi possível registrar atividade do usuário:', error.message)
  }
}

export async function listAccessRequests() {
  const { data, error } = await supabase
    .from('Solicitacao_Acesso_Web')
    .select('saw_id, saw_nome, saw_email, saw_instituicao, saw_cargo, saw_tipo_agente, saw_status, saw_observacao, saw_created_at, saw_reviewed_at, saw_reviewed_by')
    .order('saw_created_at', { ascending: false })

  if (error) {
    if (isMissingRelationError(error)) return emptyBecauseMissingSchema(error)
    throw error
  }

  return { data: data || [], missingSchema: false }
}

export async function listProfileChangeRequests() {
  const { data, error } = await supabase
    .from('Solicitacao_Alteracao_Perfil')
    .select('sap_id, sap_user_id, sap_nome_solicitante, sap_email_solicitante, sap_alteracoes, sap_status, sap_observacao, sap_created_at, sap_reviewed_by, sap_reviewed_at')
    .order('sap_created_at', { ascending: false })

  if (error) {
    if (isMissingRelationError(error)) return emptyBecauseMissingSchema(error)
    throw error
  }

  return { data: data || [], missingSchema: false }
}

export async function listWebProfiles() {
  const { data, error } = await supabase
    .from('Perfis')
    .select('prf_id, prf_nome, prf_tipo, prf_telefone, prf_email_contato, prf_avatar_url, prf_permissoes, prf_created_at')
    .order('prf_created_at', { ascending: false })

  if (error) {
    if (isMissingRelationError(error)) return emptyBecauseMissingSchema(error)
    throw error
  }

  return { data: data || [], missingSchema: false }
}

export async function listAuditLogs() {
  const { data, error } = await supabase
    .from('Audit_Log')
    .select('log_id, actor_user_id, action, entity_type, entity_id, detail, metadata, created_at')
    .order('created_at', { ascending: false })
    .limit(100)

  if (error) {
    if (isMissingRelationError(error)) return emptyBecauseMissingSchema(error)
    throw error
  }

  return { data: data || [], missingSchema: false }
}

export async function rejectAccessRequest(requestId, observation = '') {
  const actorUserId = await getCurrentUserId()

  const { data, error } = await supabase
    .from('Solicitacao_Acesso_Web')
    .update({
      saw_status: 'recusado',
      saw_observacao: observation || null,
      saw_reviewed_by: actorUserId,
      saw_reviewed_at: new Date().toISOString(),
    })
    .eq('saw_id', requestId)
    .select('*')
    .single()

  if (error) throw error

  await safeAuditLog({
    actor_user_id: actorUserId,
    action: 'access_request_rejected',
    entity_type: 'Solicitacao_Acesso_Web',
    entity_id: requestId,
    detail: observation || 'Solicitação de acesso recusada.',
  })

  return data
}

export async function approveAccessRequest(requestId) {
  const { data, error } = await supabase.functions.invoke('approve-web-access-request', {
    body: { requestId },
  })

  if (error) {
    throw new Error('Aprovação automática depende da Edge Function approve-web-access-request. O painel já está preparado, mas a função ainda precisa ser criada/deployada no Supabase.')
  }

  return data
}

function buildProfileUpdateFromChanges(changes = {}) {
  const payload = {}

  if (changes.name?.new) payload.prf_nome = changes.name.new
  if (changes.phone) payload.prf_telefone = changes.phone.new === '—' ? null : changes.phone.new
  if (changes.email?.new) payload.prf_email_contato = changes.email.new
  if (changes.avatar) payload.prf_avatar_url = changes.avatar.value || null

  return payload
}

export async function approveProfileChangeRequest(request) {
  const actorUserId = await getCurrentUserId()
  const actorName = await getProfileName(actorUserId)
  const changes = request.sap_alteracoes || {}
  const profileUpdate = buildProfileUpdateFromChanges(changes)

  if (Object.keys(profileUpdate).length > 0) {
    const { error: profileError } = await supabase
      .from('Perfis')
      .update(profileUpdate)
      .eq('prf_id', request.sap_user_id)

    if (profileError) throw profileError
  }

  const passwordMessage = changes.password
    ? ' Solicitação de senha marcada como aprovada; redefina a senha manualmente no Supabase Auth se necessário.'
    : ''

  const { data, error } = await supabase
    .from('Solicitacao_Alteracao_Perfil')
    .update({
      sap_status: 'aprovado',
      sap_observacao: `Aprovado pelo painel administrativo.${passwordMessage}`,
      sap_reviewed_by: actorUserId,
      sap_reviewed_at: new Date().toISOString(),
    })
    .eq('sap_id', request.sap_id)
    .select('*')
    .single()

  if (error) throw error

  await safeUserActivity({
    atu_user_id: request.sap_user_id,
    atu_actor_id: actorUserId,
    atu_action: 'Perfil alterado pelo administrador',
    atu_detail: `Alteração de perfil aprovada por ${actorName}.`,
    atu_metadata: {
      actorName,
      actorIsTarget: actorUserId === request.sap_user_id,
      targetName: request.sap_nome_solicitante,
      changes: changesToActivityList(changes),
    },
  })

  await safeAuditLog({
    actor_user_id: actorUserId,
    action: 'profile_change_approved',
    entity_type: 'Solicitacao_Alteracao_Perfil',
    entity_id: request.sap_id,
    detail: `Alteração de perfil aprovada para ${request.sap_nome_solicitante || request.sap_email_solicitante || request.sap_user_id}.${passwordMessage}`,
    metadata: { actorName, changes },
  })

  return data
}

export async function rejectProfileChangeRequest(request, observation = '') {
  const actorUserId = await getCurrentUserId()

  const { data, error } = await supabase
    .from('Solicitacao_Alteracao_Perfil')
    .update({
      sap_status: 'recusado',
      sap_observacao: observation || 'Recusado pelo painel administrativo.',
      sap_reviewed_by: actorUserId,
      sap_reviewed_at: new Date().toISOString(),
    })
    .eq('sap_id', request.sap_id)
    .select('*')
    .single()

  if (error) throw error

  await safeAuditLog({
    actor_user_id: actorUserId,
    action: 'profile_change_rejected',
    entity_type: 'Solicitacao_Alteracao_Perfil',
    entity_id: request.sap_id,
    detail: observation || 'Alteração de perfil recusada.',
    metadata: { changes: request.sap_alteracoes || {} },
  })

  return data
}
