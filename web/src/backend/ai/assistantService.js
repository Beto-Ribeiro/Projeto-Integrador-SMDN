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

const AVAILABLE_SCREENS = [
  'dashboard',
  'reportar',
  'ocorrencias',
  'relatorios',
  'auditoria',
  'perfil',
  'admin',
  'users',
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
    .slice(-10)
    .map((item) => {
      const role = item?.role === 'assistant' ? 'IA SMDN' : 'Usuário'
      const text = sanitizeText(item?.text, 1600)
      return text ? `${role}: ${text}` : ''
    })
    .filter(Boolean)
    .join('\n')
}

function safeStringify(value, maxLength = 18000) {
  try {
    return JSON.stringify(value || {}, null, 2).slice(0, maxLength)
  } catch {
    return '{}'
  }
}

function buildPrompt({ message, currentScreen, screenTitle, screenIntro, history, operationalContext }) {
  const historyText = normalizeHistory(history)

  return [
    'Você é a IA SMDN, assistente operacional do Sistema de Monitoramento de Desastres Naturais.',
    'Responda sempre em português do Brasil, com clareza, objetividade e tom profissional.',
    'Use os dados reais recebidos no CONTEXTO_OPERACIONAL antes de dizer que não sabe.',
    'Se um usuário, administrador, cidadão, instituição, ocorrência ou auditoria existir no contexto, responda com base nele.',
    'Não diga que não tem acesso se o dado estiver no contexto JSON.',
    'Não invente dados fora do contexto. Se não encontrar, diga exatamente que não encontrou no contexto recebido.',
    'Em emergência real, oriente seguir protocolos oficiais da Defesa Civil, Bombeiros, SAMU ou autoridade competente.',
    'Nunca substitua a decisão técnica da autoridade responsável.',
    '',
    'FORMATO OBRIGATÓRIO DA RESPOSTA:',
    'Responda somente com JSON válido, sem bloco markdown, neste formato:',
    '{',
    '  "answer": "texto em Markdown simples para exibir no chat",',
    '  "actions": []',
    '}',
    '',
    'Ações permitidas em actions:',
    '- {"type":"navigate","screen":"dashboard|reportar|ocorrencias|relatorios|auditoria|perfil|admin|users"}',
    '- {"type":"open_user","query":"nome, e-mail ou id do usuário"}',
    '- {"type":"filter_users","query":"texto para filtrar a lista de usuários"}',
    '- {"type":"open_dashboard_occurrence","id":"id ou relatoId da ocorrência","query":"texto de busca opcional"}',
    '- {"type":"filter_audit","query":"texto para pesquisar na auditoria","openFirst":true}',
    '',
    'REGRAS IMPORTANTES:',
    '- Perguntas como "Quem é Giovanna?" ou "Quem é Ales Lino?": procure em CONTEXTO_OPERACIONAL.users.profiles e, se encontrar, responda tipo, contato, permissões e inclua action open_user.',
    '- Perguntas como "Quem são os administradores?": use CONTEXTO_OPERACIONAL.users.admins, liste os nomes e inclua action filter_users com query "administrador".',
    '- Perguntas como "Tem instituição?": use CONTEXTO_OPERACIONAL.users.institutions e diga se há ou não há perfis de instituição.',
    '- Perguntas sobre mudanças de perfil, logs ou auditoria: use CONTEXTO_OPERACIONAL.audit.recentEvents e inclua action filter_audit.',
    '- Perguntas de prioridade no Dashboard: use CONTEXTO_OPERACIONAL.dashboard.recommendedOccurrence e explique por que ela deve ser vista primeiro; inclua action open_dashboard_occurrence.',
    '- Use Markdown simples dentro do campo answer: **negrito**, quebras de linha e listas com * item.',
    '',
    `Telas disponíveis: ${AVAILABLE_SCREENS.join(', ')}.`,
    `Tela atual: ${sanitizeText(screenTitle || currentScreen || 'SMDN', 120)}`,
    screenIntro ? `Contexto da tela atual: ${sanitizeText(screenIntro, 800)}` : '',
    historyText ? `Histórico recente:\n${historyText}` : '',
    `Pergunta do usuário:\n${sanitizeText(message, 2500)}`,
    '',
    `CONTEXTO_OPERACIONAL:\n${safeStringify(operationalContext)}`,
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

  console.log('🔥 SMDN IA — USANDO VERTEX AI BACKEND COM CONTEXTO REAL 🔥', {
    projectId: firebaseConfig.projectId,
    appId: firebaseConfig.appId,
    location,
    model: modelName,
  })

  return { model, modelName }
}

function stripMarkdownFence(text) {
  return String(text || '')
    .replace(/^```json\s*/i, '')
    .replace(/^```\s*/i, '')
    .replace(/```$/i, '')
    .trim()
}

function parseAssistantPayload(rawText) {
  const cleaned = stripMarkdownFence(rawText)

  try {
    const parsed = JSON.parse(cleaned)
    return {
      text: parsed?.answer || parsed?.text || rawText,
      actions: Array.isArray(parsed?.actions) ? parsed.actions : [],
    }
  } catch {
    const jsonMatch = cleaned.match(/\{[\s\S]*\}/)

    if (jsonMatch) {
      try {
        const parsed = JSON.parse(jsonMatch[0])
        return {
          text: parsed?.answer || parsed?.text || rawText,
          actions: Array.isArray(parsed?.actions) ? parsed.actions : [],
        }
      } catch {
        // mantém fallback abaixo
      }
    }
  }

  return {
    text: rawText || 'Não consegui gerar uma resposta agora.',
    actions: [],
  }
}

export async function askSmdnAssistant({
  message,
  currentScreen,
  screenTitle,
  screenIntro,
  history,
  operationalContext,
}) {
  console.log('🔥 ASSISTANT SERVICE NOVO RODANDO — IA COM CONTEXTO REAL 🔥')

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
      })
    )

    const rawText = extractText(result)
    const parsed = parseAssistantPayload(rawText)

    return {
      text: parsed.text || 'Não consegui gerar uma resposta agora.',
      actions: parsed.actions,
      model: modelName,
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
