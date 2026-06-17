import { useEffect, useMemo, useState } from 'react'
import Card from '../components/Card'
import Modal from '../components/Modal'
import homeIcon from '../assets/perfil/home.svg'
import mailIcon from '../assets/perfil/mail.svg'
import phoneIcon from '../assets/perfil/phone.svg'
import { useAuth } from '../hooks/useAuth.js'
import { formatBrazilPhone } from '../utils/phone.js'
import { formatActivityDate, formatUserActivity, listUserActivities } from '../backend/perfil/profileActivityService.js'
import { uploadAvatarFile } from '../backend/perfil/avatarService.js'
import {
  buildProfileChanges,
  hasProfileChanges,
  requestProfileChange,
  updateOwnProfileDirect,
} from '../backend/perfil/profileChangeService.js'

const PERMISSIONS = [
  { key: 'dashboard', label: 'Dashboard', granted: true },
  { key: 'reportar', label: 'Reportar / Disparar Alertas', granted: true },
  { key: 'ocorrencias', label: 'Gerenciar Ocorrências', granted: true },
  { key: 'relatorios', label: 'Relatórios Analíticos', granted: true },
  { key: 'auditoria', label: 'Auditoria', granted: true },
  { key: 'admin', label: 'Administração de Usuários', granted: true },
]

const FALLBACK_ACTIVITY = [
  { action: 'Login', target: 'Acesso autorizado', at: 'Agora' },
  { action: 'Perfil', target: 'Dados sincronizados', at: 'Hoje' },
]

function makeInitialForm(user) {
  return {
    name: user?.name || '',
    email: user?.contactEmail || user?.perfil?.prf_email_contato || user?.email || '',
    role: user?.roleLabel || user?.role || '',
    phone: formatBrazilPhone(user?.phone || user?.perfil?.prf_telefone || ''),
    avatarUrl: user?.avatar || user?.perfil?.prf_avatar_url || '',
    cpf: '***.***.***-00',
    institution: user?.instituicao?.ins_numero || 'SMDN',
    newPassword: '',
    requestPasswordReset: false,
  }
}

function ChangePreview({ changes }) {
  const entries = Object.entries(changes || {})
  if (entries.length === 0) return null

  return (
    <div className="rounded-xl border border-blue-100 bg-blue-50 px-4 py-3 text-xs text-blue-800 space-y-1">
      <p className="font-bold">Alterações detectadas</p>
      {entries.map(([key, change]) => (
        <p key={key}>
          <strong>{change.label}:</strong> {change.old} → {change.new}
        </p>
      ))}
    </div>
  )
}

function ProfileInfoIcon({ src, alt }) {
  return (
    <img
      src={src}
      width="16"
      height="16"
      alt={alt}
      className="w-4 h-4 flex-shrink-0 opacity-60"
    />
  )
}

function ActivityList({ activities, currentUser }) {
  const items = activities.length > 0 ? activities : FALLBACK_ACTIVITY

  return (
    <div className="space-y-2.5">
      {items.map((activity, index) => {
        const isDatabaseActivity = Boolean(activity.atu_id)
        const action = isDatabaseActivity ? activity.atu_action : activity.action
        const target = isDatabaseActivity ? formatUserActivity(activity, currentUser) : activity.target
        const at = isDatabaseActivity ? formatActivityDate(activity.atu_created_at) : activity.at

        return (
          <div key={activity.atu_id || index} className="flex items-start gap-3 text-sm">
            <div className="w-2 h-2 rounded-full bg-text-main/50 flex-shrink-0 mt-2" />
            <span className="text-slate-600 leading-relaxed">
              <strong className="text-slate-800">{action}</strong> – {target}
            </span>
            <span className="ml-auto text-xs text-slate-400 whitespace-nowrap pt-0.5">{at}</span>
          </div>
        )
      })}
    </div>
  )
}

