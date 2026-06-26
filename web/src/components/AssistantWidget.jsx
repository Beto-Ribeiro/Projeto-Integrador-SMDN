import { Fragment, useEffect, useMemo, useRef, useState } from 'react'
import assistantIcon from '../assets/assistant/assistant-icon.svg'
import { askSmdnAssistant } from '../backend/ai/assistantService.js'
import { buildSmdnOperationalContext } from '../backend/ai/smdnContextService.js'
import { collectCurrentUiContext, executeAssistantUiActions } from '../backend/ai/domContextService.js'
import { useAuth } from '../hooks/useAuth.js'

const SCREEN_CONTEXT = {
  dashboard: {
    title: 'Dashboard',
    intro: 'Ajude a entender mapa, ocorrências críticas, alertas ativos, vítimas e status operacional.',
    suggestions: ['Resuma esta tela', 'O que devo conferir primeiro?'],
  },
  reportar: {
    title: 'Reportar',
    intro: 'Ajude a revisar mensagens antes do disparo de alertas públicos.',
    suggestions: ['Revise um alerta antes de disparar', 'Como escrever uma boa mensagem de alerta?'],
  },
  ocorrencias: {
    title: 'Ocorrências',
    intro: 'Ajude a priorizar relatos, status e ocorrências críticas.',
    suggestions: ['Como priorizar ocorrências?', 'Explique os status de ocorrência'],
  },
  relatorios: {
    title: 'Relatórios',
    intro: 'Ajude a interpretar KPIs, gráficos, municípios, tipos e severidades.',
    suggestions: ['Gere um resumo executivo', 'O que destacar em uma apresentação?'],
  },
  auditoria: {
    title: 'Auditoria',
    intro: 'Ajude a interpretar logs, responsáveis, ações e impacto das alterações.',
    suggestions: ['Como ler os logs?', 'O que procurar em uma auditoria?'],
  },
  perfil: {
    title: 'Perfil',
    intro: 'Ajude a entender permissões, perfil de usuário e atividades recentes.',
    suggestions: ['Explique minhas permissões', 'Como interpretar atividades recentes?'],
  },
  admin: {
    title: 'Painel do Admin',
    intro: 'Ajude a revisar solicitações de acesso e alterações administrativas.',
    suggestions: ['Checklist para aprovar acesso', 'Como avaliar solicitação suspeita?'],
  },
  users: {
    title: 'Lista de Usuários',
    intro: 'Ajude a revisar vínculos, perfis e permissões de usuários.',
    suggestions: ['Como revisar permissões?', 'Como identificar inconsistências de usuário?'],
  },
}

const MIN_PANEL_WIDTH = 340
const MIN_PANEL_HEIGHT = 430
const EDGE_GAP = 8

function getViewport() {
  return {
    width: window.innerWidth || 1366,
    height: window.innerHeight || 768,
  }
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max)
}

function clampPanel(panel) {
  const viewport = getViewport()
  const maxWidth = Math.max(MIN_PANEL_WIDTH, viewport.width - EDGE_GAP * 2)
  const maxHeight = Math.max(MIN_PANEL_HEIGHT, viewport.height - EDGE_GAP * 2)
  const width = clamp(panel.width, MIN_PANEL_WIDTH, maxWidth)
  const height = clamp(panel.height, MIN_PANEL_HEIGHT, maxHeight)
  const x = clamp(panel.x, EDGE_GAP, Math.max(EDGE_GAP, viewport.width - width - EDGE_GAP))
  const y = clamp(panel.y, EDGE_GAP, Math.max(EDGE_GAP, viewport.height - height - EDGE_GAP))

  return { x, y, width, height }
}

function createInitialPanel(compact = false) {
  const viewport = getViewport()
  const width = 420
  const height = Math.min(760, Math.max(MIN_PANEL_HEIGHT, viewport.height - 80))
  return clampPanel({
    x: compact ? 70 : 210,
    y: Math.max(EDGE_GAP, viewport.height - height - 64),
    width,
    height,
  })
}

function SparkIcon() {
  return (
    <svg width="20" height="20" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M12 2l1.5 5.2L19 9l-5.5 1.8L12 16l-1.5-5.2L5 9l5.5-1.8L12 2Z" stroke="currentColor" strokeWidth="1.8" strokeLinejoin="round" />
      <path d="M18 14l.8 2.6 2.7.9-2.7.9L18 21l-.8-2.6-2.7-.9 2.7-.9L18 14Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
      <path d="M5.5 14l.6 1.9 1.9.6-1.9.6-.6 1.9-.6-1.9-1.9-.6 1.9-.6.6-1.9Z" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" />
    </svg>
  )
}

