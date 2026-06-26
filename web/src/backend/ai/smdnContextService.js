import { listUsersForAdmin, PERMISSION_LABELS } from '../admin/userAdminService.js'
import { getDashboardData } from '../dashboard/dashboardService.js'
import { listAuditEvents } from '../auditoria/auditService.js'
import { supabase } from '../supabase/client.js'
import {
  formatUserActivity,
  getActivityDetails,
  listUserActivities,
} from '../perfil/profileActivityService.js'

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

function compactProfileActivity(activity, currentUser) {
  const details = getActivityDetails(activity, currentUser)
  const metadata = activity?.atu_metadata || {}

  return {
    id: activity?.atu_id || null,
    action: activity?.atu_action || null,
    summary: formatUserActivity(activity, currentUser),
    detail: compactText(activity?.atu_detail, 700),
    kind: metadata.kind || null,
    createdAt: activity?.atu_created_at || null,
    actor: {
      id: activity?.atu_actor_id || null,
      name:
        activity?.actorProfile?.prf_nome ||
        metadata?.actor?.name ||
        metadata?.actorName ||
        null,
      email:
        activity?.actorProfile?.prf_email_contato ||
        metadata?.actor?.email ||
        null,
    },
    sections: (details?.sections || []).map((section) => ({
      title: section.title,
      rows: (section.rows || []).map((row) => ({
        label: row.label,
        value: compactText(row.value, 500),
      })),
    })),
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

async function getCurrentAuthUser() {
  const { data, error } = await supabase.auth.getUser()
  if (error) throw error
  return data?.user || null
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

function getOccurrencePriorityScore(occurrence) {
  const severityText = normalizeText([
    occurrence?.severity,
    occurrence?.riskLabel,
    occurrence?.description,
    occurrence?.title,
    occurrence?.type,
  ].filter(Boolean).join(' '))

  let score = 0

  if (severityText.includes('critico') || severityText.includes('crítico')) score += 50
  if (severityText.includes('grave') || severityText.includes('severo') || severityText.includes('severe')) score += 35
  if (severityText.includes('moderado') || severityText.includes('regular')) score += 15
  if (normalizeText(occurrence?.status).includes('active') || normalizeText(occurrence?.status).includes('ativo')) score += 15
  if (Number.isFinite(occurrence?.lat) && Number.isFinite(occurrence?.lng)) score += 8
  if (occurrence?.photoUrl) score += 4
  if (occurrence?.reportedAt) score += 4

  return score
}

function pickRecommendedOccurrence(recentOccurrences = []) {
  return [...recentOccurrences]
    .sort((a, b) => {
      const scoreDiff = getOccurrencePriorityScore(b) - getOccurrencePriorityScore(a)
      if (scoreDiff !== 0) return scoreDiff
      return new Date(b.reportedAt || 0) - new Date(a.reportedAt || 0)
    })[0] || null
}

function buildDashboardPriority({ stats = {}, recentOccurrences = [], victims = [] }) {
  const recommendedOccurrence = pickRecommendedOccurrence(recentOccurrences)
  const checklist = []

  if (stats.activeOccurrences > 0) {
    checklist.push({
      level: 'alta',
      label: 'Ocorrências ativas',
      reason: `Há ${stats.activeOccurrences} ocorrência(s) ativa(s). Verifique as mais recentes e críticas primeiro.`,
    })
  }

  if (stats.criticalSeverity > 0) {
    checklist.push({
      level: 'crítica',
      label: 'Severidade crítica',
      reason: `Há ${stats.criticalSeverity} ponto(s) de severidade crítica no painel.`,
    })
  }

  if (stats.locatedVictims > 0 || victims.length > 0) {
    checklist.push({
      level: 'crítica',
      label: 'Vítimas localizadas',
      reason: `Há ${stats.locatedVictims || victims.length} vítima(s) localizada(s). Priorize confirmação e atendimento.`,
    })
  }

  if (stats.activeAlerts > 0) {
    checklist.push({
      level: 'atenção',
      label: 'Alertas ativos',
      reason: `Há ${stats.activeAlerts} alerta(s) ativo(s). Confira se precisam de atualização ou encerramento.`,
    })
  }

  if (recommendedOccurrence) {
    checklist.unshift({
      level: 'crítica',
      label: 'Ocorrência recomendada',
      reason: `Confira primeiro ${recommendedOccurrence.title || recommendedOccurrence.id}, pois ela combina risco, status, recência e localização.`,
      occurrenceId: recommendedOccurrence.id,
      relatoId: recommendedOccurrence.relatoId,
    })
  }

  return {
    recommendedOccurrence,
    checklist,
    answerHint:
      checklist.length > 0
        ? 'Para responder "O que devo conferir primeiro?", use primeiro dashboard.priority.checklist. Se existir recommendedOccurrence, cite ela e explique por quê. Se não existir, use os cards stats.activeOccurrences, stats.criticalSeverity, stats.locatedVictims e stats.activeAlerts.'
        : 'Se não houver ocorrências ou alertas, diga que o painel não indica prioridade crítica no momento.',
  }
}

function buildDashboardSummary(dashboard) {
  const stats = dashboard?.stats || {}
  const recentOccurrences = (dashboard?.recentOccurrences || []).map(compactOccurrence)
  const victims = (dashboard?.victims || []).map(compactVictim)
  const priority = buildDashboardPriority({ stats, recentOccurrences, victims })

  return {
    stats,
    visibleCards: {
      activeOccurrences: {
        label: 'Ocorrências ativas',
        value: Number(stats.activeOccurrences || 0),
      },
      activeAlerts: {
        label: 'Alertas ativos',
        value: Number(stats.activeAlerts || 0),
      },
      criticalSeverity: {
        label: 'Severidade crítica',
        value: Number(stats.criticalSeverity || 0),
      },
      resolvedToday: {
        label: 'Resolvidas hoje',
        value: Number(stats.resolvedToday || 0),
      },
      locatedVictims: {
        label: 'Vítimas localizadas',
        value: Number(stats.locatedVictims || 0),
      },
      assistedVictims: {
        label: 'Vítimas atendidas',
        value: Number(stats.assistedVictims || 0),
      },
    },
    recentOccurrences,
    victims,
    recommendedOccurrence: priority.recommendedOccurrence,
    priority,
  }
}

function buildCurrentProfileSummary({ authUser, users, activities }) {
  if (!authUser?.id) {
    return {
      user: null,
      activities: {
        total: 0,
        recent: [],
      },
    }
  }

  const currentProfile = users.find((user) => user?.prf_id === authUser.id)
  const compactProfile = currentProfile
    ? compactUser(currentProfile)
    : {
        id: authUser.id,
        name: authUser.email?.split('@')[0] || 'Usuário SMDN',
        type: 'perfil autenticado',
        email: authUser.email || null,
        phone: null,
        createdAt: authUser.created_at || null,
        hasAvatar: false,
        permissions: {},
        rawPermissions: {},
      }

  const currentUserForFormat = {
    id: authUser.id,
    email: authUser.email,
    name: compactProfile.name,
    perfil: currentProfile || null,
  }

  const compactActivities = (activities || [])
    .slice(0, 30)
    .map((activity) => compactProfileActivity(activity, currentUserForFormat))

  return {
    user: compactProfile,
    activities: {
      total: activities?.length || 0,
      recent: compactActivities,
      howToRead:
        'A lista de Atividade Recente mostra ações ligadas ao perfil atual, como login, alterações feitas por administrador, mudanças de permissões, e-mail, nome, ocorrências e alertas. Leia de cima para baixo: os primeiros itens são os mais recentes.',
    },
  }
}

function buildVisibleScreen(currentScreen) {
  if (currentScreen === 'dashboard') {
    return {
      title: 'Dashboard',
      visibleSections: [
        'Mapa de calor',
        'Pontos de ocorrência',
        'Ocorrências recentes',
        'Cards de métricas',
        'Vítimas localizadas e atendidas',
      ],
      importantInstruction:
        'Quando a pergunta for sobre o que conferir primeiro, use dashboard.priority.checklist e dashboard.visibleCards. Não responda que não encontrou prioridade se houver ocorrências ativas, severidade crítica, vítimas ou alertas ativos.',
    }
  }

  if (currentScreen === 'perfil') {
    return {
      title: 'Perfil',
      visibleSections: [
        'Cartão do usuário',
        'Permissões de acesso',
        'Atividade Recente',
        'Botões de acessibilidade e sair',
      ],
      importantInstruction:
        'Quando a pergunta for sobre atividades recentes do Perfil, use currentProfile.activities.recent antes de dizer que não encontrou informação.',
    }
  }

  return null
}

export async function buildSmdnOperationalContext({ question = '', currentScreen = '' } = {}) {
  const [dashboard, usersResult, auditEvents, authUser] = await Promise.all([
    safeLoad('dashboard', () => getDashboardData(), null),
    safeLoad('usuários', () => listUsersForAdmin(), { data: [] }),
    safeLoad('auditoria', () => listAuditEvents(), []),
    safeLoad('usuário autenticado', () => getCurrentAuthUser(), null),
  ])

  const users = usersResult?.data || []
  const profileActivities = authUser?.id
    ? await safeLoad('atividades recentes do perfil', () => listUserActivities(authUser.id, 30), [])
    : []

  return {
    generatedAt: new Date().toISOString(),
    currentScreen,
    question: compactText(question, 500),
    visibleScreen: buildVisibleScreen(currentScreen),
    currentProfile: buildCurrentProfileSummary({
      authUser,
      users,
      activities: profileActivities,
    }),
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
