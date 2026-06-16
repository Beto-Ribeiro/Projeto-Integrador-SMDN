import { useEffect, useMemo, useState } from 'react'
import Card from '../components/Card'
import authIcon from '../assets/menu/inativo/lock.svg'
import alertIcon from '../assets/auditoria/alert-triangle.svg'
import recordIcon from '../assets/auditoria/flag.svg'
import userIcon from '../assets/auditoria/user.svg'
import { listAuditEvents } from '../services/auditService.js'

const TYPE_CONFIG = {
  auth: { color: 'bg-text-main', light: 'bg-blue-50', text: 'text-text-main', icon: <img src={authIcon} width="20" height="20" alt="lock" /> },
  alert: { color: 'bg-status-critical', light: 'bg-red-50', text: 'text-status-critical', icon: <img src={alertIcon} width="20" height="20" alt="alerta" /> },
  record: { color: 'bg-status-success', light: 'bg-green-50', text: 'text-status-success', icon: <img src={recordIcon} width="20" height="20" alt="registro" /> },
  profile: { color: 'bg-status-regular', light: 'bg-yellow-50', text: 'text-status-regular', icon: <img src={userIcon} width="20" height="20" alt="perfil" /> },
}

function formatDate(iso) {
  if (!iso) return '—'
  return new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
}

export default function Auditoria() {
  const [entries, setEntries] = useState([])
  const [filterType, setFilterType] = useState('all')
  const [search, setSearch] = useState('')
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  async function loadAudit() {
    setLoading(true)
    setError('')

    try {
      const data = await listAuditEvents()
      setEntries(data)
    } catch (err) {
      setError(err.message || 'Não foi possível carregar auditoria.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadAudit()
  }, [])

  const users = useMemo(() => [...new Set(entries.map((entry) => entry.user).filter(Boolean))], [entries])

  const filtered = useMemo(() => {
    return entries.filter((entry) => {
      if (filterType !== 'all' && entry.type !== filterType) return false
      if (search) {
        const q = search.toLowerCase()
        const content = [entry.action, entry.actionLabel, entry.user, entry.detail, entry.role].join(' ').toLowerCase()
        if (!content.includes(q)) return false
      }
      return true
    })
  }, [entries, filterType, search])

  const stats = useMemo(() => ({
    total: entries.length,
    alerts: entries.filter((entry) => entry.type === 'alert').length,
    records: entries.filter((entry) => entry.type === 'record' || entry.type === 'profile').length,
    operators: users.length,
  }), [entries, users])

  return (
    <div className="p-8 space-y-6 animate-fade-in">
      <div className="grid grid-cols-4 gap-4">
        {[
          { label: 'TOTAL DE EVENTOS', value: stats.total, color: 'text-text-main' },
          { label: 'ALERTAS', value: stats.alerts, color: 'text-status-critical' },
          { label: 'REGISTROS', value: stats.records, color: 'text-status-success' },
          { label: 'OPERADORES', value: stats.operators, color: 'text-status-severe' },
        ].map((stat) => (
          <Card key={stat.label} className="py-4 text-center">
            <p className="text-label text-slate-500 mb-1">{stat.label}</p>
            <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
          </Card>
        ))}
      </div>

      {error && <div className="rounded-2xl border border-red-100 bg-red-50 px-5 py-4 text-sm text-red-700">{error}</div>}

      <Card className="p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-border-soft flex flex-wrap gap-3 items-center">
          <div className="relative flex-1 min-w-[240px]">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.4" />
              <path d="M10.5 10.5L13.5 13.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
            <input className="input-field pl-9" placeholder="Buscar ação, usuário, detalhe..." value={search} onChange={(e) => setSearch(e.target.value)} />
          </div>

          <select className="select-field w-auto" value={filterType} onChange={(e) => setFilterType(e.target.value)}>
            <option value="all">Todos os Tipos</option>
            <option value="auth">Autenticação</option>
            <option value="alert">Alertas</option>
            <option value="record">Registros</option>
            <option value="profile">Perfil</option>
          </select>

          <button onClick={loadAudit} className="rounded-xl px-4 py-2 text-sm font-semibold bg-slate-100 text-slate-600 hover:bg-slate-200 transition-all">Atualizar</button>
          <span className="text-xs text-slate-400 ml-auto">{filtered.length} evento(s)</span>
        </div>

        <div className="px-6 py-4">
          <div className="relative">
            <div className="absolute left-[19px] top-0 bottom-0 w-px bg-border-soft" />
            <div className="space-y-4">
              {loading ? (
                <p className="text-center text-slate-400 py-8 text-sm">Carregando auditoria...</p>
              ) : filtered.length === 0 ? (
                <p className="text-center text-slate-400 py-8 text-sm">Nenhum evento encontrado.</p>
              ) : (
                filtered.map((entry) => {
                  const cfg = TYPE_CONFIG[entry.type] || TYPE_CONFIG.record
                  return (
                    <div key={entry.id} className="flex gap-4 relative">
                      <div className={`w-10 h-10 rounded-full ${cfg.color} flex items-center justify-center flex-shrink-0 z-10 text-base shadow-sm`}>
                        <span>{cfg.icon}</span>
                      </div>
                      <div className={`flex-1 rounded-lg border border-border-soft ${cfg.light} px-4 py-3`}>
                        <div className="flex items-start justify-between gap-2 flex-wrap">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className={`text-xs font-bold ${cfg.text}`}>{entry.actionLabel || entry.action}</span>
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
