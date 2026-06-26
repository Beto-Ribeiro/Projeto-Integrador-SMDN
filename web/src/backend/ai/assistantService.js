import { initializeApp, getApp, getApps } from 'firebase/app'
import { getAI, getGenerativeModel, VertexAIBackend } from 'firebase/ai'

function getEnv(name, fallback = '') {
  return String(import.meta.env[name] || fallback).trim()
}

const firebaseConfig = {
  apiKey: getEnv('VITE_FIREBASE_API_KEY'),
  authDomain: getEnv('VITE_FIREBASE_AUTH_DOMAIN'),
  projectId: getEnv('VITE_FIREBASE_PROJECT_ID'),
  storageBucket: getEnv('VITE_FIREBASE_STORAGE_BUCKET'),
  messagingSenderId: getEnv('VITE_FIREBASE_MESSAGING_SENDER_ID'),
  appId: getEnv('VITE_FIREBASE_APP_ID'),
}

const AVAILABLE_ACTIONS = [
  'navigate',
  'fill',
  'select',
  'click',
  'open_modal',
  'focus',
  'highlight',
  'scroll_to',
  'open_user',
  'filter_users',
  'open_dashboard_occurrence',
  'filter_audit',
]

function validateFirebaseConfig() {
  const missing = Object.entries(firebaseConfig)
    .filter(([, value]) => !value)
    .map(([key]) => key)

  if (missing.length > 0) {
    throw new Error(`Configuração Firebase incompleta no .env: ${missing.join(', ')}`)
  }
}

function getFirebaseApp() {
  return getApps().length > 0 ? getApp() : initializeApp(firebaseConfig)
}

function sanitizeText(value, maxLength = 4000) {
  return String(value || '').trim().slice(0, maxLength)
}

function normalizeHistory(history = []) {
  if (!Array.isArray(history)) return ''

  return history
    .slice(-8)
    .map((item) => {
      const role = item?.role === 'assistant' ? 'IA SMDN' : 'Usuário'
      const text = sanitizeText(item?.text, 1200)
      return text ? `${role}: ${text}` : ''
    })
    .filter(Boolean)
    .join('\n')
}

function buildPrompt({
  message,
  currentScreen,
  screenTitle,
  screenIntro,
  history,
  operationalContext,
  uiContext,
}) {
  const historyText = normalizeHistory(history)

  return [
    'Você é a IA SMDN, assistente operacional avançado do Sistema de Monitoramento de Desastres Naturais.',
    'Você deve agir como suporte geral do sistema: interpretar dados, explicar telas, navegar, preencher formulários, destacar elementos e ajudar em popups abertos.',
    'Você recebe dois tipos de contexto: dados operacionais reais do SMDN e um retrato da interface visível no navegador.',
    'Use os dados fornecidos. Não diga que não tem acesso se a informação existir no contexto operacional ou na interface.',
    'Se a pergunta mencionar uma pessoa, usuário, administrador, cidadão, operador, auditoria, alerta, ocorrência, relatório ou campo visível, procure primeiro no contexto.',
    'Quando existir popup/modal aberto, trate o popup como prioridade de contexto.',
    'Você pode sugerir, preencher campos e clicar em botões seguros. Não confirme ações sensíveis sozinho, como disparar alerta, excluir, aprovar, rejeitar ou salvar mudanças críticas, a menos que o usuário peça explicitamente para confirmar.',
    'Responda em português do Brasil, com clareza, objetividade e tom de suporte.',
    'Use Markdown simples: **negrito**, listas com * item e quebras de linha.',
    '',
    'FORMATO OBRIGATÓRIO DA RESPOSTA:',
    'Retorne SOMENTE um JSON válido, sem markdown fora do JSON.',
    'Estrutura:',
    '{',
    '  "answer": "texto em markdown simples para mostrar ao usuário",',
    '  "actions": [',
    '    { "type": "navigate", "screen": "dashboard|reportar|ocorrencias|relatorios|auditoria|perfil|admin|users" },',
    '    { "type": "fill", "target": "label/placeholder/aiId do campo", "value": "texto para preencher" },',
    '    { "type": "select", "target": "label/placeholder/aiId do select", "value": "opção" },',
    '    { "type": "click", "target": "texto/aiId do botão", "confirm": false },',
    '    { "type": "open_modal", "target": "texto/aiId do botão" },',
    '    { "type": "highlight", "target": "texto/aiId do elemento" }',
    '  ]',
    '}',
    '',
    'Ações permitidas:',
    AVAILABLE_ACTIONS.join(', '),
    '',
    'Exemplos:',
    'Usuário: "me leve ao dashboard"',
    '{"answer":"Pronto, te levei para **Dashboard**.","actions":[{"type":"navigate","screen":"dashboard"}]}',
    '',
    'Usuário: "escreve um alerta de enchente crítica em Roseira"',
    '{"answer":"Preenchi um rascunho de alerta. Revise antes de confirmar o disparo.","actions":[{"type":"select","target":"Tipo de ocorrência","value":"Enchente"},{"type":"select","target":"Severidade","value":"Crítico"},{"type":"fill","target":"Município","value":"Roseira"},{"type":"fill","target":"Descrição","value":"Alerta de enchente crítica em Roseira. Evite áreas alagadas, busque locais seguros e acompanhe orientações da Defesa Civil."}]}',
    '',
    `Tela atual: ${sanitizeText(screenTitle || currentScreen || 'SMDN', 120)}`,
    screenIntro ? `Contexto da tela: ${sanitizeText(screenIntro, 500)}` : '',
    historyText ? `Histórico recente:\n${historyText}` : '',
    operationalContext ? `DADOS OPERACIONAIS REAIS DO SMDN:\n${JSON.stringify(operationalContext).slice(0, 22000)}` : '',
    uiContext ? `INTERFACE VISÍVEL NO NAVEGADOR:\n${JSON.stringify(uiContext).slice(0, 22000)}` : '',
    `Pergunta do usuário:\n${sanitizeText(message, 2500)}`,
  ]
    .filter(Boolean)
    .join('\n\n')
}

