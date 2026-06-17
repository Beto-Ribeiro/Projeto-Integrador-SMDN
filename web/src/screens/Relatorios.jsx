/**
 * Relatorios.jsx
 *
 * Exportação PDF  → html2canvas + jsPDF (captura só o div#relatorio-content)
 * Exportação Excel → SheetJS (xlsx) com múltiplas abas
 *
 * Dados reais → Supabase RPC public.get_relatorios_data(period)
 * Exportação PDF e Excel continuam usando o layout atual, sem mudar o design.
 *
 * Dependências necessárias:
 *   html2canvas, jspdf, xlsx
 */

import { useState, useRef, useCallback, useEffect } from 'react'
import Card from '../components/Card'
import externalIcon from '../assets/relatorios/external-link.svg'
import { getRelatoriosData, subscribeRelatoriosChanges } from '../backend/relatorios/relatoriosService.js'

// ─── Dependências de exportação ──────────────────────────────────────────────
// Se ainda não instalou: npm install html2canvas jspdf xlsx
import html2canvas from 'html2canvas'
import jsPDF from 'jspdf'
import * as XLSX from 'xlsx'

// ─────────────────────────────────────────────────────────────────────────────
// HOOK DE DADOS REAIS
// Centraliza a chamada ao Supabase sem alterar o desenho visual da tela.
// ─────────────────────────────────────────────────────────────────────────────
const EMPTY_REPORT_DATA = {
  kpis: {
    total: 0,
    totalDelta: '0%',
    totalPositive: true,
    resolutionRate: '0%',
    resolutionDelta: '0%',
    resolutionPositive: true,
  },
  monthly: [
    { month: 'Jan', total: 0, critical: 0 },
    { month: 'Fev', total: 0, critical: 0 },
    { month: 'Mar', total: 0, critical: 0 },
    { month: 'Abr', total: 0, critical: 0 },
    { month: 'Mai', total: 0, critical: 0 },
    { month: 'Jun', total: 0, critical: 0 },
    { month: 'Jul', total: 0, critical: 0 },
  ],
  byType: [],
  byCity: [],
  bySeverity: [
    { label: 'Crítico', count: 0, pct: 0, color: 'bg-status-critical', text: 'text-status-critical' },
    { label: 'Grave', count: 0, pct: 0, color: 'bg-status-severe', text: 'text-status-severe' },
    { label: 'Moderado', count: 0, pct: 0, color: 'bg-status-regular', text: 'text-status-regular' },
    { label: 'Normal', count: 0, pct: 0, color: 'bg-status-success', text: 'text-status-success' },
  ],
  byStatus: [
    { label: 'Resolvidas', count: 0, pct: 0, color: '#02c602' },
    { label: 'Em andamento', count: 0, pct: 0, color: '#ff6a00' },
    { label: 'Pendentes', count: 0, pct: 0, color: '#c60202' },
  ],
  occurrences: [],
}

function useReportData(period) {
  const [state, setState] = useState({
    loading: true,
    error: '',
    data: EMPTY_REPORT_DATA,
  })

  const load = useCallback(async ({ silent = false } = {}) => {
    setState((prev) => ({ ...prev, loading: silent ? prev.loading : true, error: '' }))

    try {
      const data = await getRelatoriosData(period)
      setState({ loading: false, error: '', data })
    } catch (err) {
      console.error('[SMDN Relatórios] Erro ao carregar dados reais:', err)
      setState((prev) => ({
        loading: false,
        error: err?.message || 'Não foi possível carregar os relatórios.',
        data: prev.data || EMPTY_REPORT_DATA,
      }))
    }
  }, [period])

  useEffect(() => {
    let active = true

    async function safeLoad() {
      if (!active) return
      await load()
    }

    safeLoad()

    const unsubscribe = subscribeRelatoriosChanges(() => {
      if (active) load({ silent: true })
    })

    return () => {
      active = false
      unsubscribe?.()
    }
  }, [load])

  return state
}

// ─────────────────────────────────────────────────────────────────────────────
// UTILITÁRIOS DE EXPORTAÇÃO
// ─────────────────────────────────────────────────────────────────────────────

