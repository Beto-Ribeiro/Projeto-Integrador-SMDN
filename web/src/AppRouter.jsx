import { BrowserRouter, Routes, Route } from 'react-router-dom'
import App from './App.jsx'
import ConfirmacaoApp from './screens/ConfirmacaoApp.jsx'

export default function AppRouter() {
  return (
    <BrowserRouter>
      <Routes>
        {/* Rota pública - Página de confirmação de email */}
        <Route path="/confirmacao-email" element={<ConfirmacaoApp />} />

        {/* Todas as outras rotas usam o App com autenticação */}
        <Route path="/*" element={<App />} />
      </Routes>
    </BrowserRouter>
  )
}
