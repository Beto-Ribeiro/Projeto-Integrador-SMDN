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

function buildPrompt({ message, currentScreen, screenTitle, screenIntro, history }) {
  const historyText = normalizeHistory(history)

  return [
    'Você é a IA SMDN, assistente operacional do Sistema de Monitoramento de Desastres Naturais.',
    'Responda sempre em português do Brasil, com clareza e objetividade.',
    'Ajude agentes públicos a entender telas, priorizar ocorrências, revisar alertas, interpretar relatórios e consultar auditoria.',
    'Não invente dados do sistema. Use apenas o contexto recebido na pergunta.',
    'Em emergência real, oriente seguir protocolos oficiais da Defesa Civil, Bombeiros, SAMU ou autoridade competente.',
    'Nunca substitua a decisão técnica da autoridade responsável.',
    '',
    `Tela atual: ${sanitizeText(screenTitle || currentScreen || 'SMDN', 120)}`,
    screenIntro ? `Contexto da tela: ${sanitizeText(screenIntro, 500)}` : '',
    historyText ? `Histórico recente:\n${historyText}` : '',
    `Pergunta do usuário:\n${sanitizeText(message, 2000)}`,
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

  console.log('🔥 SMDN IA — USANDO VERTEX AI BACKEND 🔥', {
    projectId: firebaseConfig.projectId,
    appId: firebaseConfig.appId,
    location,
    model: modelName,
  })

  return { model, modelName }
}

export async function askSmdnAssistant({
  message,
  currentScreen,
  screenTitle,
  screenIntro,
  history,
}) {
  console.log('🔥 ASSISTANT SERVICE NOVO RODANDO — VERTEX FORÇADO 🔥')

  const cleanMessage = sanitizeText(message, 2000)

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
      })
    )

    const text = extractText(result)

    return {
      text: text || 'Não consegui gerar uma resposta agora.',
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
