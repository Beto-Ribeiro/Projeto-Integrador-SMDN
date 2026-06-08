import { useState } from 'react'
import Card from '../components/Card'
import Modal from '../components/Modal'
import { useAuth } from '../hooks/useAuth.js'

const PERMISSIONS = [
  { key: 'dashboard', label: 'Dashboard', granted: true },
  { key: 'reportar', label: 'Reportar / Disparar Alertas', granted: true },
  { key: 'ocorrencias', label: 'Gerenciar Ocorrências', granted: true },
  { key: 'relatorios', label: 'Relatórios Analíticos', granted: true },
  { key: 'auditoria', label: 'Auditoria', granted: false },
  { key: 'admin', label: 'Administração de Usuários', granted: false },
]

const ACTIVITY = [
  { action: 'Alerta disparado', target: 'Enchente – São José dos Campos', at: '10/01 08:22' },
  { action: 'Ocorrência registrada', target: 'OC-001 – Jardim Aquarius', at: '10/01 08:18' },
  { action: 'Login', target: 'Acesso autorizado', at: '10/01 09:05' },
  { action: 'Ocorrência atualizada', target: 'OC-007 – Bom Retiro, Taubaté', at: '09/01 15:35' },
]

export default function Perfil() {
  const { user, setUser } = useAuth()
  const [isEditing, setIsEditing] = useState(false)
  const [form, setForm] = useState({
    name: user?.name || '',
    email: user?.email || '',
    role: user?.role || '',
    phone: '(12) 99999-0000',
    cpf: '***.***.***-00',
    institution: 'Defesa Civil do Estado de São Paulo',
  })
  const [saved, setSaved] = useState(false)

  const handleSave = () => {
    // TODO: Supabase update
    setUser((u) => ({ ...u, name: form.name, email: form.email, role: form.role }))
    setIsEditing(false)
    setSaved(true)
    setTimeout(() => setSaved(false), 3000)
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
          Perfil atualizado com sucesso!
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1 min-h-0">
        {/* Identity card */}
        <Card className="lg:col-span-1 flex flex-col items-center text-center py-8 gap-4 h-full">
          {/* Avatar */}
          <div className="w-20 h-20 rounded-full bg-text-main/20 border-4 border-text-main/30 flex items-center justify-center">
            <span className="text-2xl font-bold text-text-main">{initials}</span>
          </div>
          <div>
            <h2 className="text-card-title font-bold text-slate-800">{form.name}</h2>
            <p className="text-sm text-slate-500 mt-0.5">{form.role}</p>
          </div>
          <div className="w-full border-t border-border-soft pt-4 space-y-2 text-sm text-slate-600 text-left">
            <div className="flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-slate-400 flex-shrink-0">
                <path d="M13 5c0 5-5 8-5 8S3 10 3 5a5 5 0 0 1 10 0Z" stroke="currentColor" strokeWidth="1.4" fill="none" />
                <circle cx="8" cy="5" r="1.5" fill="currentColor" />
              </svg>
              <span>{form.institution}</span>
            </div>
            <div className="flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-slate-400 flex-shrink-0">
                <rect x="2" y="3" width="12" height="9" rx="1.5" stroke="currentColor" strokeWidth="1.4" fill="none" />
                <path d="M2 6l6 4 6-4" stroke="currentColor" strokeWidth="1.2" />
              </svg>
              <span className="truncate">{form.email}</span>
            </div>
            <div className="flex items-center gap-2">
              <svg width="16" height="16" viewBox="0 0 16 16" fill="none" className="text-slate-400 flex-shrink-0">
                <path d="M3 3h2l1 3-1.5 1.5a9 9 0 0 0 3 3L9 9l3 1v2a1 1 0 0 1-1 1C5.5 13 3 7.5 3 4a1 1 0 0 1 1-1Z" stroke="currentColor" strokeWidth="1.3" fill="none" />
              </svg>
              <span>{form.phone}</span>
            </div>
          </div>
          <button
            className="btn-primary w-full mt-2"
            onClick={() => setIsEditing(true)}
          >
            Editar Perfil
          </button>
        </Card>

        {/* Info + Permissions + Activity */}
        <div className="lg:col-span-2 flex flex-col gap-5 h-full">
          {/* Permissions */}
          <Card>
            <h3 className="text-card-title font-bold text-slate-800 mb-4">Permissões de Acesso</h3>
            <div className="grid grid-cols-2 gap-2">
              {PERMISSIONS.map((p) => (
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

          {/* Recent Activity */}
          <Card className="flex-1">
            <h3 className="text-card-title font-bold text-slate-800 mb-4">Atividade Recente</h3>
            <div className="space-y-2.5">
              {ACTIVITY.map((a, i) => (
                <div key={i} className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 rounded-full bg-text-main/50 flex-shrink-0" />
                  <span className="text-slate-600"><strong className="text-slate-800">{a.action}</strong> – {a.target}</span>
                  <span className="ml-auto text-xs text-slate-400 whitespace-nowrap">{a.at}</span>
                </div>
              ))}
            </div>
          </Card>
        </div>
      </div>

      {/* Edit Modal */}
      <Modal isOpen={isEditing} onClose={() => setIsEditing(false)} title="Editar Perfil" size="md">
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="col-span-2">
              <label className="block text-label text-slate-600 mb-1.5">NOME COMPLETO</label>
              <input className="input-field" value={form.name} onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))} />
            </div>
            <div>
              <label className="block text-label text-slate-600 mb-1.5">E-MAIL</label>
              <input type="email" className="input-field" value={form.email} onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))} />
            </div>
            <div>
              <label className="block text-label text-slate-600 mb-1.5">TELEFONE</label>
              <input className="input-field" value={form.phone} onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))} />
            </div>
          </div>
          <div className="flex items-center justify-end gap-3 pt-2 border-t border-border-soft">
            <button className="btn-ghost" onClick={() => setIsEditing(false)}>Cancelar</button>
            <button className="btn-primary" onClick={handleSave}>Salvar Alterações</button>
          </div>
        </div>
      </Modal>
    </div>
  )
}