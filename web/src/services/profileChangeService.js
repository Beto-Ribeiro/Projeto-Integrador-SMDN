import { supabase } from '../lib/supabase'
import { formatBrazilPhone } from '../utils/phone.js'

function normalize(value) {
  return String(value ?? '').trim()
}

export function buildProfileChanges({ currentUser, form, requestPasswordReset = false }) {
  const currentProfile = currentUser?.perfil || {}
  const changes = {}

  const currentName = normalize(currentUser?.name || currentProfile.prf_nome)
  const nextName = normalize(form.name)
  if (nextName && nextName !== currentName) {
    changes.name = { label: 'Nome completo', old: currentName || '—', new: nextName }
  }

  const currentPhone = formatBrazilPhone(currentProfile.prf_telefone || form.currentPhone || '')
  const nextPhone = formatBrazilPhone(form.phone)
  if (nextPhone !== currentPhone) {
    changes.phone = { label: 'Telefone', old: currentPhone || '—', new: nextPhone || '—' }
  }

  const currentContactEmail = normalize(currentProfile.prf_email_contato || currentUser?.email)
  const nextContactEmail = normalize(form.email).toLowerCase()
  if (nextContactEmail && nextContactEmail !== currentContactEmail.toLowerCase()) {
    changes.email = { label: 'E-mail de contato', old: currentContactEmail || '—', new: nextContactEmail }
  }

  if (requestPasswordReset) {
    changes.password = {
      label: 'Senha',
      old: '—',
      new: 'Solicita redefinição de senha',
      manualOnly: true,
    }
  }

  return changes
}

export function hasProfileChanges(changes) {
  return Object.keys(changes || {}).length > 0
}

export async function requestProfileChange({ currentUser, form, requestPasswordReset = false }) {
  if (!currentUser?.id) throw new Error('Usuário inválido para solicitar alteração.')

  const changes = buildProfileChanges({ currentUser, form, requestPasswordReset })

  if (!hasProfileChanges(changes)) {
    throw new Error('Nenhuma alteração foi informada.')
  }

  const { data, error } = await supabase
    .from('Solicitacao_Alteracao_Perfil')
    .insert({
      sap_user_id: currentUser.id,
      sap_nome_solicitante: currentUser.name || currentUser.email,
      sap_email_solicitante: currentUser.email,
      sap_alteracoes: changes,
      sap_status: 'pendente',
    })
    .select('*')
    .single()

  if (error) {
    if (error.code === '42P01' || String(error.message || '').toLowerCase().includes('does not exist')) {
      throw new Error('A tabela Solicitacao_Alteracao_Perfil ainda não existe no Supabase. Rode o SQL do patch primeiro.')
    }
    throw error
  }

  return data
}

export async function updateOwnProfileDirect({ currentUser, form, newPassword = '' }) {
  if (!currentUser?.id) throw new Error('Usuário inválido para atualizar perfil.')

  const payload = {
    prf_nome: normalize(form.name),
    prf_telefone: formatBrazilPhone(form.phone) || null,
    prf_email_contato: normalize(form.email).toLowerCase() || null,
  }

  const { data, error } = await supabase
    .from('Perfis')
    .update(payload)
    .eq('prf_id', currentUser.id)
    .select('prf_id, prf_nome, prf_tipo, prf_telefone, prf_email_contato, prf_created_at')
    .single()

  if (error) throw error

  const cleanPassword = String(newPassword || '')
  if (cleanPassword.length > 0) {
    if (cleanPassword.length < 6) {
      throw new Error('A nova senha precisa ter pelo menos 6 caracteres.')
    }

    const { error: passwordError } = await supabase.auth.updateUser({ password: cleanPassword })
    if (passwordError) throw passwordError
  }

  return data
}
