import { supabase } from '../lib/supabase'

function isMissingRelationError(error) {
  return error?.code === '42P01' || String(error?.message || '').toLowerCase().includes('does not exist')
}

function emptyBecauseMissingSchema(error) {
  return {
    data: [],
    missingSchema: true,
    message:
      error?.message ||
      'Tabela ainda não criada no Supabase. Aplique o SQL de backend quando essa etapa for liberada.',
  }
}

export async function listAccessRequests() {
  const { data, error } = await supabase
    .from('Solicitacao_Acesso_Web')
    .select(
      'saw_id, saw_nome, saw_email, saw_instituicao, saw_cargo, saw_tipo_agente, saw_status, saw_observacao, saw_created_at, saw_reviewed_at, saw_reviewed_by'
    )
    .order('saw_created_at', { ascending: false })

  if (error) {
    if (isMissingRelationError(error)) return emptyBecauseMissingSchema(error)
    throw error
  }

  return { data: data || [], missingSchema: false }
}

export async function listWebProfiles() {
  const { data, error } = await supabase
    .from('Perfis')
    .select('prf_id, prf_nome, prf_tipo, prf_created_at')
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
    .select('log_id, actor_user_id, action, entity_type, entity_id, detail, created_at')
    .order('created_at', { ascending: false })
    .limit(100)

  if (error) {
    if (isMissingRelationError(error)) return emptyBecauseMissingSchema(error)
    throw error
  }

  return { data: data || [], missingSchema: false }
}

export async function rejectAccessRequest(requestId, observation = '') {
  const { data, error } = await supabase
    .from('Solicitacao_Acesso_Web')
    .update({
      saw_status: 'recusado',
      saw_observacao: observation || null,
      saw_reviewed_at: new Date().toISOString(),
    })
    .eq('saw_id', requestId)
    .select('*')
    .single()

  if (error) throw error

  return data
}

export async function approveAccessRequest(requestId) {
  // Segurança: criar usuário no Auth e escrever Perfis/Funcionario/Administrador
  // não deve ser feito com service_role no navegador.
  // A aprovação real precisa ser feita por Edge Function ou backend seguro.
  const { data, error } = await supabase.functions.invoke('approve-web-access-request', {
    body: { requestId },
  })

  if (error) {
    throw new Error(
      'Aprovação automática depende da Edge Function approve-web-access-request. O painel já está preparado, mas a função ainda precisa ser criada/deployada no Supabase.'
    )
  }

  return data
}