function extractText(result) {
  if (typeof result?.response?.text === 'function') {
    return result.response.text()
  }

  if (typeof result?.text === 'function') {
    return result.text()
  }

  if (typeof result?.text === 'string') {
    return result.text
  }

  return ''
}

function createVertexBackend(location) {
  try {
    return new VertexAIBackend(location)
  } catch {
    try {
      return new VertexAIBackend({ location })
    } catch {
      return new VertexAIBackend()
    }
  }
}

function createGenerativeModel() {
  validateFirebaseConfig()

  const app = getFirebaseApp()
  const location = getEnv('VITE_FIREBASE_VERTEX_LOCATION', 'global')
  const modelName = getEnv('VITE_FIREBASE_VERTEX_MODEL', 'gemini-2.5-flash')

  const ai = getAI(app, {
    backend: createVertexBackend(location),
  })

  const model = getGenerativeModel(ai, {
    model: modelName,
  })

  console.log('🔥 SMDN IA — MODO OPERADOR COM VERTEX AI 🔥', {
    projectId: firebaseConfig.projectId,
    appId: firebaseConfig.appId,
    location,
    model: modelName,
  })

  return { model, modelName }
}

function extractJsonObject(text) {
  const raw = String(text || '').trim()

  try {
    return JSON.parse(raw)
  } catch {
    // continua
  }

  const fenced = raw.match(/```(?:json)?\s*([\s\S]*?)```/i)
  if (fenced?.[1]) {
    try {
      return JSON.parse(fenced[1].trim())
    } catch {
      // continua
    }
  }

  const start = raw.indexOf('{')
  const end = raw.lastIndexOf('}')

  if (start >= 0 && end > start) {
    try {
      return JSON.parse(raw.slice(start, end + 1))
    } catch {
      // continua
    }
  }

  return {
    answer: raw,
    actions: [],
  }
}

function normalizeAiResponse(text) {
  const parsed = extractJsonObject(text)

  if (typeof parsed === 'string') {
    return {
      text: parsed,
      actions: [],
    }
  }

  return {
    text: parsed.answer || parsed.text || text || 'Não consegui gerar uma resposta agora.',
    actions: Array.isArray(parsed.actions) ? parsed.actions : [],
  }
}

export async function askSmdnAssistant({
  message,
  currentScreen,
  screenTitle,
  screenIntro,
  history,
  operationalContext,
  uiContext,
}) {
  console.log('🔥 ASSISTANT SERVICE RODANDO — MODO OPERADOR SMDN 🔥')

  const cleanMessage = sanitizeText(message, 2500)

  if (!cleanMessage) {
    throw new Error('Digite uma mensagem para a IA.')
  }

  try {
    const { model, modelName } = createGenerativeModel()

    const result = await model.generateContent(
      buildPrompt({
        message: cleanMessage,
        currentScreen,
        screenTitle,
        screenIntro,
        history,
        operationalContext,
        uiContext,
      })
    )

    const rawText = extractText(result)
    const normalized = normalizeAiResponse(rawText)

    return {
      text: normalized.text || 'Não consegui gerar uma resposta agora.',
      actions: normalized.actions,
      model: modelName,
      raw: rawText,
    }
  } catch (error) {
    console.error('[SMDN IA] Erro Vertex AI Firebase:', error)

    throw new Error(
      error?.message ||
      error?.code ||
      'Não foi possível consultar a IA pelo Vertex AI.'
    )
  }
}
