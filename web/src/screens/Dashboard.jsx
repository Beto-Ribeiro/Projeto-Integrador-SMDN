import { useState } from 'react'
import Card from '../components/Card'
import Modal from '../components/Modal'
import Alert_triangle from '../assets/menu/inativo/alert-triangle.svg'
import Flag from '../assets/menu/inativo/flag.svg'
import Map_pin from '../assets/menu/inativo/map-pin.svg'
import Check from '../assets/menu/inativo/map-pin.svg'
// REMOVIDO:
// import Map_png from '../assets/dashboard/print_maps.png'
import MapView from '../components/MapView'


const MOCK_DATA = {
  activeOccurrences: 12,
  activeAlerts: 5,
  criticalSeverity: 3,
  resolvedToday: 18,
  recentOccurrences: [
    { id: 1, title: 'Enchente em Jardim Aquarius', severity: 'critical', city: 'São José dos Campos', time: '10 min atrás', coords: [45, 38] },
    { id: 2, title: 'Deslizamento na Serra', severity: 'severe', city: 'Caraguatatuba', time: '25 min atrás', coords: [72, 55] },
    { id: 3, title: 'Temporal', severity: 'regular', city: 'Taubaté', time: '1h atrás', coords: [38, 62] },
    { id: 4, title: 'Temporal previsto', severity: 'regular', city: 'Guaratinguetá', time: '3h atrás', coords: [65, 25] },
  ],
}

const SEVERITY_CONFIG = {
  critical: { label: 'Crítico', cls: 'badge-critical', dotColor: '#c60202', ringColor: 'rgba(198,2,2,0.2)' },
  severe: { label: 'Grave', cls: 'badge-severe', dotColor: '#ff6a00', ringColor: 'rgba(255,106,0,0.2)' },
  regular: { label: 'Moderado', cls: 'badge-regular', dotColor: '#cab900', ringColor: 'rgba(202,185,0,0.2)' },
}

export default function Dashboard() {
  const [selectedOcc, setSelectedOcc] = useState(null)

  return (
    // 1. CONTAINER PAI: Ocupa toda a altura restante da tela (descontando paddings) e é relative
    <div className="relative w-full h-full overflow-hidden bg-slate-100 p-4 animate-fade-in">

      {/* ========================================================
          CAMADA 1: O MAPA (Fundo total)
         ======================================================== */}
      <Card className="absolute inset-4 !p-0 overflow-hidden border border-slate-200 shadow-sm flex flex-col z-0 ">
        <div className="relative flex-1 bg-gradient-to-br from-slate-100 to-blue-50 overflow-hidden">
          
          {/* Fake grid */}
          <img className="absolute w-full h-full opacity-80" viewBox="0 0 100 100" src={Map_png} />
          <svg className="absolute inset-0 w-full h-full opacity-0" viewBox="0 0 100 100" preserveAspectRatio="none">
            {[10,20,30,40,50,60,70,80,90].map((v) => (
              <g key={v}>
                <line x1={v} y1="0" x2={v} y2="100" stroke="#44769b" strokeWidth="0.3" />
                <line x1="0" y1={v} x2="100" y2={v} stroke="#44769b" strokeWidth="0.3" />
              </g>
            ))}
          </svg>
          
          {/* Fake road 
          <svg className="absolute inset-0 w-full h-full opacity-30" viewBox="0 0 400 320" preserveAspectRatio="none">
            <path d="M0 160 Q100 140 200 160 T400 155" stroke="#44769b" strokeWidth="2" fill="none" />
            <path d="M0 100 Q80 120 160 100 T320 110 T400 100" stroke="#44769b" strokeWidth="1.5" fill="none" />
            <path d="M100 0 Q110 80 100 160 T110 320" stroke="#44769b" strokeWidth="1.5" fill="none" />
            <path d="M280 0 Q290 100 280 200 T285 320" stroke="#44769b" strokeWidth="1" fill="none" />
          </svg>
          */}

          {/* Pins do Mapa */}
          {MOCK_DATA.recentOccurrences.map((occ) => {
            const cfg = SEVERITY_CONFIG[occ.severity]
            return (
              <button
                key={occ.id}
                onClick={() => setSelectedOcc(occ)}
                className="absolute transform -translate-x-1/2 -translate-y-1/2 group z-10"
                style={{ left: `${occ.coords[0]}%`, top: `${occ.coords[1]}%` }}
              >
                <span
                  className="block w-6 h-6 rounded-full border-2 border-white shadow-md transition-transform group-hover:scale-125"
                  style={{ backgroundColor: cfg.dotColor, boxShadow: `0 0 0 4px ${cfg.ringColor}` }}
                >
                  <img src={Map_pin} />  
                </span>
                <span
                  className="absolute left-1/2 -translate-x-1/2 top-7 bg-slate-800/90 text-white text-[10px] font-semibold px-2 py-1 rounded whitespace-nowrap opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none"
                >
                  {occ.title}
                </span>
              </button>
            )
          })}

          {/* Legenda de Severidades (Fixa no canto inferior direito de dentro do mapa)
          <div className="absolute top-4 right-4 bg-white/90 backdrop-blur-sm border border-slate-200 rounded-lg px-3 py-2 flex items-center gap-3 text-xs text-slate-600 shadow-sm z-10">
            {Object.entries(SEVERITY_CONFIG).map(([k, v]) => (
              <span key={k} className="flex items-center gap-1">
                <span className="w-2.5 h-2.5 rounded-full block flex-shrink-0" style={{ backgroundColor: v.dotColor }} />
                {v.label}
              </span>
            ))}
          </div> */}

        </div>
      </Card>

      {/* ========================================================
          CAMADA 2: COMPONENTES FLUTUANTES (Sobrepostos)
         ======================================================== */}

      {/* Lista de Ocorrências Recentes (Flutuando na Esquerda/Superior) */}
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

      {/* Contadores Estatísticos (Flutuando na Base Inferior Centralizada/Alinhada) */}
      <div className="absolute w-[80%] h-20 bottom-8 left-1/2 -translate-x-1/2 flex justify-between items-center gap-6 z-10 pointer-events-none">
        {[
          { label: 'OCORRÊNCIAS ATIVAS', value: MOCK_DATA.activeOccurrences, color: 'text-status-critical', icon: Alert_triangle },
          { label: 'ALERTAS ATIVOS', value: MOCK_DATA.activeAlerts, color: 'text-status-severe', icon: Flag },
          { label: 'SEVERIDADE CRÍTICA', value: MOCK_DATA.criticalSeverity, color: 'text-status-critical', icon: Map_pin },
          { label: 'RESOLVIDAS HOJE', value: MOCK_DATA.resolvedToday, color: 'text-status-success', icon: Check },
        ].map((s) => (
          // Reativando pointer-events aqui para os cards voltarem a ser clicáveis se necessário
          <Card key={s.label} className="pointer-events-auto flex items-center gap-4 py-3 px-4 bg-[#A6C1D4]/95 backdrop-blur-sm shadow-lg border border-slate-300/50 w-full h-full">
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center flex-shrink-0">
              <img 
                src={s.icon} 
                alt={s.label} 
                className="w-[80%] h-[80%] object-contain" 
              />
            </div>
            <div className="min-w-0">
              <p className="text-[10px] font-bold text-slate-700 tracking-wider truncate">{s.label}</p>
              <p className={`text-2xl font-black mt-0.5 ${s.color}`}>{s.value}</p>
            </div>
          </Card>
        ))}
      </div>

      {/* Modais de detalhe mantêm o comportamento */}
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