/**
 * Gera e baixa um PDF bonito a partir do elemento DOM passado.
 * Usa html2canvas para renderizar o conteúdo e jsPDF para empacotar.
 */
async function exportToPDF(element, period) {
  // Esconde temporariamente os botões de exportação dentro da área capturada
  const exportBar = element.querySelector('[data-export-bar]')
  if (exportBar) exportBar.style.visibility = 'hidden'

  const canvas = await html2canvas(element, {
    scale: 2,          // alta resolução
    useCORS: true,
    backgroundColor: '#f8fafc',
    logging: false,
  })

  if (exportBar) exportBar.style.visibility = ''

  const imgData = canvas.toDataURL('image/png')
  const pdf     = new jsPDF({ orientation: 'portrait', unit: 'mm', format: 'a4' })

  const pageW  = pdf.internal.pageSize.getWidth()
  const pageH  = pdf.internal.pageSize.getHeight()
  const margin = 10
  const usableW = pageW - margin * 2
  const imgH    = (canvas.height * usableW) / canvas.width

  // Cabeçalho
  pdf.setFillColor(15, 23, 42)        // slate-900
  pdf.rect(0, 0, pageW, 14, 'F')
  pdf.setTextColor(255, 255, 255)
  pdf.setFontSize(9)
  pdf.setFont('helvetica', 'bold')
  pdf.text('SMDN – Sistema de Monitoramento de Desastres Naturais', margin, 9)
  pdf.setFont('helvetica', 'normal')
  pdf.text(`Relatório · ${period} · Gerado em ${new Date().toLocaleDateString('pt-BR')}`, pageW - margin, 9, { align: 'right' })

  // Conteúdo (com paginação automática)
  const startY = 16
  let remaining = imgH
  let srcY = 0

  while (remaining > 0) {
    const sliceH = Math.min(pageH - startY - margin, remaining)
    const sliceCanvas = document.createElement('canvas')
    sliceCanvas.width  = canvas.width
    sliceCanvas.height = (sliceH / usableW) * canvas.width

    const ctx = sliceCanvas.getContext('2d')
    ctx.drawImage(canvas, 0, srcY * (canvas.width / usableW), canvas.width, sliceCanvas.height, 0, 0, sliceCanvas.width, sliceCanvas.height)

    pdf.addImage(sliceCanvas.toDataURL('image/png'), 'PNG', margin, startY, usableW, sliceH)

    remaining -= sliceH
    srcY      += sliceH

    if (remaining > 0) {
      pdf.addPage()
    }
  }

  // Rodapé
  const totalPages = pdf.internal.getNumberOfPages()
  for (let i = 1; i <= totalPages; i++) {
    pdf.setPage(i)
    pdf.setFontSize(7)
    pdf.setTextColor(148, 163, 184) // slate-400
    pdf.text(`Página ${i} de ${totalPages}`, pageW / 2, pageH - 4, { align: 'center' })
  }

  pdf.save(`SMDN_Relatorio_${period.replace(/\s+/g, '_')}.pdf`)
}

/**
 * Gera e baixa um arquivo Excel (.xlsx) com abas separadas por seção.
 * Estruturado para receber dados reais sem alteração.
 */
