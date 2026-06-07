import { useState } from 'react'
import Card from '../components/Card'
import Modal from '../components/Modal'
import MapView from '../components/MapView'

const ALERT_TYPES = ['Enchente', 'Deslizamento', 'Temporal', 'Tornado']
const CITIES = ['São José dos Campos', 'Taubaté', 'Caraguatatuba', 'Jacareí', 'Pindamonhangaba', 'Guaratinguetá']
const SEVERITIES = ['critical', 'severe', 'regular']

const MOCK_ALERTS = [
  {
    id: 1,
    type: 'Enchente',
    description: 'Transbordamento do Rio Paraíba do Sul afetando bairros ribeirinhos.',
    city: 'São José dos Campos',
    severity: 'critical',
    sentAt: '2025-01-10T08:20:00',
    recipients: 3200,
    operator: 'Carlos Mendes',
  },
  {
    id: 2,
    type: 'Deslizamento',
    description: 'Risco de deslizamento na Serra da Mantiqueira após chuvas fortes.',
    city: 'Caraguatatuba',
    severity: 'severe',
    sentAt: '2025-01-10T07:40:00',
    recipients: 1100,
    operator: 'Ana Souza',
  },
  {
    id: 3,
    type: 'Temporal',
    description: 'Previsão de granizo e ventos fortes para as próximas 3 horas.',
    city: 'Taubaté',
    severity: 'regular',
    sentAt: '2025-01-10T06:55:00',
    recipients: 820,
    operator: 'Carlos Mendes',
  },
  {
    id: 4,
    type: 'Enchente',
    description: 'Alagamento em vias do centro após enxurrada.',
    city: 'Pindamonhangaba',
    severity: 'severe',
    sentAt: '2025-01-09T18:30:00',
    recipients: 980,
    operator: 'Ana Souza',
  },
]

const SEVERITY_MAP = {
  critical: { label: 'Crítico', cls: 'badge-critical' },
  severe: { label: 'Grave', cls: 'badge-severe' },
  regular: { label: 'Moderado', cls: 'badge-regular' },
}

function formatDate(iso) {
  const d = new Date(iso)
  return d.toLocaleString('pt-BR', { day: '2-digit', month: '2-digit', year: 'numeric', hour: '2-digit', minute: '2-digit' })
}

