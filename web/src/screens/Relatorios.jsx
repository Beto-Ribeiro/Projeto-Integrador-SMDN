import { useState } from 'react'
import Card from '../components/Card'
import externalIcon from '../assets/relatorios/external-link.svg'

const MONTHLY = [
  { month: 'Jul', total: 38, critical: 8 },
  { month: 'Ago', total: 45, critical: 11 },
  { month: 'Set', total: 29, critical: 5 },
  { month: 'Out', total: 52, critical: 14 },
  { month: 'Nov', total: 61, critical: 18 },
  { month: 'Dez', total: 47, critical: 12 },
  { month: 'Jan', total: 55, critical: 16 },
]

const BY_TYPE = [
  { type: 'Enchente', count: 42, pct: 34 },
  { type: 'Deslizamento', count: 28, pct: 22 },
  { type: 'Temporal', count: 21, pct: 17 },
  { type: 'Tornado', count: 1, pct: 10 },
  { type: 'Desabamento', count: 4, pct: 3 },
]

const BY_CITY = [
  { city: 'São José dos Campos', count: 51 },
  { city: 'Taubaté', count: 28 },
  { city: 'Caraguatatuba', count: 22 },
  { city: 'Jacareí', count: 17 },
  { city: 'Pindamonhangaba', count: 12 },
  { city: 'Guaratinguetá', count: 9 },
]

const BY_SEVERITY = [
  { label: 'Crítico',  count: 58,  pct: 18, color: 'bg-status-critical', text: 'text-status-critical' },
  { label: 'Grave',    count: 104, pct: 32, color: 'bg-status-severe',   text: 'text-status-severe'   },
  { label: 'Moderado', count: 112, pct: 34, color: 'bg-status-regular',  text: 'text-status-regular'  },
  { label: 'Normal',   count: 53,  pct: 16, color: 'bg-status-success',  text: 'text-status-success'  },
]

const BY_STATUS = [
  { label: 'Resolvidas',   count: 291, pct: 89, color: '#02c602' },
  { label: 'Em andamento', count: 24,  pct: 7,  color: '#ff6a00' },
  { label: 'Pendentes',    count: 12,  pct: 4,  color: '#c60202' },
]

const TYPE_COLORS = ['bg-text-main', 'bg-status-severe', 'bg-status-regular', 'bg-action-inactive', 'bg-status-critical', 'bg-slate-400']

const maxTotal = Math.max(...MONTHLY.map((m) => m.total))
const maxCity  = Math.max(...BY_CITY.map((c) => c.count))

const PERIODS = ['Últimos 7 dias', 'Últimos 30 dias', 'Últimos 6 meses', 'Último ano']

const DONUT_R = 54
const DONUT_CX = 70
const DONUT_CY = 70
const CIRCUMFERENCE = 2 * Math.PI * DONUT_R

function buildDonutSegments(items) {
  let offset = 0
  return items.map((item) => {
    const dash = (item.pct / 100) * CIRCUMFERENCE
    const gap  = CIRCUMFERENCE - dash
    const seg  = { ...item, dash, gap, offset }
    offset += dash
    return seg
  })
}

