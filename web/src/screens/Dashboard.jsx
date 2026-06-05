import { useState } from 'react'
import Card from '../components/Card'
import Modal from '../components/Modal'
import MapView from '../components/MapView'
import Alert_triangle from '../assets/menu/inativo/alert-triangle.svg'
import Flag from '../assets/menu/inativo/flag.svg'
import Map_pin from '../assets/menu/inativo/map-pin.svg'
import Check from '../assets/menu/inativo/map-pin.svg'

const MOCK_DATA = {
  activeOccurrences: 12,
  activeAlerts: 5,
  criticalSeverity: 3,
  resolvedToday: 18,
  recentOccurrences: [
    { id: 1, title: 'Enchente em Jardim Aquarius', severity: 'critical', city: 'São José dos Campos', time: '10 min atrás', lat: -23.1794, lng: -45.8869 },
    { id: 2, title: 'Deslizamento na Serra',       severity: 'severe',   city: 'Caraguatatuba',      time: '25 min atrás', lat: -23.6204, lng: -45.4128 },
    { id: 3, title: 'Temporal',                    severity: 'regular',  city: 'Taubaté',             time: '1h atrás',     lat: -23.0268, lng: -45.5551 },
    { id: 4, title: 'Temporal previsto',           severity: 'regular',  city: 'Guaratinguetá',       time: '3h atrás',     lat: -22.8166, lng: -45.1933 },
  ],
}

const SEVERITY_CONFIG = {
  critical: { label: 'Crítico', cls: 'badge-critical', dotColor: '#c60202', ringColor: 'rgba(198,2,2,0.2)' },
  severe:   { label: 'Grave',   cls: 'badge-severe',   dotColor: '#ff6a00', ringColor: 'rgba(255,106,0,0.2)' },
  regular:  { label: 'Moderado',cls: 'badge-regular',  dotColor: '#cab900', ringColor: 'rgba(202,185,0,0.2)' },
}

// Converte o formato interno para o que o MapView espera
function toMapOcorrencias(ocorrencias) {
  return ocorrencias.map((o) => ({
    lat: o.lat,
    lng: o.lng,
    titulo: o.title,
    severidade: SEVERITY_CONFIG[o.severity].label,
  }))
}

export default function Dashboard() {
  const [selectedOcc, setSelectedOcc] = useState(null)

  return (
    <div className="relative w-full h-full overflow-hidden bg-slate-100 p-4 animate-fade-in">

      {/* ── CAMADA 1: MAPA (fundo total) ── */}
      <Card className="absolute inset-4 !p-0 overflow-hidden border border-slate-200 shadow-sm z-0">
        <MapView ocorrencias={toMapOcorrencias(MOCK_DATA.recentOccurrences)} />
      </Card>

      {/* ── CAMADA 2: COMPONENTES FLUTUANTES ── */}

      {/* Lista de Ocorrências Recentes */}
      <Card className="absolute top-8 right-8 w-72 max-h-[400px] shadow-xl border border-slate-200/80 bg-white/95 backdrop-blur-sm p-0 overflow-hidden flex flex-col z-10">
        <div className="px-4 py-2 border-b border-slate-100">
          <h3 className="text-sm font-bold text-slate-800">Ocorrências Recentes</h3>
        </div>
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 max-h-[340px]">
          {MOCK_DATA.recentOccurrences.map((occ) => {
            const cfg = SEVERITY_CONFIG[occ.severity]
            return (
              <button
                key={occ.id}
                onClick={() => setSelectedOcc(occ)}
                className="w-full flex items-start gap-2.5 px-4 py-3 hover:bg-slate-50/80 transition-colors text-left"
              >
                <span
                  className="w-2.5 h-2.5 rounded-full flex-shrink-0 mt-1"
                  style={{ backgroundColor: cfg.dotColor }}
                />
                <div className="min-w-0 flex-1">
                  <p className="font-semibold text-xs text-slate-800 truncate">{occ.title}</p>
                  <p className="text-[11px] text-slate-500 mt-0.5">{occ.city} · {occ.time}</p>
                </div>
                <span className={`${cfg.cls} text-[10px] px-1.5 py-0.5 rounded`}>{cfg.label}</span>
              </button>
            )
          })}
        </div>
      </Card>

      {/* Contadores Estatísticos */}
      <div className="absolute w-[80%] h-20 bottom-8 left-1/2 -translate-x-1/2 flex justify-between items-center gap-6 z-10 pointer-events-none">
        {[
          { label: 'OCORRÊNCIAS ATIVAS', value: MOCK_DATA.activeOccurrences, color: 'text-status-critical', icon: Alert_triangle },
          { label: 'ALERTAS ATIVOS',     value: MOCK_DATA.activeAlerts,      color: 'text-status-severe',   icon: Flag },
          { label: 'SEVERIDADE CRÍTICA', value: MOCK_DATA.criticalSeverity,  color: 'text-status-critical', icon: Map_pin },
          { label: 'RESOLVIDAS HOJE',    value: MOCK_DATA.resolvedToday,     color: 'text-status-success',  icon: Check },
        ].map((s) => (
          <Card key={s.label} className="pointer-events-auto flex items-center gap-4 py-3 px-4 bg-[#A6C1D4]/95 backdrop-blur-sm shadow-lg border border-slate-300/50 w-full h-full">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <img src={s.icon} alt={s.label} className="w-[80%] h-[80%] object-contain" />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-slate-700 tracking-wider truncate">{s.label}</p>
              <p className={`text-2xl font-black mt-0.5 ${s.color}`}>{s.value}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Modal de detalhe */}
      <Modal isOpen={!!selectedOcc} onClose={() => setSelectedOcc(null)} title="Detalhes da Ocorrência" size="sm">
        {selectedOcc && (
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <span className="font-bold text-slate-800">{selectedOcc.title}</span>
              <span className={SEVERITY_CONFIG[selectedOcc.severity].cls}>{SEVERITY_CONFIG[selectedOcc.severity].label}</span>
            </div>
            <dl className="space-y-2 text-sm">
              <div><dt className="text-label text-slate-400">MUNICÍPIO</dt><dd className="text-slate-700 font-medium mt-0.5">{selectedOcc.city}</dd></div>
              <div><dt className="text-label text-slate-400">REPORTADO</dt><dd className="text-slate-700 font-medium mt-0.5">{selectedOcc.time}</dd></div>
            </dl>
            <div className="flex justify-end gap-3 pt-2 border-t border-border-soft">
              <button className="btn-ghost" onClick={() => setSelectedOcc(null)}>Fechar</button>
              <button className="btn-primary">Ver Ocorrência Completa</button>
            </div>
          </div>
        )}
      </Modal>

    </div>
  )
}
