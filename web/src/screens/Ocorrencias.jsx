import { useState, useMemo } from 'react'
import Card from '../components/Card'
import Modal from '../components/Modal'

const ALL_OCORRENCIAS = [
  { id: 'OC-001', type: 'Enchente', city: 'São José dos Campos', neighborhood: 'Jardim Aquarius', severity: 'critical', status: 'active', reportedAt: '2025-01-10T08:10:00', operator: 'Carlos Mendes', description: 'Rua inundada, famílias precisam de evacuação.' },
  { id: 'OC-002', type: 'Deslizamento', city: 'Caraguatatuba', neighborhood: 'Pegorelli', severity: 'severe', status: 'active', reportedAt: '2025-01-10T07:35:00', operator: 'Ana Souza', description: 'Talude instável após 80mm de chuva.' },
  { id: 'OC-004', type: 'Incêndio', city: 'Jacareí', neighborhood: 'Vila Industrial', severity: 'severe', status: 'active', reportedAt: '2025-01-09T22:00:00', operator: 'Carlos Mendes', description: 'Incêndio em vegetação, vento forte dispersando chamas.' },
  { id: 'OC-005', type: 'Temporal', city: 'Guaratinguetá', neighborhood: 'Santa Luzia', severity: 'regular', status: 'monitoring', reportedAt: '2025-01-09T20:45:00', operator: 'Ana Souza', description: 'Acumulado de chuva dentro do previsto, vias transitáveis.' },
  { id: 'OC-006', type: 'Desabamento', city: 'Pindamonhangaba', neighborhood: 'Residencial Sul', severity: 'critical', status: 'resolved', reportedAt: '2025-01-09T18:00:00', operator: 'Roberto Lima', description: 'Muro residencial desabou, sem vítimas.' },
  { id: 'OC-007', type: 'Enchente', city: 'Taubaté', neighborhood: 'Bom Retiro', severity: 'severe', status: 'monitoring', reportedAt: '2025-01-09T15:30:00', operator: 'Carlos Mendes', description: 'Nível do córrego em elevação, monitorando.' },
]

const SEVERITY_MAP = {
  critical: { label: 'Crítico', cls: 'badge-critical' },
  severe: { label: 'Grave', cls: 'badge-severe' },
  regular: { label: 'Moderado', cls: 'badge-regular' },
}

const STATUS_MAP = {
  active: { label: 'Ativa', dot: 'bg-status-critical', cls: 'text-status-critical bg-status-critical-bg border-status-critical/20' },
  monitoring: { label: 'Monitorando', dot: 'bg-status-regular', cls: 'text-status-regular bg-status-regular-bg border-status-regular/20' },
  resolved: { label: 'Resolvida', dot: 'bg-status-success', cls: 'text-status-success bg-status-success-bg border-status-success/20' },
}

