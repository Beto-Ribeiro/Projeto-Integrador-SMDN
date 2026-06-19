import { useEffect, useMemo, useRef, useState } from 'react'
import assistantIcon from '../assets/assistant/assistant-icon.svg'

const SCREEN_CONTEXT = {
  dashboard: {
    title: 'Dashboard',
    intro: 'Posso te ajudar a entender o mapa, ocorrências críticas e alertas ativos.',
    suggestions: [
      ['Resumo da tela', 'Você está no Dashboard. Verifique primeiro as ocorrências críticas, depois compare mapa de calor com pontos para saber se há concentração territorial.'],
      ['O que conferir?', 'Confira se os cards inferiores batem com a lista de ocorrências recentes. Se houver ocorrência sem localização, ela aparece na lista, mas não no mapa.'],
    ],
  },
  reportar: {
    title: 'Reportar',
    intro: 'Posso revisar a mensagem antes de disparar um alerta.',
    suggestions: [
      ['Checklist de alerta', 'Antes de disparar: tipo do desastre, cidade/bairro, severidade, descrição objetiva e público destinatário.'],
      ['Boa mensagem', 'Use frases curtas: o que aconteceu, onde, risco, orientação e fonte do alerta.'],
    ],
  },
  ocorrencias: {
    title: 'Ocorrências',
    intro: 'Posso ajudar a priorizar relatos e status.',
    suggestions: [
      ['Prioridade', 'Priorize ocorrências críticas com localização e foto. Depois revise as em monitoramento e finalize as resolvidas.'],
      ['Padrão de status', 'Pendente = precisa triagem. Em andamento = equipe acompanhando. Resolvida = sem ação pendente.'],
    ],
  },
  relatorios: {
    title: 'Relatórios',
    intro: 'Posso sugerir leituras para apresentação.',
    suggestions: [
      ['Resumo executivo', 'Comece pelo total, taxa de resolução e severidade. Depois explique município e tipo mais frequentes.'],
      ['Exportação', 'Use PDF para banca/apresentação e Excel para análise detalhada das ocorrências.'],
    ],
  },
  auditoria: {
    title: 'Auditoria',
    intro: 'Posso te ajudar a identificar responsável, alvo e impacto.',
    suggestions: [
      ['Como ler auditoria', 'Veja: responsável pela ação, pessoa afetada, tipo de evento, data e detalhes. Clique no registro para abrir o histórico completo.'],
      ['Risco comum', 'Eventos sem alvo claro confundem revisão. Prefira registros que sempre tenham responsável, afetado e antes/depois.'],
    ],
  },
  perfil: {
    title: 'Perfil',
    intro: 'Posso revisar permissões e atividades recentes.',
    suggestions: [
      ['Permissões', 'Sem perfil e cidadão não entram no web. Funcionário e instituição entram no sistema. Apenas administrador acessa Administração.'],
      ['Atividades', 'Passe o mouse para resumo e clique para abrir detalhes completos da atividade.'],
    ],
  },
  admin: {
    title: 'Painel do Admin',
    intro: 'Posso apoiar aprovação de solicitações.',
    suggestions: [
      ['Aprovação segura', 'Antes de aprovar, confira nome, e-mail, instituição, cargo e documento. Registre observação quando recusar.'],
      ['Regra de acesso', 'Só administrador deve receber acesso ao painel administrativo. Funcionários/instituições acessam módulos operacionais.'],
    ],
  },
  users: {
    title: 'Lista de Usuários',
    intro: 'Posso ajudar a revisar vínculos e permissões.',
    suggestions: [
      ['Edição de usuário', 'Ao alterar tipo de perfil, revise permissões. O tipo administrador cria vínculo administrativo; outros tipos não devem ter admin.'],
      ['Auditoria', 'Toda alteração importante deve deixar rastro em Atividade Recente e Auditoria.'],
    ],
  },
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
      text: `Oi! Estou vendo a tela ${context.title}. ${context.intro}`,
    },
  ]
}

export default function AssistantWidget({ currentScreen, setCurrentScreen, compact = false }) {
  const [open, setOpen] = useState(false)
  const [messages, setMessages] = useState([])
  const panelRef = useRef(null)
  const buttonRef = useRef(null)

  const context = useMemo(
    () => SCREEN_CONTEXT[currentScreen] || SCREEN_CONTEXT.dashboard,
    [currentScreen]
  )

  useEffect(() => {
    if (open && messages.length === 0) {
      setMessages(buildInitialMessages(context))
    }
  }, [context, messages.length, open])

  function restartChat() {
    setMessages(buildInitialMessages(context))
  }

  useEffect(() => {
    function handleClickOutside(event) {
      if (!open) return
      if (
        panelRef.current &&
        !panelRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setOpen(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [open])

  function sendSuggestion(label, response) {
    setMessages((current) => [
      ...current,
      { role: 'user', text: label },
      { role: 'assistant', text: response },
    ])
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
          className={`fixed bottom-16 ${compact ? 'left-[70px]' : 'left-[210px]'} z-[99998] w-[360px] max-h-[calc(100vh-5rem)] overflow-hidden rounded-3xl border border-border-soft bg-bg-surface shadow-2xl animate-slide-up flex flex-col`}
          role="dialog"
          aria-label="Assistente IA SMDN"
        >
          <div className="flex items-center justify-between gap-3 border-b border-border-soft px-4 py-3 bg-text-main/5">
            <button
              type="button"
              onClick={restartChat}
              className="rounded-xl border border-border-soft bg-bg-surface px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-50 focus-visible:outline focus-visible:outline-2 focus-visible:outline-text-main"
            >
              Reiniciar chat
            </button>
            <button
              type="button"
              onClick={() => setOpen(false)}
              className="rounded-lg p-2 text-slate-400 hover:bg-white/60 hover:text-slate-700"
              aria-label="Fechar assistente"
            >
              ×
            </button>
          </div>

          <div className="flex-1 overflow-y-auto p-4 space-y-3">
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
                    className={`rounded-2xl px-3 py-2 text-sm leading-relaxed ${
                      isAssistant
                        ? 'bg-slate-100 text-slate-700 mr-3'
                        : 'bg-text-main text-white ml-8'
                    }`}
                  >
                    {message.text}
                  </div>
                </div>
              )
            })}
          </div>

          <div className="border-t border-border-soft p-4 space-y-2">
            {context.suggestions.map(([label, response]) => (
              <button
                key={label}
                type="button"
                onClick={() => sendSuggestion(label, response)}
                className="w-full rounded-xl border border-border-soft bg-bg-surface px-3 py-2 text-left text-sm font-bold text-slate-700 hover:bg-slate-50 transition-colors"
              >
                {label}
              </button>
            ))}

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
        </div>
      )}
    </div>
  )
}
