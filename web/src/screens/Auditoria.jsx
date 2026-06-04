import { useState, useMemo } from 'react'
import Card from '../components/Card'
import authIcon from '../assets/menu/inativo/lock.svg';
import alertIcon from '../assets/auditoria/alert-triangle.svg';
import recordIcon from '../assets/auditoria/flag.svg';
import userIcon from '../assets/auditoria/user.svg';

const LOG_ENTRIES = [
  { id: 1, action: 'LOGIN', user: 'Carlos Mendes', role: 'Defesa Civil', detail: 'Acesso ao sistema autorizado.', at: '2025-01-10T09:05:00', ip: '192.168.0.10', type: 'auth' },
  { id: 2, action: 'ALERTA_DISPARADO', user: 'Carlos Mendes', role: 'Defesa Civil', detail: 'Alerta de Enchente – São José dos Campos – 3.200 destinatários.', at: '2025-01-10T08:22:00', ip: '192.168.0.10', type: 'alert' },
  { id: 3, action: 'OCORRENCIA_CRIADA', user: 'Carlos Mendes', role: 'Defesa Civil', detail: 'OC-001 registrada: Enchente em Jardim Aquarius.', at: '2025-01-10T08:18:00', ip: '192.168.0.10', type: 'record' },
  { id: 4, action: 'LOGIN', user: 'Ana Souza', role: 'SAMU', detail: 'Acesso ao sistema autorizado.', at: '2025-01-10T07:55:00', ip: '10.0.1.22', type: 'auth' },
  { id: 5, action: 'ALERTA_DISPARADO', user: 'Ana Souza', role: 'SAMU', detail: 'Alerta de Deslizamento – Caraguatatuba – 1.100 destinatários.', at: '2025-01-10T07:42:00', ip: '10.0.1.22', type: 'alert' },
  { id: 6, action: 'OCORRENCIA_ATUALIZADA', user: 'Roberto Lima', role: 'Bombeiros', detail: 'OC-006 status alterado para Resolvida.', at: '2025-01-09T20:00:00', ip: '172.16.3.5', type: 'record' },
  { id: 7, action: 'PERFIL_EDITADO', user: 'Carlos Mendes', role: 'Defesa Civil', detail: 'Telefone e foto de perfil atualizados.', at: '2025-01-09T17:30:00', ip: '192.168.0.10', type: 'profile' },
  { id: 8, action: 'LOGOUT', user: 'Ana Souza', role: 'SAMU', detail: 'Sessão encerrada.', at: '2025-01-09T16:00:00', ip: '10.0.1.22', type: 'auth' },
  { id: 9, action: 'OCORRENCIA_CRIADA', user: 'Roberto Lima', role: 'Bombeiros', detail: 'OC-004 registrada: Incêndio em Vila Industrial, Jacareí.', at: '2025-01-09T22:02:00', ip: '172.16.3.5', type: 'record' },
  { id: 10, action: 'LOGIN', user: 'Roberto Lima', role: 'Bombeiros', detail: 'Acesso ao sistema autorizado.', at: '2025-01-09T21:55:00', ip: '172.16.3.5', type: 'auth' },
]

const TYPE_CONFIG = {
  auth: { color: 'bg-text-main', light: 'bg-blue-50', text: 'text-text-main', icon: <img src={authIcon} width="20" height="20" alt="lock" /> },
  alert: { color: 'bg-status-critical', light: 'bg-red-50', text: 'text-status-critical', icon: <img src={alertIcon} width="20" height="20" alt="flag" /> },
  record: { color: 'bg-status-success', light: 'bg-green-50', text: 'text-status-success', icon: <img src={recordIcon} width="20" height="20" alt="flag" /> },
  profile: { color: 'bg-status-regular', light: 'bg-yellow-50', text: 'text-status-regular', icon: <img src={userIcon} width="20" height="20" alt="user" /> },
}

const ACTION_LABELS = {
  LOGIN: 'Login',
  LOGOUT: 'Logout',
  ALERTA_DISPARADO: 'Alerta Disparado',
  OCORRENCIA_CRIADA: 'Ocorrência Criada',
  OCORRENCIA_ATUALIZADA: 'Ocorrência Atualizada',
  PERFIL_EDITADO: 'Perfil Editado',
}

