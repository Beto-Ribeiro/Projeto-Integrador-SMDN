const ROLE_LABELS = {
  admin: 'Administrador',
  employee: 'Agente autorizado',
  institution: 'Instituição',
  citizen: 'Cidadão',
  unknown: 'Sem perfil web',
}

export function normalizeRole(value) {
  const role = String(value || '')
    .trim()
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')

  if (!role) return 'unknown'

  if (['admin', 'adm', 'administrador', 'administradora', 'gestor', 'gestora'].includes(role)) {
    return 'admin'
  }

  if (
    [
      'funcionario',
      'funcionaria',
      'agente',
      'operador',
      'operadora',
      'bombeiro',
      'bombeiros',
      'samu',
      'saude',
      'seguranca',
      'defesa civil',
      'defesacivil',
    ].includes(role)
  ) {
    return 'employee'
  }

  if (['instituicao', 'instituicao publica', 'orgao', 'orgao publico'].includes(role)) {
    return 'institution'
  }

  if (['cidadao', 'cidada', 'usuario mobile', 'mobile'].includes(role)) {
    return 'citizen'
  }

  return 'unknown'
}

export function getRoleLabel(role) {
  return ROLE_LABELS[normalizeRole(role)] || ROLE_LABELS.unknown
}

export function canAccessWeb(role) {
  return ['admin', 'employee', 'institution'].includes(normalizeRole(role))
}

export function canAccessAdmin(role) {
  return normalizeRole(role) === 'admin'
}
