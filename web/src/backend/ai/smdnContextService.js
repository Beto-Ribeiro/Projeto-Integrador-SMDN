import { listUsersForAdmin, PERMISSION_LABELS } from '../admin/userAdminService.js'
import { getDashboardData } from '../dashboard/dashboardService.js'
import { listAuditEvents } from '../auditoria/auditService.js'

function normalizeText(value) {
  return String(value || '')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
}

function compactText(value, maxLength = 500) {
  return String(value || '').trim().slice(0, maxLength)
}

function permissionSummary(permissions = {}) {
  return Object.entries(PERMISSION_LABELS).reduce((acc, [key, label]) => {
    acc[key] = {
      label,
      enabled: Boolean(permissions?.[key]),
    }
    return acc
  }, {})
}

function compactUser(user) {
  const permissions = user?.prf_permissoes || {}

  return {
    id: user?.prf_id || null,
    name: user?.prf_nome || 'Usuário sem nome',
    type: user?.prf_tipo || 'sem tipo',
    email: user?.prf_email_contato || null,
    phone: user?.prf_telefone || null,
    createdAt: user?.prf_created_at || null,
    hasAvatar: Boolean(user?.prf_avatar_url),
    permissions: permissionSummary(permissions),
    rawPermissions: permissions,
  }
}

function groupUsers(users) {
  return users.reduce((acc, user) => {
    const key = normalizeText(user.type || 'sem_tipo').replace(/\s+/g, '_') || 'sem_tipo'
    if (!acc[key]) acc[key] = []
    acc[key].push(user)
    return acc
  }, {})
}

function compactOccurrence(occurrence) {
  return {
    id: occurrence?.id || null,
    relatoId: occurrence?.relatoId || null,
    title: occurrence?.title || occurrence?.type || 'Ocorrência',
    type: occurrence?.type || null,
    severity: occurrence?.severity || null,
    riskLabel: occurrence?.riskLabel || null,
    status: occurrence?.status || null,
    city: occurrence?.city || null,
    neighborhood: occurrence?.neighborhood || null,
    citizenName: occurrence?.citizenName || null,
    reportedAt: occurrence?.reportedAt || null,
    time: occurrence?.time || null,
    description: compactText(occurrence?.description, 700),
    lat: Number.isFinite(occurrence?.lat) ? occurrence.lat : null,
    lng: Number.isFinite(occurrence?.lng) ? occurrence.lng : null,
  }
}

function compactVictim(victim) {
  return {
    id: victim?.id || null,
    name: victim?.name || 'Vítima localizada',
    assistanceStatus: victim?.assistanceStatus || 'pendente',
    source: victim?.source || null,
    updatedAt: victim?.updatedAt || null,
    lat: Number.isFinite(victim?.lat) ? victim.lat : null,
    lng: Number.isFinite(victim?.lng) ? victim.lng : null,
  }
}

function compactAuditEvent(event) {
  return {
    id: event?.id || null,
    action: event?.action || null,
    actionLabel: event?.actionLabel || null,
    type: event?.type || null,
    actor: {
      name: event?.actor?.name || null,
      email: event?.actor?.email || null,
      role: event?.actor?.role || null,
    },
    target: {
      name: event?.target?.name || null,
      email: event?.target?.email || null,
      type: event?.target?.type || event?.target?.role || null,
      id: event?.target?.id || null,
    },
    detail: compactText(event?.detail, 600),
    at: event?.at || null,
    searchText: compactText(event?.searchText, 800),
  }
}

async function safeLoad(label, loader, fallback) {
  try {
    return await loader()
  } catch (error) {
    console.warn(`[SMDN IA] Não foi possível carregar contexto de ${label}:`, error?.message || error)
    return fallback
  }
}

function findRelatedUsers(users, question) {
  const normalizedQuestion = normalizeText(question)
  if (!normalizedQuestion) return []

  return users.filter((user) => {
    const content = normalizeText([
      user.name,
      user.type,
      user.email,
      user.phone,
      user.id,
    ].filter(Boolean).join(' '))

    return content && normalizedQuestion.split(/\s+/).some((token) => token.length >= 3 && content.includes(token))
  }).slice(0, 8)
}

function buildUserSummary(users, question) {
  const compactUsers = users.map(compactUser)
  const byRole = groupUsers(compactUsers)
  const admins = compactUsers.filter((user) => ['administrador', 'admin'].includes(normalizeText(user.type)))
  const citizens = compactUsers.filter((user) => ['cidadao', 'cidada', 'citizen'].includes(normalizeText(user.type)))
  const institutions = compactUsers.filter((user) => normalizeText(user.type).includes('instituicao'))

  return {
    total: compactUsers.length,
    profiles: compactUsers,
    relatedToQuestion: findRelatedUsers(compactUsers, question),
    byRole,
    admins,
    citizens,
    institutions,
  }
}

function buildDashboardSummary(dashboard) {
  const recentOccurrences = (dashboard?.recentOccurrences || []).map(compactOccurrence)
  const victims = (dashboard?.victims || []).map(compactVictim)
  const recommended = [...recentOccurrences].sort((a, b) => {
    const severityWeight = { critical: 4, severe: 3, regular: 2 }
    const statusWeight = { active: 2, monitoring: 1, resolved: 0 }
    const aw = (severityWeight[a.severity] || 1) * 10 + (statusWeight[a.status] || 0)
    const bw = (severityWeight[b.severity] || 1) * 10 + (statusWeight[b.status] || 0)
    if (bw !== aw) return bw - aw
    return new Date(b.reportedAt || 0) - new Date(a.reportedAt || 0)
  })[0] || null

  return {
    stats: dashboard?.stats || {},
    recentOccurrences,
    victims,
    recommendedOccurrence: recommended,
  }
}

export async function buildSmdnOperationalContext({ question = '', currentScreen = '' } = {}) {
  const [dashboard, usersResult, auditEvents] = await Promise.all([
    safeLoad('dashboard', () => getDashboardData(), null),
    safeLoad('usuários', () => listUsersForAdmin(), { data: [] }),
    safeLoad('auditoria', () => listAuditEvents(), []),
  ])

  const users = usersResult?.data || []

  return {
    generatedAt: new Date().toISOString(),
    currentScreen,
    question: compactText(question, 500),
    dashboard: dashboard ? buildDashboardSummary(dashboard) : null,
    users: buildUserSummary(users, question),
    audit: {
      total: auditEvents.length,
      recentEvents: auditEvents.slice(0, 60).map(compactAuditEvent),
      relatedToQuestion: auditEvents
        .filter((event) => normalizeText(event.searchText || '').includes(normalizeText(question)))
        .slice(0, 15)
        .map(compactAuditEvent),
    },
  }
}
