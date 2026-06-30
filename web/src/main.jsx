import React from 'react'
import ReactDOM from 'react-dom/client'
import AppRouter from './AppRouter.jsx'
import './index.css'
import { AuthProvider } from './context/AuthContext.jsx'
import { applySmdnSettings, readSmdnSettings } from './hooks/useSmdnSettings.js'

applySmdnSettings(readSmdnSettings())

ReactDOM.createRoot(document.getElementById('root')).render(
  <React.StrictMode>
    <AuthProvider>
      <AppRouter />
    </AuthProvider>
  </React.StrictMode>
)