function buildInitialMessages(context) {
  return [
    {
      role: 'assistant',
      text: `Oi! Estou vendo a tela ${context.title}. Posso consultar dados reais, ler popups abertos, preencher campos, navegar e agir como suporte geral do SMDN.`,
    },
  ]
}

function getInitials(nameOrEmail) {
  const value = String(nameOrEmail || 'Usuário').replace(/@.*/, '').trim()
  return (
    value
      .split(/\s+/)
      .filter(Boolean)
      .map((part) => part[0])
      .slice(0, 2)
      .join('')
      .toUpperCase() || 'U'
  )
}

function getUserDisplayName(user) {
  return (
    user?.name ||
    user?.prf_nome ||
    user?.perfil?.prf_nome ||
    user?.email ||
    user?.prf_email_contato ||
    'Usuário SMDN'
  )
}

function getUserAvatarUrl(user) {
  return (
    user?.avatar ||
    user?.avatarUrl ||
    user?.prf_avatar_url ||
    user?.perfil?.prf_avatar_url ||
    user?.user_metadata?.avatar_url ||
    null
  )
}

function UserMessageAvatar({ user }) {
  const name = getUserDisplayName(user)
  const avatarUrl = getUserAvatarUrl(user)

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={`Foto de ${name}`}
        className="mt-0.5 h-8 w-8 rounded-xl border border-white/10 object-cover flex-shrink-0 bg-text-main/20"
      />
    )
  }

  return (
    <div
      className="mt-0.5 h-8 w-8 rounded-xl border border-white/10 bg-text-main/30 flex items-center justify-center flex-shrink-0"
      aria-label={`Avatar de ${name}`}
      title={name}
    >
      <span className="text-[10px] font-black text-white">{getInitials(name)}</span>
    </div>
  )
}

function renderInlineMarkdown(text) {
  const parts = String(text || '').split(/(\*\*[^*]+\*\*)/g)

  return parts.map((part, index) => {
    if (part.startsWith('**') && part.endsWith('**')) {
      return (
        <strong key={index} className="font-extrabold text-inherit">
          {part.slice(2, -2)}
        </strong>
      )
    }

    return <Fragment key={index}>{part}</Fragment>
  })
}

function renderMessageText(text) {
  const lines = String(text || '').split('\n')

  return lines.map((line, index) => {
    const bullet = line.match(/^\s*\*\s+(.*)$/)
    const content = bullet ? bullet[1] : line

    return (
      <Fragment key={`${line}-${index}`}>
        {bullet ? (
          <span className="block pl-4 -indent-4">
            <span aria-hidden="true">• </span>
            {renderInlineMarkdown(content)}
          </span>
        ) : (
          <span>{renderInlineMarkdown(content)}</span>
        )}
        {index < lines.length - 1 && !bullet && <br />}
      </Fragment>
    )
  })
}

function scheduleUiEvent(name, detail, delay = 180) {
  window.setTimeout(() => {
    window.dispatchEvent(new CustomEvent(name, { detail }))
  }, delay)
}

function normalizeAction(action) {
  if (!action || typeof action !== 'object') return null
  return {
    ...action,
    type: String(action.type || '').trim().toLowerCase(),
  }
}

