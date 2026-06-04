import { useState } from 'react'
import Login from './screens/Login.jsx'
import Dashboard from './screens/Dashboard.jsx'
import Reportar from './screens/Reportar.jsx'
import Ocorrencias from './screens/Ocorrencias.jsx'
import Relatorios from './screens/Relatorios.jsx'
import Auditoria from './screens/Auditoria.jsx'
import Perfil from './screens/Perfil.jsx'
import Sidebar from './components/Sidebar.jsx'
import { useAuth } from './hooks/useAuth.js'

const SCREENS = {
  dashboard: Dashboard,
  reportar: Reportar,
  ocorrencias: Ocorrencias,
  relatorios: Relatorios,
  auditoria: Auditoria,
  perfil: Perfil,
}

export default function App() {
  const { isAuthenticated, setIsAuthenticated, setUser } = useAuth()
  const [currentScreen, setCurrentScreen] = useState('dashboard')
  const [loginView, setLoginView] = useState('login')

  const handleLogin = () => {
    // TODO: Supabase auth
    setUser({ name: 'Carlos Mendes', role: 'Defesa Civil', email: 'carlos.mendes@defesacivil.sp.gov.br', avatar: null })
    setIsAuthenticated(true)
  }

  const handleLogout = () => {
    setIsAuthenticated(false)
    setUser(null)
    setCurrentScreen('dashboard')
    setLoginView('login')
  }

  if (!isAuthenticated) {
    return <Login view={loginView} setView={setLoginView} onLogin={handleLogin} />
  }

  const ActiveScreen = SCREENS[currentScreen] || Dashboard

  return (
    <div className="flex h-screen bg-bg-main overflow-hidden">
      <Sidebar currentScreen={currentScreen} setCurrentScreen={setCurrentScreen} onLogout={handleLogout} />
      <main className="flex-1 overflow-y-auto">
        <ActiveScreen />
      </main>
    </div>
  )
}