export default function Relatorios() {
  const [period, setPeriod] = useState('Últimos 6 meses')
  const donutSegments = buildDonutSegments(BY_STATUS)

  return (
    <div className="p-8 space-y-6 animate-fade-in">

      {/* Header + KPIs na mesma linha */}
      <div className="flex items-center justify-between flex-wrap gap-4">
        <div className="flex gap-4 flex-wrap">
          {[
            { label: 'TOTAL DE OCORRÊNCIAS', value: '327', delta: '+12%', positive: false, color: 'text-text-main' },
            { label: 'TAXA DE RESOLUÇÃO',    value: '89%', delta: '+5%',  positive: true,  color: 'text-status-success' },
          ].map((kpi) => (
            <Card key={kpi.label} className="py-4 min-w-[200px]">
              <p className="text-label text-slate-500 mb-1.5">{kpi.label}</p>
              <p className={`text-3xl font-bold ${kpi.color}`}>{kpi.value}</p>
              <p className={`text-xs font-semibold mt-1 ${kpi.positive ? 'text-status-success' : 'text-status-critical'}`}>
                {kpi.delta} em comparação ao período anterior
              </p>
            </Card>
          ))}
        </div>
        <div className="flex items-center gap-2 bg-bg-surface border border-border-soft rounded-lg p-1">
          {PERIODS.map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-3 py-1.5 rounded text-xs font-semibold transition-all ${period === p ? 'bg-text-main text-white shadow-sm' : 'text-slate-500 hover:text-slate-800'}`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Export buttons */}
      <div className="flex items-center gap-3">
        <button
          onClick={() => window.print()}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-600 border border-border-soft rounded-lg bg-bg-surface hover:bg-slate-50 hover:border-slate-300 transition-all"
        >
          <img src={externalIcon} width="13" height="13" alt="external-link" />
          Exportar PDF
        </button>
        <button
          onClick={() => alert('Exportar Excel')}
          className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-600 border border-border-soft rounded-lg bg-bg-surface hover:bg-slate-50 hover:border-slate-300 transition-all"
        >
          <img src={externalIcon} width="13" height="13" alt="external-link" />
          Exportar Excel
        </button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Bar Chart - monthly */}
        <Card className="lg:col-span-2">
          <h3 className="text-card-title font-bold text-slate-800 mb-6">Ocorrências por Mês</h3>
          <div className="flex items-end gap-3 h-48">
            {MONTHLY.map((m) => (
              <div key={m.month} className="flex-1 flex flex-col items-center gap-1.5">
                <span className="text-[10px] text-slate-400 font-bold">{m.total}</span>
                <div className="w-full flex flex-col justify-end" style={{ height: '160px' }}>
                  <div
                    className="w-full rounded-t bg-text-main/20 relative overflow-hidden flex flex-col justify-end"
                    style={{ height: `${(m.total / maxTotal) * 100}%` }}
                  >
                    <div
                      className="w-full bg-status-critical rounded-t"
                      style={{ height: `${(m.critical / m.total) * 100}%` }}
                    />
                  </div>
                </div>
                <span className="text-[11px] text-slate-500 font-medium">{m.month}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center gap-5 mt-4">
            <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-text-main/20 block" /><span className="text-xs text-slate-500">Total</span></div>
            <div className="flex items-center gap-1.5"><span className="w-3 h-3 rounded-sm bg-status-critical block" /><span className="text-xs text-slate-500">Críticos</span></div>
          </div>
        </Card>

        {/* Type breakdown */}
        <Card>
          <h3 className="text-card-title font-bold text-slate-800 mb-5">Por Tipo</h3>
          <div className="space-y-3">
            {BY_TYPE.map((t, i) => (
              <div key={t.type}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-slate-600 font-medium">{t.type}</span>
                  <span className="text-slate-400 font-bold">{t.count}</span>
                </div>
                <div className="h-2 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${TYPE_COLORS[i]}`}
                    style={{ width: `${t.pct}%`, transition: 'width 0.6s ease' }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Distribuição de Severidade + Status das Ocorrências */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">

        <Card>
          <h3 className="text-card-title font-bold text-slate-800 mb-5">Distribuição de Severidade</h3>
          <div className="space-y-4">
            {BY_SEVERITY.map((s) => (
              <div key={s.label}>
                <div className="flex justify-between text-xs mb-1.5">
                  <span className={`font-bold ${s.text}`}>{s.label}</span>
                  <span className="text-slate-400 font-bold">{s.count} <span className="text-slate-300">({s.pct}%)</span></span>
                </div>
                <div className="h-3 bg-slate-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full rounded-full ${s.color}`}
                    style={{ width: `${s.pct}%`, transition: 'width 0.7s ease' }}
                  />
                </div>
              </div>
            ))}
          </div>
          <div className="grid grid-cols-4 gap-2 mt-5 pt-4 border-t border-border-soft">
            {BY_SEVERITY.map((s) => (
              <div key={s.label} className="text-center">
                <p className={`text-lg font-bold ${s.text}`}>{s.pct}%</p>
                <p className="text-[10px] text-slate-400 font-semibold">{s.label}</p>
              </div>
            ))}
          </div>
        </Card>

        <Card>
          <h3 className="text-card-title font-bold text-slate-800 mb-5">Status das Ocorrências</h3>
          <div className="flex items-center gap-8">
            <div className="relative flex-shrink-0">
              <svg width="140" height="140" viewBox="0 0 140 140">
                <circle cx={DONUT_CX} cy={DONUT_CY} r={DONUT_R} fill="none" stroke="#f1f5f9" strokeWidth="16" />
                {donutSegments.map((seg) => (
                  <circle
                    key={seg.label}
                    cx={DONUT_CX}
                    cy={DONUT_CY}
                    r={DONUT_R}
                    fill="none"
                    stroke={seg.color}
                    strokeWidth="16"
                    strokeDasharray={`${seg.dash} ${seg.gap}`}
                    strokeDashoffset={-seg.offset}
                    transform={`rotate(-90 ${DONUT_CX} ${DONUT_CY})`}
                    style={{ transition: 'stroke-dasharray 0.7s ease' }}
                  />
                ))}
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <span className="text-2xl font-bold text-slate-800">327</span>
                <span className="text-[10px] text-slate-400 font-semibold">total</span>
              </div>
            </div>
            <div className="flex-1 space-y-4">
              {BY_STATUS.map((s) => (
                <div key={s.label}>
                  <div className="flex justify-between text-xs mb-1">
                    <div className="flex items-center gap-2">
                      <span className="w-2.5 h-2.5 rounded-full flex-shrink-0" style={{ backgroundColor: s.color }} />
                      <span className="text-slate-600 font-medium">{s.label}</span>
                    </div>
                    <span className="font-bold text-slate-700">{s.count}</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full"
                      style={{ width: `${s.pct}%`, backgroundColor: s.color, transition: 'width 0.7s ease' }}
                    />
                  </div>
                </div>
              ))}
            </div>
          </div>
        </Card>

      </div>

      {/* By city */}
      <Card>
        <h3 className="text-card-title font-bold text-slate-800 mb-5">Ocorrências por Município</h3>
        <div className="space-y-3">
          {BY_CITY.map((c) => (
            <div key={c.city} className="flex items-center gap-4">
              <span className="text-sm text-slate-600 w-40 font-medium truncate">{c.city}</span>
              <div className="flex-1 h-6 bg-slate-100 rounded overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-text-main to-action-hover flex items-center justify-end pr-2 rounded transition-all duration-700"
                  style={{ width: `${(c.count / maxCity) * 100}%` }}
                >
                  <span className="text-white text-[11px] font-bold">{c.count}</span>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}