function exportToExcel(data, period) {
  const wb = XLSX.utils.book_new()

  // ── Aba 1: Resumo ──────────────────────────────────────────────────────────
  const resumoRows = [
    ['SMDN – Relatório de Ocorrências'],
    [`Período: ${period}`],
    [`Gerado em: ${new Date().toLocaleDateString('pt-BR')}`],
    [],
    ['Indicador', 'Valor', 'Variação'],
    ['Total de Ocorrências', data.kpis.total,         data.kpis.totalDelta],
    ['Taxa de Resolução',    data.kpis.resolutionRate, data.kpis.resolutionDelta],
  ]
  const wsResumo = XLSX.utils.aoa_to_sheet(resumoRows)
  wsResumo['!cols'] = [{ wch: 28 }, { wch: 18 }, { wch: 14 }]
  XLSX.utils.book_append_sheet(wb, wsResumo, 'Resumo')

  // ── Aba 2: Por Mês ─────────────────────────────────────────────────────────
  const monthlyRows = [
    ['Mês', 'Total', 'Críticos', '% Críticos'],
    ...data.monthly.map((m) => [
      m.month,
      m.total,
      m.critical,
      m.total > 0 ? `${((m.critical / m.total) * 100).toFixed(1)}%` : '0%',
    ]),
  ]
  const wsMensal = XLSX.utils.aoa_to_sheet(monthlyRows)
  wsMensal['!cols'] = [{ wch: 10 }, { wch: 10 }, { wch: 12 }, { wch: 14 }]
  XLSX.utils.book_append_sheet(wb, wsMensal, 'Por Mês')

  // ── Aba 3: Por Tipo ────────────────────────────────────────────────────────
  const typeRows = [
    ['Tipo', 'Qtd. Ocorrências', '% do Total'],
    ...data.byType.map((t) => [t.type, t.count, `${t.pct}%`]),
  ]
  const wsType = XLSX.utils.aoa_to_sheet(typeRows)
  wsType['!cols'] = [{ wch: 18 }, { wch: 18 }, { wch: 14 }]
  XLSX.utils.book_append_sheet(wb, wsType, 'Por Tipo')

  // ── Aba 4: Por Município ───────────────────────────────────────────────────
  const cityRows = [
    ['Município', 'Qtd. Ocorrências'],
    ...data.byCity.map((c) => [c.city, c.count]),
  ]
  const wsCity = XLSX.utils.aoa_to_sheet(cityRows)
  wsCity['!cols'] = [{ wch: 28 }, { wch: 18 }]
  XLSX.utils.book_append_sheet(wb, wsCity, 'Por Município')

  // ── Aba 5: Severidade ──────────────────────────────────────────────────────
  const severityRows = [
    ['Nível', 'Qtd. Ocorrências', '% do Total'],
    ...data.bySeverity.map((s) => [s.label, s.count, `${s.pct}%`]),
  ]
  const wsSeverity = XLSX.utils.aoa_to_sheet(severityRows)
  wsSeverity['!cols'] = [{ wch: 14 }, { wch: 18 }, { wch: 14 }]
  XLSX.utils.book_append_sheet(wb, wsSeverity, 'Severidade')

  // ── Aba 6: Status ──────────────────────────────────────────────────────────
  const statusRows = [
    ['Status', 'Qtd. Ocorrências', '% do Total'],
    ...data.byStatus.map((s) => [s.label, s.count, `${s.pct}%`]),
  ]
  const wsStatus = XLSX.utils.aoa_to_sheet(statusRows)
  wsStatus['!cols'] = [{ wch: 18 }, { wch: 18 }, { wch: 14 }]
  XLSX.utils.book_append_sheet(wb, wsStatus, 'Status')

  // ── Aba 7: Ocorrências detalhadas ───────────────────────────────────────────
  const occurrenceRows = [
    ['ID', 'Tipo', 'Descrição/Risco', 'Severidade', 'Status', 'Município', 'Cidadão', 'Data', 'Latitude', 'Longitude'],
    ...(data.occurrences || []).map((item) => [
      item.id,
      item.tipo,
      item.descricao,
      item.severidade,
      item.status,
      item.municipio,
      item.cidadaoNome,
      item.data ? new Date(item.data).toLocaleString('pt-BR') : 'Data não informada',
      item.lat,
      item.lng,
    ]),
  ]
  const wsOccurrences = XLSX.utils.aoa_to_sheet(occurrenceRows)
  wsOccurrences['!cols'] = [
    { wch: 38 },
    { wch: 18 },
    { wch: 20 },
    { wch: 14 },
    { wch: 14 },
    { wch: 22 },
    { wch: 24 },
    { wch: 20 },
    { wch: 12 },
    { wch: 12 },
  ]
  XLSX.utils.book_append_sheet(wb, wsOccurrences, 'Ocorrências')

  XLSX.writeFile(wb, `SMDN_Relatorio_${period.replace(/\s+/g, '_')}.xlsx`)
}

// ─────────────────────────────────────────────────────────────────────────────
// CONSTANTES VISUAIS (independentes dos dados)
// ─────────────────────────────────────────────────────────────────────────────
const TYPE_COLORS = [
  'bg-text-main',
  'bg-status-severe',
  'bg-status-regular',
  'bg-action-inactive',
  'bg-status-critical',
  'bg-slate-400',
]

