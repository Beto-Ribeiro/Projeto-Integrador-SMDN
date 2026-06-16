import { supabase } from '../lib/supabase'
import { canAccessAdmin, canAccessWeb, getRoleLabel, normalizeRole } from '../utils/webRoles'

function isMissingRelationError(error) {
  return error?.code === '42P01' || String(error?.message || '').toLowerCase().includes('does not exist')
}

async function maybeGetSingle(table, idColumn, userId) {
  const { data, error } = await supabase
    .from(table)
    .select('*')
    .eq(idColumn, userId)
    .maybeSingle()

  if (error) {
    // Enquanto as policies ainda não existem, tabelas com RLS podem bloquear leitura.
    // A gente ignora aqui para não derrubar a sessão por um erro de política em fase de migração.
    console.warn(`Não foi possível consultar ${table}:`, error.message)
    return null
  }

  return data
}

export async function getWebAccessForUser(authUser) {
  if (!authUser?.id) {
    return {
      allowed: false,
      isAdmin: false,
      user: null,
      reason: 'Sessão inválida.',
    }
  }

  const { data: perfil, error: perfilError } = await supabase
    .from('Perfis')
    .select('prf_id, prf_nome, prf_tipo, prf_telefone, prf_email_contato, prf_avatar_url, prf_permissoes, prf_created_at')
    .eq('prf_id', authUser.id)
    .maybeSingle()

  if (perfilError && !isMissingRelationError(perfilError)) {
    throw perfilError
  }

  const [funcionario, administrador, instituicao, cidadao] = await Promise.all([
    maybeGetSingle('Funcionario', 'fun_id', authUser.id),
    maybeGetSingle('Administrador', 'adm_id', authUser.id),
    maybeGetSingle('Instituicao', 'ins_id', authUser.id),
    maybeGetSingle('Cidadao', 'cid_id', authUser.id),
  ])

  const inferredRole = administrador
    ? 'admin'
    : funcionario
      ? 'employee'
      : instituicao
        ? 'institution'
        : perfil?.prf_tipo
          ? normalizeRole(perfil.prf_tipo)
          : cidadao
            ? 'citizen'
            : 'unknown'

  const allowed = canAccessWeb(inferredRole) || Boolean(funcionario || administrador || instituicao)
  const admin = canAccessAdmin(inferredRole) || Boolean(administrador)

  if (!allowed) {
    return {
      allowed: false,
      isAdmin: false,
      profile: perfil,
      reason:
        cidadao || inferredRole === 'citizen'
          ? 'Seu cadastro é de cidadão/mobile. O painel web é restrito a agentes, instituições e administradores autorizados.'
          : 'Seu usuário ainda não foi autorizado para acessar o painel web.',
    }
  }

  const name = perfil?.prf_nome || authUser.email?.split('@')[0] || 'Usuário SMDN'
  const role = inferredRole

  return {
    allowed: true,
    isAdmin: admin,
    profile: perfil,
    role,
    user: {
      id: authUser.id,
      email: authUser.email,
      name,
      role,
      roleLabel: getRoleLabel(role),
      isAdmin: admin,
      avatar: perfil?.prf_avatar_url || null,
      permissions: perfil?.prf_permissoes || {},
      perfil,
      funcionario,
      administrador,
      instituicao,
      raw: authUser,
    },
  }
}

export async function createWebAccessRequest({ institution, name, email, role, agentType }) {
  const payload = {
    saw_nome: name?.trim(),
    saw_email: email?.trim().toLowerCase(),
    saw_instituicao: institution?.trim(),
    saw_cargo: role?.trim(),
    saw_tipo_agente: agentType?.trim() || role?.trim(),
    saw_status: 'pendente',
  }

  const { data, error } = await supabase
    .from('Solicitacao_Acesso_Web')
    .insert(payload)
    .select('*')
    .single()

  if (error) {
    if (isMissingRelationError(error)) {
      throw new Error(
        'A tabela Solicitacao_Acesso_Web ainda não existe no Supabase. O front está pronto, mas falta aplicar o SQL de backend quando você liberar.'
      )
    }

    throw error
  }

  return data
}