export default function Perfil() {
  const { user, setUser, isAdmin } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [form, setForm] = useState(makeInitialForm(user))
  const [activities, setActivities] = useState([])
  const [saved, setSaved] = useState(false)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const [saving, setSaving] = useState(false)
  const [uploadingAvatar, setUploadingAvatar] = useState(false)

  useEffect(() => {
    setForm(makeInitialForm(user))
  }, [user])

  useEffect(() => {
    let mounted = true

    async function loadActivities() {
      try {
        const data = await listUserActivities(user?.id)
        if (mounted) setActivities(data)
      } catch (err) {
        console.warn('Não foi possível carregar atividades do usuário:', err.message)
        if (mounted) setActivities([])
      }
    }

    loadActivities()

    return () => {
      mounted = false
    }
  }, [user?.id, saved])

  const changes = buildProfileChanges({
    currentUser: user,
    form,
    requestPasswordReset: !isAdmin && form.requestPasswordReset,
  })

  const permissions = useMemo(() => {
    const storedPermissions = user?.permissions || user?.perfil?.prf_permissoes || {}

    return PERMISSIONS.map((permission) => ({
      ...permission,
      granted: permission.key === 'admin' ? isAdmin : (isAdmin ? true : Boolean(storedPermissions[permission.key])),
    }))
  }, [isAdmin, user?.permissions, user?.perfil?.prf_permissoes])


  async function handleAvatarFileChange(event) {
    const file = event.target.files?.[0]
    if (!file || !user?.id) return

    setUploadingAvatar(true)
    setError('')

    try {
      const publicUrl = await uploadAvatarFile({ file, userId: user.id })
      setForm((current) => ({ ...current, avatarUrl: publicUrl }))
    } catch (err) {
      setError(err.message || 'Não foi possível enviar a foto.')
    } finally {
      setUploadingAvatar(false)
      event.target.value = ''
    }
  }

  const handleSave = async () => {
    setSaving(true)
    setError('')
    setNotice('')

    try {
      if (isAdmin) {
        const updatedProfile = await updateOwnProfileDirect({
          currentUser: user,
          form,
          newPassword: form.newPassword,
        })

        setUser((current) => ({
          ...current,
          name: updatedProfile.prf_nome || current.name,
          contactEmail: updatedProfile.prf_email_contato || current.email,
          phone: updatedProfile.prf_telefone || '',
          avatar: updatedProfile.prf_avatar_url || '',
          perfil: {
            ...(current.perfil || {}),
            ...updatedProfile,
          },
        }))

        setNotice('Perfil atualizado diretamente. Administradores não precisam de aprovação.')
      } else {
        if (!hasProfileChanges(changes)) {
          throw new Error('Nenhuma alteração foi informada.')
        }

        await requestProfileChange({
          currentUser: user,
          form,
          requestPasswordReset: form.requestPasswordReset,
        })

        setNotice('Solicitação enviada. Um administrador precisa aprovar a alteração.')
      }

      setForm((current) => ({ ...current, newPassword: '', requestPasswordReset: false }))
      setIsEditing(false)
      setSaved(true)
      setTimeout(() => setSaved(false), 4000)
    } catch (err) {
      setError(err.message || 'Não foi possível salvar as alterações.')
    } finally {
      setSaving(false)
    }
  }

  const initials = form.name?.split(' ').map((n) => n[0]).slice(0, 2).join('').toUpperCase()

  return (
    <div className="p-8 flex flex-col gap-6 animate-fade-in h-full min-h-full">
      {saved && (
        <div className="flex items-center gap-3 bg-status-success-bg border border-status-success/30 text-status-success font-semibold text-sm px-4 py-3 rounded-lg animate-slide-up flex-shrink-0">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <circle cx="9" cy="9" r="7" fill="currentColor" opacity=".15" />
            <path d="M5.5 9l2.5 2.5 5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          {notice || 'Alteração registrada com sucesso.'}
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        <Card className="lg:col-span-1 flex flex-col items-center text-center py-8 gap-4 h-full">
          {form.avatarUrl ? (
            <img
              src={form.avatarUrl}
              alt={form.name || 'Foto do perfil'}
              className="w-20 h-20 rounded-full object-cover border-4 border-text-main/30 bg-slate-100"
            />
          ) : (
            <div className="w-20 h-20 rounded-full bg-text-main/20 border-4 border-text-main/30 flex items-center justify-center">
              <span className="text-2xl font-bold text-text-main">{initials}</span>
            </div>
          )}
          <div>
            <h2 className="text-card-title font-bold text-slate-800">{form.name}</h2>
            <p className="text-sm text-slate-500 mt-0.5">{form.role}</p>
          </div>
          <div className="w-full border-t border-border-soft pt-4 space-y-2 text-sm text-slate-600 text-left">
            <div className="flex items-center gap-2">
              <ProfileInfoIcon src={homeIcon} alt="instituição" />
              <span>{form.institution}</span>
            </div>
            <div className="flex items-center gap-2">
              <ProfileInfoIcon src={mailIcon} alt="e-mail" />
              <span className="truncate">{form.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <ProfileInfoIcon src={phoneIcon} alt="telefone" />
              <span>{form.phone || 'Telefone não informado'}</span>
            </div>
          </div>
          <button className="btn-primary w-full mt-2" onClick={() => setIsEditing(true)}>
            Editar Perfil
          </button>
        </Card>

        <div className="lg:col-span-2 flex flex-col gap-5 h-full">
          <Card>
            <h3 className="text-card-title font-bold text-slate-800 mb-4">Permissões de Acesso</h3>
            <div className="grid grid-cols-2 gap-2">
              {permissions.map((p) => (
                <div key={p.key} className="flex items-center gap-2 text-sm">
                  <span className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${p.granted ? 'bg-status-success-bg' : 'bg-slate-100'}`}>
                    {p.granted ? (
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M2 5l2 2 4-4" stroke="#02c602" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
                      </svg>
                    ) : (
                      <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                        <path d="M3 3l4 4M7 3L3 7" stroke="#94a3b8" strokeWidth="1.5" strokeLinecap="round" />
                      </svg>
                    )}
                  </span>
                  <span className={p.granted ? 'text-slate-700' : 'text-slate-400'}>{p.label}</span>
                </div>
              ))}
            </div>
          </Card>

          <Card className="flex-1">
            <h3 className="text-card-title font-bold text-slate-800 mb-4">Atividade Recente</h3>
            <ActivityList activities={activities} currentUser={user} />
          </Card>
        </div>
      </div>

      <Modal isOpen={isEditing} onClose={() => setIsEditing(false)} title="Editar Perfil" size="md">
        <div className="space-y-4">
          {error && (
            <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {!isAdmin && (
            <div className="rounded-xl border border-yellow-100 bg-yellow-50 px-4 py-3 text-xs text-yellow-800 leading-relaxed">
              Usuários comuns solicitam alteração para aprovação. Administradores alteram diretamente.
            </div>
          )}

          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-label text-slate-600 mb-1.5">NOME COMPLETO</label>
              <input className="input-field" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            </div>
            <div className="col-span-2">
              <label className="block text-label text-slate-600 mb-1.5">FOTO DO PERFIL</label>
              <div className="flex items-center gap-3">
                {form.avatarUrl ? (
                  <img src={form.avatarUrl} alt="Prévia da foto" className="w-12 h-12 rounded-full object-cover border border-border-soft" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center text-xs font-bold text-slate-500">{initials}</div>
                )}

                <label className="btn-ghost cursor-pointer">
                  {uploadingAvatar ? 'Enviando...' : 'Enviar foto'}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={uploadingAvatar}
                    onChange={handleAvatarFileChange}
                  />
                </label>
              </div>
            </div>

            <div>
              <label className="block text-label text-slate-600 mb-1.5">E-MAIL DE CONTATO</label>
              <input type="email" className="input-field" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
            </div>
            <div>
              <label className="block text-label text-slate-600 mb-1.5">TELEFONE</label>
              <input
                className="input-field"
                inputMode="numeric"
                maxLength={15}
                value={form.phone}
                placeholder="(12) 98703-7110"
                onChange={(e) => setForm((f) => ({ ...f, phone: formatBrazilPhone(e.target.value) }))}
              />
            </div>
          </div>

          {isAdmin ? (
            <div>
              <label className="block text-label text-slate-600 mb-1.5">NOVA SENHA DO ADMIN OPCIONAL</label>
              <input
                type="password"
                className="input-field"
                value={form.newPassword}
                placeholder="Deixe em branco para não alterar"
                onChange={(e) => setForm((f) => ({ ...f, newPassword: e.target.value }))}
              />
            </div>
          ) : (
            <label className="flex items-center gap-2 text-sm text-slate-600">
              <input
                type="checkbox"
                checked={form.requestPasswordReset}
                onChange={(e) => setForm((f) => ({ ...f, requestPasswordReset: e.target.checked }))}
              />
              Solicitar redefinição de senha ao administrador
            </label>
          )}

          {!isAdmin && <ChangePreview changes={changes} />}

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-border-soft">
            <button className="btn-ghost" onClick={() => setIsEditing(false)} disabled={saving}>Cancelar</button>
            <button className="btn-primary" onClick={handleSave} disabled={saving}>
              {saving ? 'Salvando...' : isAdmin ? 'Salvar Alterações' : 'Enviar Solicitação'}
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}