const PERIODS = ['Últimos 7 dias', 'Últimos 30 dias', 'Últimos 6 meses', 'Último ano']

const DONUT_R          = 54
const DONUT_CX         = 70
const DONUT_CY         = 70
const CIRCUMFERENCE    = 2 * Math.PI * DONUT_R

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

// ─────────────────────────────────────────────────────────────────────────────
// COMPONENTE PRINCIPAL
// ─────────────────────────────────────────────────────────────────────────────
export default function Relatorios() {
  const [period, setPeriod]       = useState('Últimos 6 meses')
  const [exporting, setExporting] = useState(null) // 'pdf' | 'excel' | null
  const reportRef                 = useRef(null)

  const { loading, error, data } = useReportData(period)

  const maxTotal = Math.max(1, ...data.monthly.map((m) => m.total))
  const maxCity  = Math.max(1, ...data.byCity.map((c) => c.count))
  const donutSegments = buildDonutSegments(data.byStatus)

  // ── Handlers de exportação ─────────────────────────────────────────────────
  const handleExportPDF = useCallback(async () => {
    if (!reportRef.current || exporting || loading) return
    setExporting('pdf')
    try {
      await exportToPDF(reportRef.current, period)
    } catch (err) {
      console.error('Erro ao gerar PDF:', err)
      alert('Não foi possível gerar o PDF. Verifique o console.')
    } finally {
      setExporting(null)
    }
  }, [period, exporting, loading])

  const handleExportExcel = useCallback(() => {
    if (exporting || loading) return
    setExporting('excel')
    try {
      exportToExcel(data, period)
    } catch (err) {
      console.error('Erro ao gerar Excel:', err)
      alert('Não foi possível gerar o Excel. Verifique o console.')
    } finally {
      setExporting(null)
    }
  }, [data, period, exporting, loading])

  // ── Render ─────────────────────────────────────────────────────────────────
  return (
    <div className="p-8 space-y-6 animate-fade-in">

      {/* ── Barra de controles (período + exportação) ── */}
      <div className="flex items-center justify-between flex-wrap gap-4" data-export-bar>
        {/* KPIs */}
        <div className="flex gap-4 flex-wrap">
          {[
            {
              label:    'TOTAL DE OCORRÊNCIAS',
              value:    String(data.kpis.total),
              delta:    data.kpis.totalDelta,
              positive: data.kpis.totalPositive,
              color:    'text-text-main',
            },
            {
              label:    'TAXA DE RESOLUÇÃO',
              value:    data.kpis.resolutionRate,
              delta:    data.kpis.resolutionDelta,
              positive: data.kpis.resolutionPositive,
              color:    'text-status-success',
            },
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

        {/* Seletor de período + botões */}
        <div className="flex flex-col items-end gap-2">
          <div className="flex items-center gap-2 bg-bg-surface border border-border-soft rounded-lg p-1">
            {PERIODS.map((p) => (
              <button
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-3 py-1.5 rounded text-xs font-semibold transition-all ${
                  period === p
                    ? 'bg-text-main text-white shadow-sm'
                    : 'text-slate-500 hover:text-slate-800'
                }`}
              >
                {p}
              </button>
            ))}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={handleExportPDF}
              disabled={!!exporting || loading}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-600 border border-border-soft rounded-lg bg-bg-surface hover:bg-slate-50 hover:border-slate-300 transition-all disabled:opacity-50 disabled:cursor-wait"
            >
              <img src={externalIcon} width="13" height="13" alt="" />
              {exporting === 'pdf' ? 'Gerando…' : 'Exportar PDF'}
            </button>
            <button
              onClick={handleExportExcel}
              disabled={!!exporting || loading}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-slate-600 border border-border-soft rounded-lg bg-bg-surface hover:bg-slate-50 hover:border-slate-300 transition-all disabled:opacity-50 disabled:cursor-wait"
            >
              <img src={externalIcon} width="13" height="13" alt="" />
              {exporting === 'excel' ? 'Gerando…' : 'Exportar Excel'}
            </button>
          </div>
        </div>
      </div>

      {loading && (
        <Card className="border border-blue-100 bg-blue-50/80">
          <p className="text-sm font-semibold text-blue-900">Carregando dados reais do Supabase...</p>
          <p className="text-xs text-blue-700 mt-1">A tela continua com o mesmo design, mas agora calcula tudo com Relato e Ocorrencia_Status.</p>
        </Card>
      )}

      {error && (
        <Card className="border border-red-100 bg-red-50/80">
          <p className="text-sm font-semibold text-red-800">Não foi possível carregar os relatórios.</p>
          <p className="text-xs text-red-700 mt-1">{error}</p>
        </Card>
      )}

      {/* ═══════════════════════════════════════════════════════════════════
          ÁREA CAPTURADA PELO PDF
          id="relatorio-content" + ref={reportRef}
          Tudo abaixo daqui vai para o PDF; os controles acima ficam de fora.
          ═══════════════════════════════════════════════════════════════════ */}
      <div id="relatorio-content" ref={reportRef} className="space-y-6 bg-bg-base rounded-xl">

        {/* Gráfico de barras mensal + Por Tipo */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <Card className="lg:col-span-2">
            <h3 className="text-card-title font-bold text-slate-800 mb-6">Ocorrências por Mês</h3>
            <div className="flex items-end gap-3 h-48">
              {data.monthly.map((m) => (
                <div key={m.month} className="flex-1 flex flex-col items-center gap-1.5">
                  <span className="text-[10px] text-slate-400 font-bold">{m.total}</span>
                  <div className="w-full flex flex-col justify-end" style={{ height: '160px' }}>
                    <div
                      className="w-full rounded-t bg-text-main/20 relative overflow-hidden flex flex-col justify-end"
                      style={{ height: `${(m.total / maxTotal) * 100}%` }}
                    >
                      <div
                        className="w-full bg-status-critical rounded-t"
                        style={{ height: `${m.total > 0 ? (m.critical / m.total) * 100 : 0}%` }}
                      />
                    </div>
                  </div>
                  <span className="text-[11px] text-slate-500 font-medium">{m.month}</span>
                </div>
              ))}
            </div>
            <div className="flex items-center gap-5 mt-4">
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-text-main/20 block" />
                <span className="text-xs text-slate-500">Total</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-3 h-3 rounded-sm bg-status-critical block" />
                <span className="text-xs text-slate-500">Críticos</span>
              </div>
            </div>
          </Card>

          <Card>
            <h3 className="text-card-title font-bold text-slate-800 mb-5">Por Tipo</h3>
            <div className="space-y-3">
              {data.byType.length === 0 && (
                <p className="text-sm text-slate-400">Nenhuma ocorrência no período.</p>
              )}
              {data.byType.map((t, i) => (
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

        {/* Severidade + Status */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <h3 className="text-card-title font-bold text-slate-800 mb-5">Distribuição de Severidade</h3>
            <div className="space-y-4">
              {data.bySeverity.map((s) => (
                <div key={s.label}>
                  <div className="flex justify-between text-xs mb-1.5">
                    <span className={`font-bold ${s.text}`}>{s.label}</span>
                    <span className="text-slate-400 font-bold">
                      {s.count} <span className="text-slate-300">({s.pct}%)</span>
                    </span>
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
              {data.bySeverity.map((s) => (
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
                  <span className="text-2xl font-bold text-slate-800">{data.kpis.total}</span>
                  <span className="text-[10px] text-slate-400 font-semibold">total</span>
                </div>
              </div>
              <div className="flex-1 space-y-4">
                {data.byStatus.map((s) => (
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
                        style={{
                          width:           `${s.pct}%`,
                          backgroundColor: s.color,
                          transition:      'width 0.7s ease',
                        }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>

        {/* Por Município */}
        <Card>
          <h3 className="text-card-title font-bold text-slate-800 mb-5">Ocorrências por Município</h3>
          <div className="space-y-3">
            {data.byCity.length === 0 && (
              <p className="text-sm text-slate-400">Nenhuma ocorrência com município no período.</p>
            )}
            {data.byCity.map((c) => (
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

      </div>{/* fim #relatorio-content */}
    </div>
  )
}
