import { supabase } from '../supabase/client.js'

const PERIOD_TO_KEY = {
  'Últimos 7 dias': '7d',
  'Últimos 30 dias': '30d',
  'Últimos 6 meses': '6m',
  'Último ano': '1y',
}

const STATUS_COLORS = {
  Resolvidas: '#02c602',
  'Em andamento': '#ff6a00',
  Pendentes: '#c60202',
}

const SEVERITY_STYLE = {
  Crítico: { color: 'bg-status-critical', text: 'text-status-critical' },
  Grave: { color: 'bg-status-severe', text: 'text-status-severe' },
  Moderado: { color: 'bg-status-regular', text: 'text-status-regular' },
  Normal: { color: 'bg-status-success', text: 'text-status-success' },
}

function toNumber(value, fallback = 0) {
  const numeric = Number(value)
  return Number.isFinite(numeric) ? numeric : fallback
}

function normalizeArray(value) {
  return Array.isArray(value) ? value : []
}

function normalizeReportData(payload) {
  const monthly = normalizeArray(payload?.monthly).map((item) => ({
    month: item?.month || '—',
    total: toNumber(item?.total),
    critical: toNumber(item?.critical),
  }))

  const byType = normalizeArray(payload?.byType).map((item) => ({
    type: item?.type || 'Não informado',
    count: toNumber(item?.count),
    pct: toNumber(item?.pct),
  }))

  const byCity = normalizeArray(payload?.byCity).map((item) => ({
    city: item?.city || 'Local não informado',
    count: toNumber(item?.count),
  }))

  const bySeverity = normalizeArray(payload?.bySeverity).map((item) => {
    const style = SEVERITY_STYLE[item?.label] || SEVERITY_STYLE.Normal
    return {
      label: item?.label || 'Normal',
      count: toNumber(item?.count),
      pct: toNumber(item?.pct),
      color: item?.color || style.color,
      text: item?.text || style.text,
    }
  })

  const byStatus = normalizeArray(payload?.byStatus).map((item) => ({
    label: item?.label || 'Pendentes',
    count: toNumber(item?.count),
    pct: toNumber(item?.pct),
    color: item?.color || STATUS_COLORS[item?.label] || STATUS_COLORS.Pendentes,
  }))

  const occurrences = normalizeArray(payload?.occurrences).map((item) => ({
    id: item?.rel_id || item?.id || '',
    tipo: item?.tipo || 'Não informado',
    descricao: item?.descricao || 'Não informado',
    severidade: item?.severidade || 'Normal',
    status: item?.status || 'Pendente',
    municipio: item?.municipio || 'Local não informado',
    cidadaoNome: item?.cidadao_nome || 'Cidadão não identificado',
    data: item?.event_at || null,
    lat: item?.lat === null || item?.lat === undefined ? '' : Number(item.lat),
    lng: item?.lng === null || item?.lng === undefined ? '' : Number(item.lng),
  }))

  return {
    kpis: {
      total: toNumber(payload?.kpis?.total),
      totalDelta: payload?.kpis?.totalDelta || '0%',
      totalPositive: payload?.kpis?.totalPositive ?? true,
      resolutionRate: payload?.kpis?.resolutionRate || '0%',
      resolutionDelta: payload?.kpis?.resolutionDelta || '0%',
      resolutionPositive: payload?.kpis?.resolutionPositive ?? true,
    },
    monthly,
    byType,
    byCity,
    bySeverity,
    byStatus,
    occurrences,
    generatedAt: payload?.generatedAt || new Date().toISOString(),
  }
}

export async function getRelatoriosData(periodLabel) {
  const periodKey = PERIOD_TO_KEY[periodLabel] || '6m'

  const { data, error } = await supabase.rpc('get_relatorios_data', {
    p_period: periodKey,
  })

  if (error) {
    throw new Error('Não foi possível carregar os relatórios. Tente novamente.')
  }

  return normalizeReportData(data)
}

export function subscribeRelatoriosChanges(onChange) {
  const channel = supabase
    .channel('relatorios-realtime')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'Relato' }, onChange)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'Ocorrencia_Status' }, onChange)
    .subscribe()

  const intervalId = window.setInterval(onChange, 30000)

  return () => {
    window.clearInterval(intervalId)
    supabase.removeChannel(channel)
  }
}
