import { supabase } from '../lib/supabase'
import { formatUserActivity } from './profileActivityService.js'

function isMissingRelationError(error) {
  return error?.code === '42P01' || String(error?.message || '').toLowerCase().includes('does not exist')
}

function mapAuditType(action = '') {
  if (action.includes('profile') || action.includes('perfil')) return 'profile'
  if (action.includes('access')) return 'auth'
  if (action.includes('alert')) return 'alert'
  return 'record'
}

function actionLabel(action = '') {
  const labels = {
    admin_updated_user_profile: 'Perfil Editado',
    admin_reset_user_profile: 'Perfil Removido',
    profile_change_approved: 'Perfil Aprovado',
    profile_change_rejected: 'Perfil Recusado',
    access_request_rejected: 'Acesso Recusado',
  }

  return labels[action] || action || 'Registro'
}

async function safeSelect(promise, fallback = []) {
  const { data, error } = await promise
  if (error) {
    if (isMissingRelationError(error)) return fallback
    throw error
  }
  return data || fallback
}

export async function listAuditEvents() {
  const [alerts, auditLogs, activities] = await Promise.all([
    safeSelect(
      supabase
        .from('Alerta_Web')
        .select('alw_id, alw_tipo, alw_cidade, alw_bairro, alw_destinatarios, alw_operador_nome, alw_created_at')
        .order('alw_created_at', { ascending: false })
        .limit(200)
    ),
    safeSelect(
      supabase
        .from('Audit_Log')
        .select('log_id, actor_user_id, action, entity_type, entity_id, detail, metadata, created_at')
        .order('created_at', { ascending: false })
        .limit(200)
    ),
    safeSelect(
      supabase
        .from('Atividade_Usuario')
        .select('atu_id, atu_user_id, atu_actor_id, atu_action, atu_detail, atu_metadata, atu_created_at')
        .order('atu_created_at', { ascending: false })
        .limit(200)
    ),
  ])

  const alertEvents = alerts.map((alert) => ({
    id: `alert-${alert.alw_id}`,
    action: 'ALERTA_DISPARADO',
    actionLabel: 'Alerta Disparado',
    user: alert.alw_operador_nome || 'Usuário SMDN',
    role: 'Painel Web',
    detail: `Alerta de ${alert.alw_tipo} – ${alert.alw_cidade}${alert.alw_bairro ? ` / ${alert.alw_bairro}` : ''} – ${(alert.alw_destinatarios || 0).toLocaleString('pt-BR')} destinatários.`,
    at: alert.alw_created_at,
    ip: 'web',
    type: 'alert',
  }))

  const auditEvents = auditLogs.map((log) => ({
    id: `audit-${log.log_id}`,
    action: log.action,
    actionLabel: actionLabel(log.action),
    user: log.metadata?.actorName || 'Administrador',
    role: log.entity_type || 'Sistema',
    detail: log.detail || 'Registro administrativo.',
    at: log.created_at,
    ip: 'web',
    type: mapAuditType(log.action),
  }))

  const activityEvents = activities.map((activity) => ({
    id: `activity-${activity.atu_id}`,
    action: activity.atu_action,
    actionLabel: 'Perfil Editado',
    user: activity.atu_metadata?.actorName || 'Administrador',
    role: 'Perfil',
    detail: formatUserActivity(activity, { id: activity.atu_actor_id }),
    at: activity.atu_created_at,
    ip: 'web',
    type: 'profile',
  }))

  return [...alertEvents, ...auditEvents, ...activityEvents]
    .sort((a, b) => new Date(b.at || 0) - new Date(a.at || 0))
}
