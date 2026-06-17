import { useEffect, useMemo, useRef, useState } from 'react'
import Card from '../components/Card'
import Modal from '../components/Modal'
import MapView from '../components/MapView'
import Alert_triangle from '../assets/menu/inativo/alert-triangle.svg'
import Flag from '../assets/menu/inativo/flag.svg'
import Map_pin from '../assets/menu/inativo/map-pin.svg'
import Check from '../assets/menu/inativo/map-pin.svg'
import {
  getDashboardData,
  subscribeDashboardChanges,
} from '../backend/dashboard/dashboardService.js'

const SEVERITY_CONFIG = {
  critical: { label: 'Crítico', cls: 'badge-critical', dotColor: '#c60202' },
  severe: { label: 'Grave', cls: 'badge-severe', dotColor: '#ff6a00' },
  regular: { label: 'Moderado', cls: 'badge-regular', dotColor: '#cab900' },
}

function toMapOcorrencias(ocorrencias) {
  return ocorrencias
    .filter((item) => Number.isFinite(item.lat) && Number.isFinite(item.lng))
    .map((item) => ({
      lat: item.lat,
      lng: item.lng,
      titulo: item.title,
      severidade: SEVERITY_CONFIG[item.severity]?.label || 'Moderado',
    }))
}

function formatFullDate(value) {
  if (!value) return 'Data não informada'

  const date = new Date(value)
  if (Number.isNaN(date.getTime())) return 'Data não informada'

  return date.toLocaleString('pt-BR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export default function Dashboard() {
  const [selectedOcc, setSelectedOcc] = useState(null)
  const [dashboard, setDashboard] = useState({
    stats: {
      activeOccurrences: 0,
      activeAlerts: 0,
      criticalSeverity: 0,
      resolvedToday: 0,
    },
    recentOccurrences: [],
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const [mapMode, setMapMode] = useState('heat')
  const mapRef = useRef(null)

  const mapOccurrences = useMemo(
    () => toMapOcorrencias(dashboard.recentOccurrences),
    [dashboard.recentOccurrences]
  )

  async function loadDashboard() {
    try {
      setError('')
      const data = await getDashboardData()
      setDashboard(data)
    } catch (err) {
      setError(err.message || 'Não foi possível carregar o dashboard.')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    loadDashboard()
    return subscribeDashboardChanges(loadDashboard)
  }, [])

  function handleOccClick(occ) {
    if (Number.isFinite(occ.lat) && Number.isFinite(occ.lng)) {
      mapRef.current?.flyTo(occ.lat, occ.lng, 15)
    }

    setSelectedOcc(occ)
  }

  const statCards = [
    {
      label: 'OCORRÊNCIAS ATIVAS',
      value: dashboard.stats.activeOccurrences,
      color: 'text-status-critical',
      icon: Alert_triangle,
    },
    {
      label: 'ALERTAS ATIVOS',
      value: dashboard.stats.activeAlerts,
      color: 'text-status-severe',
      icon: Flag,
    },
    {
      label: 'SEVERIDADE CRÍTICA',
      value: dashboard.stats.criticalSeverity,
      color: 'text-status-critical',
      icon: Map_pin,
    },
    {
      label: 'RESOLVIDAS HOJE',
      value: dashboard.stats.resolvedToday,
      color: 'text-status-success',
      icon: Check,
    },
  ]

  return (
    <div className="relative w-full h-full overflow-hidden bg-slate-100 p-4 animate-fade-in">
      <Card className="absolute inset-4 !p-0 overflow-hidden !border-0 !shadow-none !rounded-[22px] z-0 bg-transparent">
        <MapView ref={mapRef} ocorrencias={mapOccurrences} heatmap={mapMode === 'heat'} />

        <div className="absolute top-4 left-16 z-[500] flex rounded-xl bg-white/90 backdrop-blur-sm border border-border-soft shadow-sm overflow-hidden">
          <button
            className={`px-3 py-2 text-xs font-bold transition-colors ${mapMode === 'heat' ? 'bg-text-main text-white' : 'text-slate-600 hover:bg-slate-50'}`}
            onClick={() => setMapMode('heat')}
          >
            Mapa de calor
          </button>
          <button
            className={`px-3 py-2 text-xs font-bold transition-colors ${mapMode === 'points' ? 'bg-text-main text-white' : 'text-slate-600 hover:bg-slate-50'}`}
            onClick={() => setMapMode('points')}
          >
            Pontos
          </button>
        </div>
      </Card>

      <Card className="absolute top-8 right-8 w-80 max-h-[430px] shadow-xl border border-slate-200/80 bg-white/95 backdrop-blur-sm p-0 overflow-hidden flex flex-col z-10">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-800">Ocorrências Recentes</h3>
            <p className="text-[11px] text-slate-400">Relatos enviados pelo mobile</p>
          </div>
          {loading && <span className="text-[11px] text-slate-400">Carregando...</span>}
        </div>

        {error && (
          <div className="mx-4 mt-3 rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs text-red-700">
            {error}
          </div>
        )}

        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 max-h-[360px]">
          {dashboard.recentOccurrences.length === 0 && !loading ? (
            <div className="px-4 py-8 text-center text-xs text-slate-400">
              Nenhum relato encontrado ainda.
            </div>
          ) : (
            dashboard.recentOccurrences.map((occ) => {
              const cfg = SEVERITY_CONFIG[occ.severity] || SEVERITY_CONFIG.regular
              return (
                <button
                  key={occ.id}
                  onClick={() => handleOccClick(occ)}
                  className="w-full flex items-start gap-2.5 px-4 py-3 hover:bg-slate-50/80 transition-colors text-left"
                >
                  <span
                    className="w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1"
                    style={{ backgroundColor: cfg.dotColor }}
                  />
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-xs text-slate-800 truncate">{occ.title}</p>
                    <p className="text-[11px] text-slate-500 mt-0.5">
                      {occ.city} · {occ.time}
                    </p>
                    <p className="text-[10px] text-slate-400 mt-0.5 truncate">
                      por {occ.citizenName}
                    </p>
                  </div>
                  <span className={`${cfg.cls} text-[10px] px-1.5 py-0.5 rounded`}>
                    {cfg.label}
                  </span>
                </button>
              )
            })
          )}
        </div>
      </Card>

      <div className="absolute w-[80%] h-20 bottom-8 left-1/2 -translate-x-1/2 flex justify-between items-center gap-6 z-10 pointer-events-none">
        {statCards.map((card) => (
          <Card
            key={card.label}
            className="pointer-events-auto flex items-center gap-4 py-3 px-4 bg-[#A6C1D4]/95 backdrop-blur-sm shadow-lg border border-slate-300/50 w-full h-full"
          >
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <img src={card.icon} alt={card.label} className="w-[80%] h-[80%] object-contain" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-slate-700 tracking-wider truncate">{card.label}</p>
              <p className={`text-2xl font-black mt-0.5 ${card.color}`}>{card.value}</p>
            </div>
          </Card>
        ))}
      </div>

      <Modal isOpen={!!selectedOcc} onClose={() => setSelectedOcc(null)} title="Detalhes da Ocorrência" size="md">
        {selectedOcc && (
          <div className="space-y-4">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-bold text-slate-800">{selectedOcc.title}</span>
              <span className={SEVERITY_CONFIG[selectedOcc.severity]?.cls || SEVERITY_CONFIG.regular.cls}>
                {SEVERITY_CONFIG[selectedOcc.severity]?.label || 'Moderado'}
              </span>
            </div>

            {selectedOcc.photoUrl && (
              <img
                src={selectedOcc.photoUrl}
                alt="Foto do relato"
                className="w-full max-h-64 object-cover rounded-xl border border-border-soft"
              />
            )}

            <dl className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
              <div>
                <dt className="text-label text-slate-400">TIPO DE DESASTRE</dt>
                <dd className="text-slate-700 font-medium mt-0.5">{selectedOcc.type}</dd>
              </div>
              <div>
                <dt className="text-label text-slate-400">NÍVEL INFORMADO</dt>
                <dd className="text-slate-700 font-medium mt-0.5">{selectedOcc.riskLabel}</dd>
              </div>
              <div>
                <dt className="text-label text-slate-400">CIDADÃO</dt>
                <dd className="text-slate-700 font-medium mt-0.5">{selectedOcc.citizenName}</dd>
              </div>
              <div>
                <dt className="text-label text-slate-400">REPORTADO EM</dt>
                <dd className="text-slate-700 font-medium mt-0.5">{formatFullDate(selectedOcc.reportedAt)}</dd>
              </div>
              <div>
                <dt className="text-label text-slate-400">LOCALIZAÇÃO</dt>
                <dd className="text-slate-700 font-medium mt-0.5">
                  {Number.isFinite(selectedOcc.lat) && Number.isFinite(selectedOcc.lng)
                    ? `${selectedOcc.lat.toFixed(5)}, ${selectedOcc.lng.toFixed(5)}`
                    : 'Localização não informada'}
                </dd>
              </div>
            </dl>

            <div className="flex justify-end gap-3 pt-2 border-t border-border-soft">
              <button className="btn-ghost" onClick={() => setSelectedOcc(null)}>Fechar</button>
            </div>
          </div>
        )}
      </Modal>
    </div>
  )
}
