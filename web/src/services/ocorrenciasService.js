import { supabase } from '../lib/supabase.js'

const PHOTO_BUCKET = 'Fotos_Storage'

export function formatOccurrenceDate(value) {
  if (!value) return 'Data não informada'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Data não informada'

  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

async function getPhotoUrl(photoPath) {
  if (!photoPath) return ''
  if (/^https?:\/\//i.test(photoPath)) return photoPath

  const { data, error } = await supabase.storage
    .from(PHOTO_BUCKET)
    .createSignedUrl(photoPath, 60 * 60)

  if (error) {
    console.warn('[SMDN Ocorrências] Não foi possível assinar foto:', error.message)
    return ''
  }

  return data?.signedUrl || ''
}

async function attachPhotos(items) {
  return Promise.all(
    (items || []).map(async (item) => ({
      ...item,
      lat: typeof item.lat === 'number' ? item.lat : item.lat ? Number(item.lat) : null,
      lng: typeof item.lng === 'number' ? item.lng : item.lng ? Number(item.lng) : null,
      photoUrl: await getPhotoUrl(item.photoPath),
    }))
  )
}

export async function getOcorrenciasData() {
  const { data, error } = await supabase.rpc('get_ocorrencias_data')

  if (error) {
    throw new Error(error.message || 'Não foi possível carregar ocorrências.')
  }

  return {
    stats: {
      active: Number(data?.stats?.active || 0),
      monitoring: Number(data?.stats?.monitoring || 0),
      resolved: Number(data?.stats?.resolved || 0),
    },
    items: await attachPhotos(data?.items || []),
  }
}

export async function updateOcorrenciaStatus({ relatoId, status }) {
  const { data, error } = await supabase.rpc('update_ocorrencia_status', {
    p_rel_id: relatoId,
    p_status: status,
  })

  if (error) {
    throw new Error(error.message || 'Não foi possível atualizar o status da ocorrência.')
  }

  return data
}

export function subscribeOcorrenciasChanges(onChange) {
  const channel = supabase
    .channel('ocorrencias-realtime')
    .on('postgres_changes', { event: '*', schema: 'public', table: 'Relato' }, onChange)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'Foto' }, onChange)
    .on('postgres_changes', { event: '*', schema: 'public', table: 'Ocorrencia_Status' }, onChange)
    .subscribe()

  const intervalId = window.setInterval(onChange, 30000)

  return () => {
    window.clearInterval(intervalId)
    supabase.removeChannel(channel)
  }
}