function formatDate(iso) {
  return new Date(iso).toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default function Ocorrencias() {
  const [search, setSearch] = useState('')
  const [filterSeverity, setFilterSeverity] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterCity, setFilterCity] = useState('all')
  const [selected, setSelected] = useState(null)

  const cities = useMemo(() => [...new Set(ALL_OCORRENCIAS.map((o) => o.city))], [])

  const filtered = useMemo(() => {
    return ALL_OCORRENCIAS.filter((o) => {
      if (filterSeverity !== 'all' && o.severity !== filterSeverity) return false
      if (filterStatus !== 'all' && o.status !== filterStatus) return false
      if (filterCity !== 'all' && o.city !== filterCity) return false
      if (search) {
        const q = search.toLowerCase()
        if (!o.type.toLowerCase().includes(q) && !o.city.toLowerCase().includes(q) && !o.neighborhood.toLowerCase().includes(q) && !o.id.toLowerCase().includes(q)) return false
      }
      return true
    })
  }, [search, filterSeverity, filterStatus, filterCity])

  const stats = useMemo(() => ({
    active: ALL_OCORRENCIAS.filter((o) => o.status === 'active').length,
    monitoring: ALL_OCORRENCIAS.filter((o) => o.status === 'monitoring').length,
    resolved: ALL_OCORRENCIAS.filter((o) => o.status === 'resolved').length,
  }), [])

  return (
    <div className="p-8 space-y-6 animate-fade-in">
      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        <Card className="flex items-center gap-4 py-4">
          <div className="w-10 h-10 rounded-xl bg-status-critical-bg flex items-center justify-center">
            <span className="w-3 h-3 rounded-full bg-status-critical animate-pulse2 block" />
          </div>
          <div>
            <p className="text-label text-slate-500">ATIVAS</p>
            <p className="text-2xl font-bold text-status-critical">{stats.active}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4 py-4">
          <div className="w-10 h-10 rounded-xl bg-status-regular-bg flex items-center justify-center">
            <span className="w-3 h-3 rounded-full bg-status-regular block" />
          </div>
          <div>
            <p className="text-label text-slate-500">MONITORANDO</p>
            <p className="text-2xl font-bold text-status-regular">{stats.monitoring}</p>
          </div>
        </Card>
        <Card className="flex items-center gap-4 py-4">
          <div className="w-10 h-10 rounded-xl bg-status-success-bg flex items-center justify-center">
            <span className="w-3 h-3 rounded-full bg-status-success block" />
          </div>
          <div>
            <p className="text-label text-slate-500">RESOLVIDAS</p>
            <p className="text-2xl font-bold text-status-success">{stats.resolved}</p>
          </div>
        </Card>
      </div>

      {/* Table Card */}
      <Card className="p-0 overflow-hidden">
        {/* Toolbar */}
        <div className="px-6 py-4 border-b border-border-soft flex flex-wrap items-center gap-3">
          <div className="relative flex-1 min-w-[200px]">
            <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" width="16" height="16" viewBox="0 0 16 16" fill="none">
              <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.4" />
              <path d="M10.5 10.5L13.5 13.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
            </svg>
            <input
              className="input-field pl-9"
              placeholder="Buscar por tipo, município, bairro..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
            />
          </div>
          <select className="select-field w-auto" value={filterSeverity} onChange={(e) => setFilterSeverity(e.target.value)}>
            <option value="all">Toda Severidade</option>
            <option value="critical">Crítico</option>
            <option value="severe">Grave</option>
            <option value="regular">Moderado</option>
          </select>
          <select className="select-field w-auto" value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)}>
            <option value="all">Todo Status</option>
            <option value="active">Ativa</option>
            <option value="monitoring">Monitorando</option>
            <option value="resolved">Resolvida</option>
          </select>
          <select className="select-field w-auto" value={filterCity} onChange={(e) => setFilterCity(e.target.value)}>
            <option value="all">Todos Municípios</option>
            {cities.map((c) => <option key={c}>{c}</option>)}
          </select>
          <span className="text-xs text-slate-400 ml-auto">{filtered.length} resultado(s)</span>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-border-soft bg-slate-50">
                {['ID', 'Tipo', 'Município / Bairro', 'Severidade', 'Status', 'Data', 'Operador', ''].map((h) => (
                  <th key={h} className="px-5 py-3 text-left text-label text-slate-500 font-bold whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {filtered.length === 0 ? (
                <tr>
                  <td colSpan={8} className="px-5 py-10 text-center text-slate-400 text-sm">Nenhuma ocorrência encontrada.</td>
                </tr>
              ) : (
                filtered.map((o) => (
                  <tr key={o.id} className="border-b border-border-soft hover:bg-slate-50 transition-colors">
                    <td className="px-5 py-3 font-mono text-xs text-slate-500">{o.id}</td>
                    <td className="px-5 py-3 font-semibold text-slate-800">{o.type}</td>
                    <td className="px-5 py-3">
                      <span className="text-slate-700">{o.city}</span>
                      <span className="text-slate-400 text-xs block">{o.neighborhood}</span>
                    </td>
                    <td className="px-5 py-3"><span className={SEVERITY_MAP[o.severity].cls}>{SEVERITY_MAP[o.severity].label}</span></td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex items-center gap-1.5 border text-xs font-bold px-2.5 py-0.5 rounded-badge ${STATUS_MAP[o.status].cls}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${STATUS_MAP[o.status].dot}`} />
                        {STATUS_MAP[o.status].label}
                      </span>
                    </td>
                    <td className="px-5 py-3 text-slate-500 text-xs whitespace-nowrap">{formatDate(o.reportedAt)}</td>
                    <td className="px-5 py-3 text-slate-600 text-xs">{o.operator}</td>
                    <td className="px-5 py-3">
                      <button
                        onClick={() => setSelected(o)}
                        className="text-text-main text-xs font-semibold hover:underline"
                      >
                        Ver detalhes
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Detail Modal */}
      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title={`Ocorrência ${selected?.id}`} size="md">
        {selected && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="font-bold text-lg text-slate-800">{selected.type}</span>
              <span className={SEVERITY_MAP[selected.severity].cls}>{SEVERITY_MAP[selected.severity].label}</span>
              <span className={`inline-flex items-center gap-1.5 border text-xs font-bold px-2.5 py-0.5 rounded-badge ${STATUS_MAP[selected.status].cls}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${STATUS_MAP[selected.status].dot}`} />
                {STATUS_MAP[selected.status].label}
              </span>
            </div>
            <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <div><dt className="text-label text-slate-400">MUNICÍPIO</dt><dd className="text-slate-700 font-medium mt-0.5">{selected.city}</dd></div>
              <div><dt className="text-label text-slate-400">BAIRRO</dt><dd className="text-slate-700 font-medium mt-0.5">{selected.neighborhood}</dd></div>
              <div><dt className="text-label text-slate-400">DATA DE REGISTRO</dt><dd className="text-slate-700 font-medium mt-0.5">{formatDate(selected.reportedAt)}</dd></div>
              <div><dt className="text-label text-slate-400">OPERADOR</dt><dd className="text-slate-700 font-medium mt-0.5">{selected.operator}</dd></div>
            </dl>
            <div>
              <p className="text-label text-slate-400 mb-1">DESCRIÇÃO</p>
              <p className="text-sm text-slate-700 bg-slate-50 rounded-lg p-3 border border-border-soft">{selected.description}</p>
            </div>
            <div className="flex justify-end gap-3 pt-2 border-t border-border-soft">
              <button className="btn-ghost" onClick={() => setSelected(null)}>Fechar</button>
              <button className="btn-primary">Atualizar Status</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}