export default function AssistantWidget({ currentScreen, setCurrentScreen, compact = false }) {
  const { user } = useAuth()
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const [draft, setDraft] = useState('')
  const [sending, setSending] = useState(false)
  const [error, setError] = useState('')
  const [panel, setPanel] = useState(() => createInitialPanel(compact))

  const panelRef = useRef(null)
  const buttonRef = useRef(null)
  const messagesEndRef = useRef(null)
  const interactionRef = useRef(null)

  const context = useMemo(
    () => SCREEN_CONTEXT[currentScreen] || SCREEN_CONTEXT.dashboard,
    [currentScreen]
  )

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages(buildInitialMessages(context))
    }
  }, [context, messages.length, open])

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth', block: 'end' })
  }, [messages, sending])

  useEffect(() => {
    function handleResizeWindow() {
      setPanel((current) => clampPanel(current))
    }

    window.addEventListener('resize', handleResizeWindow)
    return () => window.removeEventListener('resize', handleResizeWindow)
  }, [])

  useEffect(() => {
    function handlePointerMove(event) {
      const interaction = interactionRef.current
      if (!interaction) return

      event.preventDefault()

      const dx = event.clientX - interaction.startX
      const dy = event.clientY - interaction.startY

      if (interaction.type === 'drag') {
        setPanel(
          clampPanel({
            ...interaction.startPanel,
            x: interaction.startPanel.x + dx,
            y: interaction.startPanel.y + dy,
          })
        )
        return
      }

      if (interaction.type === 'resize') {
        const next = { ...interaction.startPanel }
        const direction = interaction.direction

        if (direction.includes('e')) next.width = interaction.startPanel.width + dx
        if (direction.includes('s')) next.height = interaction.startPanel.height + dy
        if (direction.includes('w')) {
          next.width = interaction.startPanel.width - dx
          next.x = interaction.startPanel.x + dx
        }
        if (direction.includes('n')) {
          next.height = interaction.startPanel.height - dy
          next.y = interaction.startPanel.y + dy
        }

        setPanel(clampPanel(next))
      }
    }

    function handlePointerUp() {
      interactionRef.current = null
      document.body.style.userSelect = ''
      document.body.style.cursor = ''
    }

    window.addEventListener('mousemove', handlePointerMove)
    window.addEventListener('mouseup', handlePointerUp)

    return () => {
      window.removeEventListener('mousemove', handlePointerMove)
      window.removeEventListener('mouseup', handlePointerUp)
      document.body.style.userSelect = ''
      document.body.style.cursor = ''
    }
  }, [])

  function startDrag(event) {
    if (event.button !== 0) return

    event.preventDefault()

    interactionRef.current = {
      type: 'drag',
      startX: event.clientX,
      startY: event.clientY,
      startPanel: panel,
    }

    document.body.style.userSelect = 'none'
    document.body.style.cursor = 'move'
  }

  function startResize(event, direction, cursor) {
    if (event.button !== 0) return

    event.preventDefault()
    event.stopPropagation()

    interactionRef.current = {
      type: 'resize',
      direction,
      startX: event.clientX,
      startY: event.clientY,
      startPanel: panel,
    }

    document.body.style.userSelect = 'none'
    document.body.style.cursor = cursor
  }

  function restartChat() {
    setMessages(buildInitialMessages(context))
    setDraft('')
    setError('')
  }

  function applyLegacyActions(actions = []) {
    const normalizedActions = actions.map(normalizeAction).filter(Boolean)

    for (const action of normalizedActions) {
      if (action.type === 'open_user') {
        const detail = {
          mode: 'open',
          query: action.query || action.name || action.id || '',
        }
        window.__SMDN_AI_PENDING_USER_ACTION = detail
        setCurrentScreen('users')
        scheduleUiEvent('smdn-ai-users-action', detail)
      }

      if (action.type === 'filter_users') {
        const detail = {
          mode: 'filter',
          query: action.query || action.role || action.userType || action.type || '',
        }
        window.__SMDN_AI_PENDING_USER_ACTION = detail
        setCurrentScreen('users')
        scheduleUiEvent('smdn-ai-users-action', detail)
      }

      if (action.type === 'open_dashboard_occurrence') {
        const detail = {
          id: action.id || action.relatoId || '',
          query: action.query || action.title || '',
        }
        window.__SMDN_AI_PENDING_DASHBOARD_ACTION = detail
        setCurrentScreen('dashboard')
        scheduleUiEvent('smdn-ai-dashboard-open-occurrence', detail)
      }

      if (action.type === 'filter_audit') {
        const detail = {
          query: action.query || '',
          type: action.auditType || action.kind || action.filterType || '',
          openFirst: action.openFirst !== false,
        }
        window.__SMDN_AI_PENDING_AUDIT_ACTION = detail
        setCurrentScreen('auditoria')
        scheduleUiEvent('smdn-ai-audit-action', detail)
      }
    }
  }

  async function sendToGemini(text) {
    const cleanText = String(text || '').trim()

    if (!cleanText || sending) return

    setError('')
    setSending(true)
    setDraft('')

    const userMessage = { role: 'user', text: cleanText }
    const historyBeforeSend = messages

    setMessages((current) => [...current, userMessage])

    try {
      const operationalContext = await buildSmdnOperationalContext({
        question: cleanText,
        currentScreen,
      })

      const uiContext = collectCurrentUiContext({
        currentScreen,
        screenTitle: context.title,
      })

      const result = await askSmdnAssistant({
        message: cleanText,
        currentScreen,
        screenTitle: context.title,
        screenIntro: context.intro,
        history: historyBeforeSend,
        operationalContext,
        uiContext,
      })

      applyLegacyActions(result.actions)

      const uiResults = await executeAssistantUiActions(result.actions, {
        setCurrentScreen,
      })

      const blocked = uiResults.filter((item) => item.ok === false && item.reason)
      const extra =
        blocked.length > 0
          ? `\n\n*Observação:* ${blocked.map((item) => item.reason).join('; ')}`
          : ''

      setMessages((current) => [
        ...current,
        {
          role: 'assistant',
          text: `${result.text || 'Não consegui gerar uma resposta agora.'}${extra}`,
        },
      ])
    } catch (err) {
      setError(err?.message || 'Não foi possível consultar a IA.')
    } finally {
      setSending(false)
    }
  }

  function handleSubmit(event) {
    event.preventDefault()
    sendToGemini(draft)
  }

  return (
    <div className="relative">
      <button
        ref={buttonRef}
        type="button"
        onClick={() => setOpen((value) => !value)}
        className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-text-on-dark hover:bg-white/5 hover:text-white transition-all focus-visible:outline focus-visible:outline-2 focus-visible:outline-white ${compact ? 'justify-center' : ''}`}
        aria-expanded={open}
        aria-label="Abrir IA SMDN"
      >
        <SparkIcon />
        <span className={compact ? 'sr-only' : undefined}>IA SMDN</span>
      </button>

      {open && (
        <div
          ref={panelRef}
          className="fixed z-[99998] overflow-hidden rounded-3xl border border-border-soft bg-bg-surface shadow-2xl animate-slide-up flex flex-col"
          style={{
            left: `${panel.x}px`,
            top: `${panel.y}px`,
            width: `${panel.width}px`,
            height: `${panel.height}px`,
          }}
          role="dialog"
          aria-label="Assistente IA SMDN"
        >
          <div
            className="flex cursor-move items-center justify-between gap-3 border-b border-border-soft px-4 py-3 bg-text-main/5"
            onMouseDown={startDrag}
            title="Arraste para mover o chat"
          >
            <button
              type="button"
              onClick={restartChat}
              onMouseDown={(event) => event.stopPropagation()}
              className="rounded-xl border border-border-soft bg-bg-surface px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-text-main"
            >
              Reiniciar chat
            </button>

            <span className="hidden text-[11px] font-bold uppercase tracking-[0.18em] text-slate-400 sm:inline">
              Arraste para mover
            </span>

            <button
              type="button"
              onClick={() => setOpen(false)}
              onMouseDown={(event) => event.stopPropagation()}
              className="rounded-lg p-2 text-slate-400 hover:bg-white/60 hover:text-slate-700 focus-visible:outline focus-visible:outline-2 focus-visible:outline-text-main"
              aria-label="Fechar assistente"
            >
              ×
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3" aria-live="polite">
            {messages.map((message, index) => {
              const isAssistant = message.role === 'assistant'

              return (
                <div
                  key={`${message.role}-${index}`}
                  className={`flex items-start gap-2 ${isAssistant ? 'justify-start' : 'justify-end'}`}
                >
                  {isAssistant && (
                    <img
                      src={assistantIcon}
                      alt=""
                      className="mt-0.5 h-8 w-8 rounded-xl border border-border-soft object-cover flex-shrink-0"
                      aria-hidden="true"
                    />
                  )}

                  <div
                    className={`rounded-2xl px-3 py-2 text-sm leading-relaxed whitespace-pre-wrap ${
                      isAssistant
                        ? 'bg-slate-100 text-slate-700 mr-3'
                        : 'bg-text-main text-white ml-8'
                    }`}
                  >
                    {renderMessageText(message.text)}
                  </div>

                  {!isAssistant && <UserMessageAvatar user={user} />}
                </div>
              )
            })}

            {sending && (
              <div className="flex items-start gap-2 justify-start">
                <img
                  src={assistantIcon}
                  alt=""
                  className="mt-0.5 h-8 w-8 rounded-xl border border-border-soft object-cover flex-shrink-0"
                  aria-hidden="true"
                />
                <div className="rounded-2xl bg-slate-100 px-3 py-2 text-sm text-slate-700 mr-3">
                  Lendo telas, dados reais e popups abertos...
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          <div className="border-t border-border-soft p-4 space-y-2">
            <div className="grid gap-2">
              {context.suggestions.map((label) => (
                <button
                  key={label}
                  type="button"
                  onClick={() => sendToGemini(label)}
                  disabled={sending}
                  className="w-full rounded-xl border border-border-soft bg-bg-surface px-3 py-2 text-left text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors disabled:opacity-60"
                >
                  {label}
                </button>
              ))}
            </div>

            <form onSubmit={handleSubmit} className="space-y-2 pt-2">
              <label htmlFor="smdn-ai-message" className="sr-only">
                Mensagem para IA SMDN
              </label>

              <textarea
                id="smdn-ai-message"
                value={draft}
                onChange={(event) => setDraft(event.target.value)}
                placeholder="Pergunte algo sobre esta tela..."
                rows={3}
                disabled={sending}
                className="w-full resize-none rounded-xl border border-border-soft bg-bg-surface px-3 py-2 text-sm text-slate-700 placeholder:text-slate-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-text-main disabled:opacity-60"
              />

              {error && (
                <p
                  role="alert"
                  className="rounded-lg border border-red-100 bg-red-50 px-3 py-2 text-xs font-semibold text-red-700"
                >
                  {error}
                </p>
              )}

              <button
                type="submit"
                disabled={sending || !draft.trim()}
                className="w-full rounded-xl bg-text-main px-3 py-2 text-sm font-bold text-white hover:bg-action-hover disabled:cursor-not-allowed disabled:opacity-60"
              >
                {sending ? 'Consultando IA...' : 'Enviar para IA'}
              </button>
            </form>

            <div className="grid grid-cols-2 gap-2 pt-1">
              <button
                type="button"
                onClick={() => setCurrentScreen('relatorios')}
                className="rounded-xl bg-text-main/10 px-3 py-2 text-xs font-bold text-text-main hover:bg-text-main/20"
              >
                Ver relatórios
              </button>

              <button
                type="button"
                onClick={() => setCurrentScreen('auditoria')}
                className="rounded-xl bg-text-main/10 px-3 py-2 text-xs font-bold text-text-main hover:bg-text-main/20"
              >
                Ver auditoria
              </button>
            </div>
          </div>

          <button type="button" aria-label="Redimensionar para cima" className="absolute left-4 right-4 top-0 h-2 cursor-ns-resize" onMouseDown={(event) => startResize(event, 'n', 'ns-resize')} />
          <button type="button" aria-label="Redimensionar para baixo" className="absolute bottom-0 left-4 right-4 h-2 cursor-ns-resize" onMouseDown={(event) => startResize(event, 's', 'ns-resize')} />
          <button type="button" aria-label="Redimensionar para esquerda" className="absolute bottom-4 left-0 top-4 w-2 cursor-ew-resize" onMouseDown={(event) => startResize(event, 'w', 'ew-resize')} />
          <button type="button" aria-label="Redimensionar para direita" className="absolute bottom-4 right-0 top-4 w-2 cursor-ew-resize" onMouseDown={(event) => startResize(event, 'e', 'ew-resize')} />
          <button type="button" aria-label="Redimensionar canto superior esquerdo" className="absolute left-0 top-0 h-4 w-4 cursor-nwse-resize" onMouseDown={(event) => startResize(event, 'nw', 'nwse-resize')} />
          <button type="button" aria-label="Redimensionar canto superior direito" className="absolute right-0 top-0 h-4 w-4 cursor-nesw-resize" onMouseDown={(event) => startResize(event, 'ne', 'nesw-resize')} />
          <button type="button" aria-label="Redimensionar canto inferior esquerdo" className="absolute bottom-0 left-0 h-4 w-4 cursor-nesw-resize" onMouseDown={(event) => startResize(event, 'sw', 'nesw-resize')} />
          <button type="button" aria-label="Redimensionar canto inferior direito" className="absolute bottom-0 right-0 h-5 w-5 cursor-nwse-resize rounded-tl-lg bg-text-main/20 hover:bg-text-main/30" onMouseDown={(event) => startResize(event, 'se', 'nwse-resize')} title="Redimensionar" />
        </div>
      )}
    </div>
  )
}