export default function Reportar() {
  const [alerts] = useState(MOCK_ALERTS)
  const [filterSeverity, setFilterSeverity] = useState('')
  const [filterCity, setFilterCity] = useState('')
  const [filterDate, setFilterDate] = useState('')
  const [filterOperator, setFilterOperator] = useState('')
  const [isModalOpen, setIsModalOpen] = useState(false)
  const [form, setForm] = useState({ type: '', city: '', severity: 'critical', description: '', neighborhood: '' })
  const [successMsg, setSuccessMsg] = useState(false)
  const [isMapOpen, setIsMapOpen] = useState(false)
  const [autoFilled, setAutoFilled] = useState(false)

  const handleDispatch = () => {
    // TODO: Supabase insert + send push notifications
    setIsModalOpen(false)
    setSuccessMsg(true)
    setForm({ type: '', city: '', severity: 'critical', description: '', neighborhood: '' })
    setTimeout(() => setSuccessMsg(false), 4000)
  }

  const handleMapClick = async (lat, lng) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`
      )

      const data = await response.json()

      const city =
        data.address?.city ||
        data.address?.town ||
        data.address?.municipality ||
        data.address?.village ||
        ''

      const neighborhood =
        data.address?.suburb ||
        data.address?.neighbourhood ||
        data.address?.quarter ||
        ''

      setForm((prev) => ({
        ...prev,
        city,
        neighborhood,
      }))

      setAutoFilled(true)
      setIsMapOpen(false)
    } catch (error) {
      console.error('Erro ao localizar endereço:', error)
    }
  }

  const filteredAlerts = alerts.filter((alert) => {
    const matchesSeverity =
      !filterSeverity || alert.severity === filterSeverity

    const matchesCity =
      !filterCity ||
      alert.city.toLowerCase().includes(filterCity.toLowerCase())

    const matchesOperator =
      !filterOperator ||
      alert.operator.toLowerCase().includes(filterOperator.toLowerCase())

    const matchesDate =
      !filterDate ||
      alert.sentAt.slice(0, 10) === filterDate

    return (
      matchesSeverity &&
      matchesCity &&
      matchesOperator &&
      matchesDate
    )
  })

  return (
    <div className="p-8 space-y-6 animate-fade-in">
      {/* Header + Stats row */}
      <div className="flex items-center justify-between gap-6">
        {/* Title */}
        <div className="shrink-0">
        </div>
        <div className="px-6 py-4 border-b border-border-soft">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-3">

            <select
              className="select-field"
              value={filterSeverity}
              onChange={(e) => setFilterSeverity(e.target.value)}
            >
              <option value="">Todas Severidades</option>
              <option value="critical">Crítico</option>
              <option value="severe">Grave</option>
              <option value="regular">Moderado</option>
            </select>

            <input
              type="text"
              className="input-field"
              placeholder="Pesquisar cidade..."
              value={filterCity}
              onChange={(e) => setFilterCity(e.target.value)}
            />

            <input
              type="text"
              className="input-field"
              placeholder="Pesquisar operador..."
              value={filterOperator}
              onChange={(e) => setFilterOperator(e.target.value)}
            />
          </div>
        </div>
        {/* Stats inline */}
        <div className="flex items-center gap-4 flex-1 justify-end">
          <Card className="text-center py-3 px-5">
            <p className="text-label text-slate-500 mb-1">ALERTAS HOJE</p>
            <p className="text-3xl font-bold text-text-main">3</p>
          </Card>
          <Card className="text-center py-3 px-5">
            <p className="text-label text-slate-500 mb-1">TOTAL DESTINATÁRIOS</p>
            <p className="text-3xl font-bold text-status-severe">5.550</p>
          </Card>

          {/* Big bell button */}
          <button
            className="flex flex-col items-center justify-center gap-1 bg-red-500 hover:bg-red-600 active:scale-95 transition-all rounded-2xl w-24 h-24 shadow-lg text-white shrink-0"
            onClick={() => setIsModalOpen(true)}
          >
            <svg width="36" height="36" viewBox="0 0 24 24" fill="none">
              <path
                d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"
                stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"
              />
              <path d="M13.73 21a2 2 0 0 1-3.46 0" stroke="white" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
            <span className="text-xs font-bold leading-tight text-center">Disparar<br />Alerta</span>
          </button>
        </div>
      </div>

      {/* Success toast */}
      {successMsg && (
        <div className="flex items-center gap-3 bg-status-success-bg border border-status-success/30 text-status-success font-semibold text-sm px-4 py-3 rounded-lg animate-slide-up">
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none">
            <circle cx="9" cy="9" r="7" fill="currentColor" opacity=".15" />
            <path d="M5.5 9l2.5 2.5 5-5" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          Alerta disparado com sucesso!
        </div>
      )}

      {/* History */}
      <Card className="p-0 overflow-hidden">
        <div className="px-6 py-4 border-b border-border-soft flex items-center justify-between">
          <h3 className="text-card-title font-bold text-slate-800">Histórico de Alertas</h3>
        </div>

        <div className="divide-y divide-border-soft">
          {filteredAlerts.map((alert) => (
            <div key={alert.id} className="px-6 py-4 hover:bg-slate-50 transition-colors">
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap mb-1">
                    <span className="font-bold text-slate-800">{alert.type}</span>
                    <span className={SEVERITY_MAP[alert.severity].cls}>{SEVERITY_MAP[alert.severity].label}</span>
                    <span className="text-xs text-slate-400">• {alert.city}</span>
                  </div>
                  <p className="text-sm text-slate-600 mb-2">{alert.description}</p>
                  <div className="flex items-center gap-4 text-xs text-slate-400">
                    <span className="flex items-center gap-1">
                      <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><rect x="2" y="3" width="12" height="11" rx="1.5" stroke="currentColor" strokeWidth="1.4" /><path d="M5 1.5V4M11 1.5V4" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /><path d="M2 7h12" stroke="currentColor" strokeWidth="1.4" /></svg>
                      {formatDate(alert.sentAt)}
                    </span>
                    <span className="flex items-center gap-1">
                      <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><circle cx="8" cy="5" r="3" stroke="currentColor" strokeWidth="1.4" /><path d="M2 13.5c0-2.485 2.686-4.5 6-4.5s6 2.015 6 4.5" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>
                      {alert.operator}
                    </span>
                    <span className="flex items-center gap-1">
                      <svg width="12" height="12" viewBox="0 0 16 16" fill="none"><rect x="4" y="1" width="8" height="14" rx="1.5" stroke="currentColor" strokeWidth="1.4" /><path d="M7 12.5h2" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" /></svg>
                      {alert.recipients.toLocaleString('pt-BR')} destinatários
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Dispatch Modal */}
      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title="Disparar Novo Alerta" size="md">
        <div className="space-y-4">
          <div>
            <label className="block text-label text-slate-600 mb-1.5">TIPO DE OCORRÊNCIA</label>
            <select
              className="select-field"
              value={form.type}
              onChange={(e) => setForm((f) => ({ ...f, type: e.target.value }))}
            >
              <option value="">Selecione o tipo...</option>
              {ALERT_TYPES.map((t) => <option key={t}>{t}</option>)}
            </select>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-label text-slate-600 mb-1.5">
                MUNICÍPIO
              </label>

              <input
                className={`input-field ${autoFilled
                  ? 'border border-[#597891] ring-1 ring-[#597891]/20'
                  : ''
                  }`}
                placeholder="Município será preenchido pelo mapa"
                value={form.city}
                onChange={(e) => {
                  setAutoFilled(false)
                  setForm((f) => ({
                    ...f,
                    city: e.target.value,
                  }))
                }}
              />
            </div>
            <div>
              <label className="block text-label text-slate-600 mb-1.5">SEVERIDADE</label>
              <select
                className="select-field"
                value={form.severity}
                onChange={(e) => setForm((f) => ({ ...f, severity: e.target.value }))}
              >
                {SEVERITIES.map((s) => (
                  <option key={s} value={s}>{SEVERITY_MAP[s].label}</option>
                ))}
              </select>
            </div>
          </div>
          <div>
            <label className="block text-label text-slate-600 mb-1.5">BAIRRO / ÁREA (opcional)</label>
            <input
              className={`input-field ${autoFilled
                ? 'border border-[#597891] ring-1 ring-[#597891]/20'
                : ''
                }`}
              placeholder="Ex: Centro, Vila Nova..."
              value={form.neighborhood}
              onChange={(e) => {
                setAutoFilled(false)
                setForm((f) => ({
                  ...f,
                  neighborhood: e.target.value,
                }))
              }}
            />
          </div>

          <button
            className="w-full py-3 bg-[#597891] hover:bg-[#2D5A87] text-white font-semibold rounded-lg transition-colors"
            onClick={() => setIsMapOpen(true)}
          >
            Localizar Área no Mapa
          </button>

          <Modal
            isOpen={isMapOpen}
            onClose={() => setIsMapOpen(false)}
            title="Localizar Área"
            size="xl"
          >
            <div className="h-[500px] rounded-lg overflow-hidden">
              <MapView onMapClick={handleMapClick} />
            </div>
          </Modal>

          <div>
            <label className="block text-label text-slate-600 mb-1.5">MENSAGEM DO ALERTA</label>
            <textarea
              className="input-field resize-none"
              rows={3}
              placeholder="Descreva a situação e orientações para os cidadãos..."
              value={form.description}
              onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
            />
          </div>

          <div className="flex items-center justify-end gap-3 pt-2 border-t border-border-soft">
            <button className="btn-ghost" onClick={() => setIsModalOpen(false)}>Cancelar</button>
            <button
              className="btn-primary"
              onClick={handleDispatch}
              disabled={!form.type || !form.city}
            >
              Confirmar Disparo
            </button>
          </div>
        </div>
      </Modal>
    </div>
  )
}