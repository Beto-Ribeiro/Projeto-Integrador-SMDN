import { useEffect, useMemo, useState } from 'react'
import Modal from '../components/Modal'
import { formatBrazilPhone } from '../utils/phone.js'
import { listUsersForAdmin, updateUserProfileByAdmin } from '../services/userAdminService.js'
import { uploadAvatarFile } from '../services/avatarService.js'

function formatDate(value) {
  if (!value) return '—'
  return new Intl.DateTimeFormat('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(value))
}

function initials(name) {
  return String(name || 'Usuário')
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

function roleLabel(role) {
  const normalized = String(role || '').toLowerCase()
  const labels = {
    administrador: 'Administrador',
    admin: 'Administrador',
    funcionario: 'Funcionário',
    agente: 'Agente autorizado',
    instituicao: 'Instituição',
    cidadao: 'Cidadão',
  }

  return labels[normalized] || role || 'Sem tipo'
}

function makeForm(user) {
  return {
    name: user?.prf_nome || '',
    type: user?.prf_tipo || 'funcionario',
    email: user?.prf_email_contato || '',
    phone: formatBrazilPhone(user?.prf_telefone || ''),
    avatarUrl: user?.prf_avatar_url || '',
  }
}

function Avatar({ user, size = 'lg' }) {
  const classes = size === 'lg' ? 'w-12 h-12 text-sm' : 'w-10 h-10 text-xs'

  if (user?.prf_avatar_url) {
    return (
      <img
        src={user.prf_avatar_url}
        alt={user.prf_nome || 'Foto do usuário'}
        className={`${classes} rounded-full object-cover border border-border-soft bg-slate-100 flex-shrink-0`}
      />
    )
  }

  return (
    <div className={`${classes} rounded-full bg-bg-sidebar/10 text-bg-sidebar font-bold flex items-center justify-center flex-shrink-0`}>
      {initials(user?.prf_nome)}
    </div>
  )
}

export default function UserList() {
  const [users, setUsers] = useState([])
  const [selectedUser, setSelectedUser] = useState(null)
  const [form, setForm] = useState(makeForm(null))
  const [query, setQuery] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)
  const [error, setError] = useState('')
  const [message, setMessage] = useState('')

  async function loadUsers() {
    setLoading(true)
    setError('')

    try {
      const result = await listUsersForAdmin()
      setUsers(result.data)
    } catch (err) {
      setError(err.message || 'Não foi possível carregar a lista de usuários.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadUsers()
  }, [])

  const filteredUsers = useMemo(() => {
    const search = query.trim().toLowerCase()
    if (!search) return users

    return users.filter((user) => {
      const content = [
        user.prf_nome,
        user.prf_tipo,
        user.prf_email_contato,
        user.prf_telefone,
        user.prf_id,
      ]
        .join(' ')
        .toLowerCase()

      return content.includes(search)
    })
  }, [users, query])

  function openEdit(user) {
    setSelectedUser(user)
    setForm(makeForm(user))
    setError('')
    setMessage('')
  }

  function closeEdit() {
    setSelectedUser(null)
    setForm(makeForm(null))
  }


  async function handleAvatarFileChange(event) {
    const file = event.target.files?.[0]
    if (!file || !selectedUser) return

    setUploadingAvatar(true)
    setError('')

    try {
      const publicUrl = await uploadAvatarFile({ file, userId: selectedUser.prf_id })
      setForm((current) => ({ ...current, avatarUrl: publicUrl }))
    } catch (err) {
      setError(err.message || 'Não foi possível enviar a foto.')
    } finally {
      setUploadingAvatar(false)
      event.target.value = ''
    }
  }

  async function handleSave() {
    if (!selectedUser) return

    setSaving(true)
    setError('')
    setMessage('')

    try {
      await updateUserProfileByAdmin({ user: selectedUser, form })
      setMessage('Perfil do usuário atualizado. A atividade aparecerá no perfil dele.')
      closeEdit()
      await loadUsers()
    } catch (err) {
      setError(err.message || 'Não foi possível atualizar o usuário.')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="p-6 space-y-6">
      <div className="flex flex-col gap-2">
        <p className="text-sm font-semibold uppercase tracking-[0.2em] text-bg-sidebar/70">Administração</p>
        <h1 className="text-3xl font-bold text-slate-800">Lista de Usuário</h1>
        <p className="text-sm text-slate-500 max-w-3xl">
          Consulte usuários, abra o perfil e edite dados públicos diretamente. Toda alteração feita por admin fica registrada nas atividades recentes do usuário.
        </p>
      </div>

      {error && (
        <div className="rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm text-red-700 leading-relaxed">
          {error}
        </div>
      )}

      {message && (
        <div className="rounded-2xl border border-green-100 bg-green-50 px-5 py-4 text-sm text-green-700 leading-relaxed">
          {message}
        </div>
      )}

      <div className="bg-white rounded-2xl shadow-card border border-border-soft overflow-hidden">
        <div className="flex flex-col md:flex-row md:items-center gap-3 border-b border-border-soft p-4">
          <div>
            <p className="text-sm font-bold text-slate-800">Usuários cadastrados</p>
            <p className="text-xs text-slate-400">{filteredUsers.length} de {users.length} perfil(is)</p>
          </div>

          <div className="md:ml-auto flex gap-2 w-full md:w-auto">
            <input
              className="input-field md:w-72"
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Buscar por nome, tipo, contato ou ID"
            />
            <button
              onClick={loadUsers}
              className="rounded-xl px-4 py-2 text-sm font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all"
            >
              Atualizar
            </button>
          </div>
        </div>

        {loading ? (
          <div className="p-8 text-sm text-slate-500">Carregando usuários...</div>
        ) : filteredUsers.length === 0 ? (
          <div className="p-8 text-sm text-slate-400 text-center">Nenhum usuário encontrado.</div>
        ) : (
          <div className="divide-y divide-border-soft">
            {filteredUsers.map((user) => (
              <button
                key={user.prf_id}
                onClick={() => openEdit(user)}
                className="w-full flex items-center gap-4 px-5 py-4 text-left hover:bg-slate-50 transition-all"
              >
                <Avatar user={user} />

                <div className="min-w-0 flex-1">
                  <p className="font-bold text-slate-800 truncate">{user.prf_nome || 'Usuário sem nome'}</p>
                  <p className="text-xs text-slate-400 truncate">{roleLabel(user.prf_tipo)}</p>
                </div>

                <div className="hidden md:block min-w-[220px] text-sm text-slate-500">
                  <p className="truncate">{user.prf_email_contato || 'Sem e-mail de contato'}</p>
                  <p className="text-xs text-slate-400">{user.prf_telefone || 'Sem telefone'}</p>
                </div>

                <div className="hidden lg:block min-w-[160px] text-xs text-slate-400">
                  Criado em {formatDate(user.prf_created_at)}
                </div>

                <span className="text-xs font-semibold text-bg-sidebar">Editar</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <Modal isOpen={Boolean(selectedUser)} onClose={closeEdit} title="Editar usuário" size="md">
        <div className="space-y-4">
          {selectedUser && (
            <div className="rounded-2xl bg-slate-50 border border-border-soft p-4 flex items-center gap-3">
              <Avatar user={{ ...selectedUser, prf_avatar_url: form.avatarUrl, prf_nome: form.name }} size="sm" />
              <div className="min-w-0">
                <p className="font-bold text-slate-800 truncate">{form.name || 'Usuário sem nome'}</p>
                <p className="text-xs text-slate-400 font-mono truncate">{selectedUser.prf_id}</p>
              </div>
            </div>
          )}

          <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-xs text-blue-800 leading-relaxed">
            Alterações feitas aqui são aplicadas direto no perfil do usuário e aparecem em “Atividade Recente” no perfil dele.
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-label text-slate-600 mb-1.5">NOME COMPLETO</label>
              <input
                className="input-field"
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
              />
            </div>

            <div>
              <label className="block text-label text-slate-600 mb-1.5">TIPO DE PERFIL</label>
              <select
                className="input-field"
                value={form.type}
                onChange={(event) => setForm((current) => ({ ...current, type: event.target.value }))}
              >
                <option value="funcionario">Funcionário</option>
                <option value="instituicao">Instituição</option>
                <option value="cidadao">Cidadão</option>
                <option value="administrador">Administrador</option>
              </select>
            </div>

            <div>
              <label className="block text-label text-slate-600 mb-1.5">E-MAIL DE CONTATO</label>
              <input
                type="email"
                className="input-field"
                value={form.email}
                onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
              />
            </div>

            <div>
              <label className="block text-label text-slate-600 mb-1.5">TELEFONE</label>
              <input
                className="input-field"
                inputMode="numeric"
                maxLength={15}
                value={form.phone}
                placeholder="(12) 98703-7110"
                onChange={(event) => setForm((current) => ({ ...current, phone: formatBrazilPhone(event.target.value) }))}
              />
            </div>

            <div>
              <label className="block text-label text-slate-600 mb-1.5">FOTO DO PERFIL</label>
              <label className="input-field flex items-center justify-between cursor-pointer text-slate-500">
                <span className="truncate">{uploadingAvatar ? 'Enviando foto...' : form.avatarUrl ? 'Trocar foto' : 'Enviar foto'}</span>
                <input
                  type="file"
                  accept="image/*"
                  className="hidden"
                  disabled={uploadingAvatar}
                  onChange={handleAvatarFileChange}
                />
              </label>
            </div>

            <div className="col-span-2">
              <label className="block text-label text-slate-600 mb-1.5">URL DA FOTO</label>
              <input
                className="input-field"
                value={form.avatarUrl}
                placeholder="Será preenchida automaticamente após upload"
                onChange={(event) => setForm((current) => ({ ...current, avatarUrl: event.target.value }))}
              />
            </div>
          </div>

          <div className="rounded-xl border border-yellow-100 bg-yellow-50 px-4 py-3 text-xs text-yellow-800 leading-relaxed">
            Trocar senha ou e-mail de login do Auth ainda deve ser feito pelo Supabase Authentication. Esta tela altera o perfil público usado no sistema.
          </div>

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-border-soft">
            <button className="btn-ghost" onClick={closeEdit} disabled={saving}>Cancelar</button>
            <button className="btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? 'Salvando...' : 'Salvar Alterações'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
