import { supabase } from '../supabase/client.js'

const BUCKET = 'avatars'
const MAX_SIZE_BYTES = 2 * 1024 * 1024
const ALLOWED_TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif']

function sanitizeFileName(name) {
  return String(name || 'avatar')
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9.]+/g, '-')
    .replace(/^-+|-+$/g, '')
}

export async function uploadAvatarFile({ file, userId }) {
  if (!file) throw new Error('Selecione uma imagem para enviar.')
  if (!userId) throw new Error('Usuário inválido para upload da foto.')

  if (!ALLOWED_TYPES.includes(file.type)) {
    throw new Error('Formato inválido. Use JPG, PNG, WEBP ou GIF.')
  }

  if (file.size > MAX_SIZE_BYTES) {
    throw new Error('A imagem precisa ter até 2 MB.')
  }

  const safeName = sanitizeFileName(file.name)
  const fileExt = safeName.split('.').pop() || 'png'
  const path = `${userId}/${Date.now()}.${fileExt}`

  const { data, error } = await supabase.storage
    .from(BUCKET)
    .upload(path, file, {
      cacheControl: '3600',
      contentType: file.type,
      upsert: true,
    })

  if (error) {
    if (String(error.message || '').toLowerCase().includes('bucket not found')) {
      throw new Error('O envio de fotos ainda não está disponível. Avise o responsável pelo painel.')
    }
    throw error
  }

  const { data: publicUrlData } = supabase.storage
    .from(BUCKET)
    .getPublicUrl(data.path)

  return publicUrlData.publicUrl
}
