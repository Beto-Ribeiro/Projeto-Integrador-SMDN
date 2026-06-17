import { supabase } from '../lib/supabase.js'

const PHOTO_BUCKET = 'Fotos_Storage'

export function formatRelativeTime(value) {
  if (!value) return 'Data não informada'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Data não informada'

  const diffMs = Date.now() - date.getTime()
  const diffMinutes = Math.floor(diffMs / 60000)

  if (diffMinutes < 1) return 'Agora'
  if (diffMinutes < 60) return `${diffMinutes} min atrás`

  const diffHours = Math.floor(diffMinutes / 60)
  if (diffHours < 24) return `${diffHours}h atrás`

  return date.toLocaleDateString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

async function getPhotoUrl(photoPath) {
  if (!photoPath) return ''

  if (/^https?:\/\//i.test(photoPath)) {
    return photoPath
  }

  const { data, error } = await supabase.storage
    .from(PHOTO_BUCKET)
    .createSignedUrl(photoPath, 60 * 60)

  if (error) {
    console.warn('[SMDN Dashboard] Não foi possível assinar foto do relato:', error.message)
    return ''
  }

  return data?.signedUrl || ''
}

async function withSignedPhotos(occurrences) {
  return Promise.all(
    (occurrences || []).map(async (item) => ({
      ...item,
      time: formatRelativeTime(item.reportedAt),
      lat: typeof item.lat === 'number' ? item.lat : item.lat ? Number(item.lat) : null,
      lng: typeof item.lng === 'number' ? item.lng : item.lng ? Number(item.lng) : null,
      photoUrl: await getPhotoUrl(item.photoPath),
    }))
  )
}

export async function getDashboardData() {
  const { data, error } = await supabase.rpc('get_dashboard_data')

  if (error) {
    throw new Error(error.message || 'Não foi possível carregar o dashboard.')
  }

  const recentOccurrences = await withSignedPhotos(data?.recentOccurrences || [])

  return {
    stats: {
      activeOccurrences: Number(data?.stats?.activeOccurrences || 0),
      activeAlerts: Number(data?.stats?.activeAlerts || 0),
      criticalSeverity: Number(data?.stats?.criticalSeverity || 0),
      resolvedToday: Number(data?.stats?.resolvedToday || 0),
    },
    recentOccurrences,
  }
}

export function subscribeDashboardChanges(onChange) {
  const channel = supabase
    .channel('dashboard-realtime')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'Relato' }, onChange)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'Foto' }, onChange)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'Alerta_Web' }, onChange)
    .subscribe()

  const intervalId = window.setInterval(onChange, 30000)

  return () => {
    window.clearInterval(intervalId)
    supabase.removeChannel(channel)
  }
}