function formatDate(iso) {
  return new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
}

export default function Auditoria() {
  const [filterType, setFilterType] = useState('all')
  const [filterUser, setFilterUser] = useState('all')
  const [search, setSearch] = useState('')

  const users = useMemo(() => [...new Set(LOG_ENTRIES.map((e) => e.user))], [])

  const filtered = useMemo(() => {
    return LOG_ENTRIES.filter((e) => {
      if (filterType !== 'all' && e.type !== filterType) return false
      if (filterUser !== 'all' && e.user !== filterUser) return false
      if (search) {
        const q = search.toLowerCase()
        if (!e.action.toLowerCase().includes(q) && !e.user.toLowerCase().includes(q) && !e.detail.toLowerCase().includes(q)) return false
      }
      return true
    }).sort((a, b) => new Date(b.at) - new Date(a.at))
  }, [filterType, filterUser, search])

  return (
    <div className="p-8 space-y-6 animate-fade-in">
      {/* Summary */}
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'TOTAL DE EVENTOS', value: LOG_ENTRIES.length, color: 'text-text-main' },
          { label: 'ALERTAS', value: LOG_ENTRIES.filter((e) => e.type === 'alert').length, color: 'text-status-critical' },
          { label: 'REGISTROS', value: LOG_ENTRIES.filter((e) => e.type === 'record').length, color: 'text-status-success' },
          { label: 'OPERADORES', value: users.length, color: 'text-status-severe' },
        ].map((s) => (
          <Card key={s.label} className="py-4 text-center">
            <p className="text-label text-slate-500 mb-1">{s.label}</p>
            <p className={`text-3xl font-bold ${s.color}`}>{s.value}</p>
          </Card>
        ))}
      </div>

      {/* Filters */}
      <Card className="p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-border-soft flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[200px]">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.4" />
              <path d="M10.5 10.5L13.5 13.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
            <input
              className="input-field pl-9"
              placeholder="Buscar ação, usuário, detalhe..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select className="select-field w-auto" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
            <option value="all">Todos os Tipos</option>
            <option value="auth">Autenticação</option>
            <option value="alert">Alertas</option>
            <option value="record">Ocorrências</option>
            <option value="profile">Perfil</option>
          </select>
          <span className="text-xs text-slate-400 ml-auto">{filtered.length} evento(s)</span>
        </div>

        {/* Timeline */}
        <div className="px-6 py-4">
          <div className="relative">
            {/* Vertical line */}
            <div className="absolute left-[19px] top-0 bottom-0 w-px bg-border-soft" />

            <div className="space-y-4">
              {filtered.length === 0 ? (
                <p className="text-center text-slate-400 py-8 text-sm">Nenhum evento encontrado.</p>
              ) : (
                filtered.map((entry) => {
                  const cfg = TYPE_CONFIG[entry.type]
                  return (
                    <div key={entry.id} className="flex gap-4 relative">
                      {/* Dot */}
                      <div className={`w-10 h-10 rounded-full ${cfg.color} flex items-center justify-center flex-shrink-0 z-10 text-base shadow-sm`}>
                        <span>{cfg.icon}</span>
                      </div>

                      {/* Content */}
                      <div className={`flex-1 rounded-lg border border-border-soft ${cfg.light} px-4 py-3`}>
                        <div className="flex items-start justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-xs font-bold ${cfg.text}`}>
                              {ACTION_LABELS[entry.action] || entry.action}
                            </span>
                            <span className="text-xs text-slate-500">por <strong className="text-slate-700">{entry.user}</strong></span>
                            <span className="text-[10px] text-slate-400 bg-white border border-border-soft rounded px-1.5 py-0.5">{entry.role}</span>
                          </div>
                          <div className="flex items-center gap-2 text-[11px] text-slate-400">
                            <span>{formatDate(entry.at)}</span>
                            <span className="font-mono bg-white border border-border-soft rounded px-1.5 py-0.5">{entry.ip}</span>
                          </div>
                        </div>
                        <p className="text-sm text-slate-600 mt-1">{entry.detail}</p>
                      </div>
                    </div>
                  )
                })
              )}
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}