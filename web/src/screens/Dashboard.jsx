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
import { useSmdnSettings } from '../hooks/useSmdnSettings.js'

const SEVERITY_CONFIG = {
  critical: { label: 'Crítico', cls: 'badge-critical', dotColor: '#c60202' },
  severe: { label: 'Grave', cls: 'badge-severe', dotColor: '#ff6a00' },
  regular: { label: 'Moderado', cls: 'badge-regular', dotColor: '#cab900' },
}

const MAP_MODES = [
  { id: 'heat', label: 'Mapa de calor', aria: 'Exibir mapa de calor com ocorrências e vítimas' },
  { id: 'points', label: 'Pontos', aria: 'Exibir pontos de ocorrências e vítimas' },
  { id: 'victims', label: 'Vítimas', aria: 'Exibir somente pontos de vítimas' },
]

function normalizeMapMode(value) {
  return MAP_MODES.some((mode) => mode.id === value) ? value : 'heat'
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

function toMapVictims(victims) {
  return (victims || [])
    .filter((item) => Number.isFinite(item.lat) && Number.isFinite(item.lng))
    .map((item) => ({
      id: item.id,
      name: item.name || 'Vítima localizada',
      lat: item.lat,
      lng: item.lng,
      source: item.source,
      updatedAt: item.updatedAt,
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
      locatedVictims: 0,
    },
    recentOccurrences: [],
    victims: [],
  })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')
  const { settings } = useSmdnSettings()
  const [mapMode, setMapMode] = useState(normalizeMapMode(settings.defaultMapMode))
  const mapRef = useRef(null)

  const mapOccurrences = useMemo(
    () => toMapOcorrencias(dashboard.recentOccurrences),
    [dashboard.recentOccurrences]
  )

  const mapVictims = useMemo(
    () => toMapVictims(dashboard.victims),
    [dashboard.victims]
  )

  const dashboardSummary = [
    { label: 'No mapa', value: mapOccurrences.length },
    { label: 'Vítimas', value: mapVictims.length },
    { label: 'Críticos', value: dashboard.stats.criticalSeverity },
  ]

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
  useEffect(() => {
    setMapMode(normalizeMapMode(settings.defaultMapMode))
  }, [settings.defaultMapMode])


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
    <div className="relative w-full h-full overflow-hidden bg-bg-main p-4 animate-fade-in">
      <Card
        className="absolute inset-4 !p-0 overflow-hidden !border-0 !shadow-none !rounded-[22px] z-0 bg-transparent"
        role="region"
        aria-label="Mapa de monitoramento com ocorrências e vítimas localizadas"
      >
        <p className="sr-only" aria-live="polite">
          Dashboard com {mapOccurrences.length} ocorrência(s) com localização e {mapVictims.length} vítima(s) localizada(s).
          Filtro atual do mapa: {MAP_MODES.find((mode) => mode.id === mapMode)?.label}.
        </p>

        <MapView
          ref={mapRef}
          ocorrencias={mapOccurrences}
          vitimas={mapVictims}
          mapMode={mapMode}
          heatmap={mapMode === 'heat'}
        />

        <div
          className="absolute top-4 left-16 z-[500] flex rounded-xl bg-bg-surface/95 backdrop-blur-sm border border-border-soft shadow-sm overflow-hidden"
          role="group"
          aria-label="Filtro de visualização do mapa"
        >
          {MAP_MODES.map((mode) => (
            <button
              key={mode.id}
              type="button"
              className={`px-3 py-2 text-xs font-bold transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-sky-500 ${mapMode === mode.id ? 'bg-text-main text-white' : 'text-slate-600 hover:bg-action-hover/20'}`}
              onClick={() => setMapMode(mode.id)}
              aria-pressed={mapMode === mode.id}
              aria-label={mode.aria}
            >
              {mode.label}
            </button>
          ))}
        </div>

        {mapVictims.length > 0 && (
          <div className="absolute top-16 left-16 z-[500] rounded-xl border border-border-soft bg-bg-surface/95 px-3 py-2 text-[11px] font-semibold text-slate-700 shadow-sm">
            <span className="mr-2 inline-block h-2.5 w-2.5 rounded-full bg-black align-middle ring-2 ring-white" />
            {mapMode === 'victims' ? 'Exibindo somente vítimas' : `${mapVictims.length} vítima(s) no mapa`}
          </div>
        )}
      </Card>

      <Card className="absolute top-8 right-8 w-80 max-h-[430px] shadow-xl border border-border-soft bg-bg-surface/95 backdrop-blur-sm p-0 overflow-hidden flex flex-col z-10">
        <div className="px-4 py-3 border-b border-slate-100 flex items-center justify-between gap-3">
          <div>
            <h3 className="text-sm font-bold text-slate-800">Ocorrências Recentes</h3>
            <p className="text-[11px] text-slate-400">Relatos enviados pelo mobile</p>
            <div className="mt-2 flex flex-wrap gap-1.5" aria-label="Resumo rápido do dashboard">
              {dashboardSummary.map((item) => (
                <span
                  key={item.label}
                  className="rounded-full border border-border-soft bg-action-hover/10 px-2 py-0.5 text-[10px] font-bold text-slate-600"
                >
                  {item.label}: {item.value}
                </span>
              ))}
            </div>
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
                  type="button"
                  onClick={() => handleOccClick(occ)}
                  aria-label={`Abrir detalhes de ${occ.title}, severidade ${cfg.label}, ${occ.city}`}
                  className="w-full flex items-start gap-2.5 px-4 py-3 hover:bg-slate-50/80 transition-colors text-left focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-sky-500"
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

      <div
        className="absolute w-[80%] h-20 bottom-8 left-1/2 -translate-x-1/2 flex justify-between items-center gap-6 z-10 pointer-events-none"
        role="list"
        aria-label="Indicadores do dashboard"
      >
        {statCards.map((card) => (
          <Card
            key={card.label}
            role="listitem"
            aria-label={`${card.label}: ${card.value}`}
            className="pointer-events-auto flex items-center gap-4 py-3 px-4 bg-bg-surface/95 backdrop-blur-sm shadow-lg border border-border-soft w-full h-full"
          >
            <div className="w-10 h-10 rounded-xl bg-action-hover/15 flex items-center justify-center flex-shrink-0">
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
