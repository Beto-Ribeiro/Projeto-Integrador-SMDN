import { useEffect, useMemo, useState } from 'react'
import Card from '../components/Card'
import Modal from '../components/Modal'
import {
  formatOccurrenceDate,
  getOcorrenciasData,
  subscribeOcorrenciasChanges,
  updateOcorrenciaStatus,
} from '../services/ocorrenciasService.js'

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

const STATUS_OPTIONS = [
  { value: 'active', label: 'Ativa' },
  { value: 'monitoring', label: 'Monitorando' },
  { value: 'resolved', label: 'Resolvida' },
]

export default function Ocorrencias() {
  const [search, setSearch] = useState('')
  const [filterSeverity, setFilterSeverity] = useState('all')
  const [filterStatus, setFilterStatus] = useState('all')
  const [filterCity, setFilterCity] = useState('all')
  const [selected, setSelected] = useState(null)
  const [statusDraft, setStatusDraft] = useState('active')
  const [savingStatus, setSavingStatus] = useState(false)
  const [notice, setNotice] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(true)
  const [data, setData] = useState({
    stats: { active: 0, monitoring: 0, resolved: 0 },
    items: [],
  })

  async function loadOcorrencias() {
    try {
      setError('')
      const result = await getOcorrenciasData()
      setData(result)
    } catch (err) {
      setError(err.message || 'Não foi possível carregar ocorrências.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadOcorrencias()
    return subscribeOcorrenciasChanges(loadOcorrencias)
  }, [])

  useEffect(() => {
    if (selected) {
      setStatusDraft(selected.status || 'active')
    }
  }, [selected])

  const cities = useMemo(() => {
    return [...new Set(data.items.map((item) => item.city).filter(Boolean))]
  }, [data.items])

  const filtered = useMemo(() => {
    return data.items.filter((item) => {
      if (filterSeverity !== 'all' && item.severity !== filterSeverity) return false
      if (filterStatus !== 'all' && item.status !== filterStatus) return false
      if (filterCity !== 'all' && item.city !== filterCity) return false

      if (search) {
        const q = search.toLowerCase()
        const haystack = [
          item.id,
          item.type,
          item.city,
          item.neighborhood,
          item.riskLabel,
          item.citizenName,
        ]
          .filter(Boolean)
          .join(' ')
          .toLowerCase()

        if (!haystack.includes(q)) return false
      }

      return true
    })
  }, [data.items, filterSeverity, filterStatus, filterCity, search])

  async function handleStatusUpdate() {
    if (!selected) return

    setSavingStatus(true)
    setError('')
    setNotice('')

    try {
      await updateOcorrenciaStatus({ relatoId: selected.relatoId, status: statusDraft })
      await loadOcorrencias()
      setSelected((current) => current ? { ...current, status: statusDraft } : current)
      setNotice('Status da ocorrência atualizado.')
      setTimeout(() => setNotice(''), 3500)
    } catch (err) {
      setError(err.message || 'Não foi possível atualizar o status.')
    } finally {
      setSavingStatus(false)
    }
  }

  return (
    <div className="p-8 space-y-6 animate-fade-in h-full overflow-hidden flex flex-col">
      <div className="grid grid-cols-3 gap-4 flex-shrink-0">
        <Card className="flex items-center gap-4 py-4">
          <div className="w-10 h-10 rounded-xl bg-status-critical-bg flex items-center justify-center">
            <span className="w-3 h-3 rounded-full bg-status-critical animate-pulse2 block" />
          </div>
          <div>
            <p className="text-label text-slate-500">ATIVAS</p>
            <p className="text-2xl font-bold text-status-critical">{data.stats.active}</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4 py-4">
          <div className="w-10 h-10 rounded-xl bg-status-regular-bg flex items-center justify-center">
            <span className="w-3 h-3 rounded-full bg-status-regular block" />
          </div>
          <div>
            <p className="text-label text-slate-500">MONITORANDO</p>
            <p className="text-2xl font-bold text-status-regular">{data.stats.monitoring}</p>
          </div>
        </Card>

        <Card className="flex items-center gap-4 py-4">
          <div className="w-10 h-10 rounded-xl bg-status-success-bg flex items-center justify-center">
            <span className="w-3 h-3 rounded-full bg-status-success block" />
          </div>
          <div>
            <p className="text-label text-slate-500">RESOLVIDAS</p>
            <p className="text-2xl font-bold text-status-success">{data.stats.resolved}</p>
          </div>
        </Card>
      </div>

      {notice && (
        <div className="rounded-lg border border-green-100 bg-green-50 px-4 py-3 text-sm font-semibold text-green-700 flex-shrink-0">
          {notice}
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-red-100 bg-red-50 px-4 py-3 text-sm font-semibold text-red-700 flex-shrink-0">
          {error}
        </div>
      )}

      <Card className="p-0 overflow-hidden flex-1 min-h-0 flex flex-col">
        <div className="px-6 py-4 border-b border-border-soft overflow-x-auto flex-shrink-0">
          <div className="flex items-center gap-3 min-w-[920px]">
            <div className="relative flex-1 min-w-0">
              <svg className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" width="16" height="16" viewBox="0 0 16 16" fill="none">
                <circle cx="7" cy="7" r="4.5" stroke="currentColor" strokeWidth="1.4" />
                <path d="M10.5 10.5L13.5 13.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" />
              </svg>
              <input
                className="input-field pl-9 w-full"
                placeholder="Buscar por tipo, município, cidadão, nível..."
                value={search}
                onChange={(event) => setSearch(event.target.value)}
              />
            </div>

            <select className="select-field w-[150px] flex-shrink-0" value={filterSeverity} onChange={(event) => setFilterSeverity(event.target.value)}>
              <option value="all">Toda Severidade</option>
              <option value="critical">Crítico</option>
              <option value="severe">Grave</option>
              <option value="regular">Moderado</option>
            </select>

            <select className="select-field w-[135px] flex-shrink-0" value={filterStatus} onChange={(event) => setFilterStatus(event.target.value)}>
              <option value="all">Todo Status</option>
              <option value="active">Ativa</option>
              <option value="monitoring">Monitorando</option>
              <option value="resolved">Resolvida</option>
            </select>

            <select className="select-field w-[170px] flex-shrink-0" value={filterCity} onChange={(event) => setFilterCity(event.target.value)}>
              <option value="all">Todos Municípios</option>
              {cities.map((city) => <option key={city}>{city}</option>)}
            </select>

            <span className="text-xs text-slate-400 whitespace-nowrap flex-shrink-0">
              {loading ? 'Carregando...' : `${filtered.length} resultado(s)`}
            </span>
          </div>
        </div>

        <div className="overflow-auto flex-1 min-h-0">
          <table className="w-full text-sm">
            <thead className="sticky top-0 z-10">
              <tr className="border-b border-border-soft bg-slate-50">
                {['ID', 'Tipo', 'Município / Bairro', 'Severidade', 'Status', 'Data', ''].map((heading) => (
                  <th key={heading} className="px-5 py-3 text-left text-label text-slate-500 font-bold whitespace-nowrap">
                    {heading}
                  </th>
                ))}
              </tr>
            </thead>

            <tbody>
              {filtered.length === 0 && !loading ? (
                <tr>
                  <td colSpan={7} className="px-5 py-10 text-center text-slate-400 text-sm">
                    Nenhuma ocorrência encontrada.
                  </td>
                </tr>
              ) : (
                filtered.map((item) => {
                  const severity = SEVERITY_MAP[item.severity] || SEVERITY_MAP.regular
                  const status = STATUS_MAP[item.status] || STATUS_MAP.active

                  return (
                    <tr key={item.relatoId} className="border-b border-border-soft hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3 font-mono text-xs text-slate-500">{item.id}</td>
                      <td className="px-5 py-3 font-semibold text-slate-800">{item.type}</td>
                      <td className="px-5 py-3">
                        <span className="text-slate-700">{item.city}</span>
                        <span className="text-slate-400 text-xs block">{item.neighborhood}</span>
                      </td>
                      <td className="px-5 py-3"><span className={severity.cls}>{severity.label}</span></td>
                      <td className="px-5 py-3">
                        <span className={`inline-flex items-center gap-1.5 border text-xs font-bold px-2.5 py-0.5 rounded-badge ${status.cls}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                          {status.label}
                        </span>
                      </td>
                      <td className="px-5 py-3 text-slate-500 text-xs whitespace-nowrap">{formatOccurrenceDate(item.reportedAt)}</td>
                      <td className="px-5 py-3">
                        <button
                          onClick={() => setSelected(item)}
                          className="text-text-main text-xs font-semibold hover:underline"
                        >
                          Ver detalhes
                        </button>
                      </td>
                    </tr>
                  )
                })
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal isOpen={!!selected} onClose={() => setSelected(null)} title={`Ocorrência ${selected?.id || ''}`} size="md">
        {selected && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-lg text-slate-800">{selected.type}</span>
              <span className={SEVERITY_MAP[selected.severity]?.cls || SEVERITY_MAP.regular.cls}>
                {SEVERITY_MAP[selected.severity]?.label || 'Moderado'}
              </span>
              <span className={`inline-flex items-center gap-1.5 border text-xs font-bold px-2.5 py-0.5 rounded-badge ${(STATUS_MAP[selected.status] || STATUS_MAP.active).cls}`}>
                <span className={`w-1.5 h-1.5 rounded-full ${(STATUS_MAP[selected.status] || STATUS_MAP.active).dot}`} />
                {(STATUS_MAP[selected.status] || STATUS_MAP.active).label}
              </span>
            </div>

            {selected.photoUrl && (
              <img
                src={selected.photoUrl}
                alt="Foto da ocorrência"
                className="w-full max-h-64 object-cover rounded-xl border border-border-soft"
              />
            )}

            <dl className="grid grid-cols-2 gap-x-6 gap-y-3 text-sm">
              <div><dt className="text-label text-slate-400">MUNICÍPIO</dt><dd className="text-slate-700 font-medium mt-0.5">{selected.city}</dd></div>
              <div><dt className="text-label text-slate-400">BAIRRO</dt><dd className="text-slate-700 font-medium mt-0.5">{selected.neighborhood}</dd></div>
              <div><dt className="text-label text-slate-400">DATA DE REGISTRO</dt><dd className="text-slate-700 font-medium mt-0.5">{formatOccurrenceDate(selected.reportedAt)}</dd></div>
              <div><dt className="text-label text-slate-400">CIDADÃO</dt><dd className="text-slate-700 font-medium mt-0.5">{selected.citizenName}</dd></div>
              <div><dt className="text-label text-slate-400">NÍVEL INFORMADO</dt><dd className="text-slate-700 font-medium mt-0.5">{selected.riskLabel}</dd></div>
              <div><dt className="text-label text-slate-400">LOCALIZAÇÃO</dt><dd className="text-slate-700 font-medium mt-0.5">{Number.isFinite(selected.lat) && Number.isFinite(selected.lng) ? `${selected.lat.toFixed(5)}, ${selected.lng.toFixed(5)}` : 'Não informada'}</dd></div>
            </dl>

            <div>
              <p className="text-label text-slate-400 mb-1">DESCRIÇÃO</p>
              <p className="text-sm text-slate-700 bg-slate-50 rounded-lg p-3 border border-border-soft">{selected.description}</p>
            </div>

            <div className="rounded-xl border border-border-soft bg-slate-50 p-3">
              <label className="block text-label text-slate-500 mb-1.5">ATUALIZAR STATUS</label>
              <div className="flex gap-3">
                <select
                  className="select-field flex-1"
                  value={statusDraft}
                  onChange={(event) => setStatusDraft(event.target.value)}
                >
                  {STATUS_OPTIONS.map((option) => (
                    <option key={option.value} value={option.value}>{option.label}</option>
                  ))}
                </select>
                <button
                  className="btn-primary"
                  disabled={savingStatus}
                  onClick={handleStatusUpdate}
                >
                  {savingStatus ? 'Salvando...' : 'Salvar Status'}
                </button>
              </div>
            </div>

            <div className="flex justify-end gap-3 pt-2 border-t border-border-soft">
              <button className="btn-ghost" onClick={() => setSelected(null)}>Fechar</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
