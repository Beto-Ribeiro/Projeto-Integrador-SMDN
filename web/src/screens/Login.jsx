import { useState } from 'react'
import monitoramentoIcon from '../assets/menu/ativo/map-pin.svg'
import disparoIcon from '../assets/menu/ativo/flag.svg'
import relatoriosIcon from '../assets/menu/ativo/pie-chart.svg'
import logo from '../assets/logo-claro.svg'

const Login = ({ view, setView, onLogin, onRegister }) => {
  const isRegister = view === 'cadastro'

  const [institution, setInstitution] = useState('')
  const [name, setName] = useState('')
  const [role, setRole] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = () => {
    if (isRegister) {
      onRegister({ institution, name, email, role })
    } else {
      onLogin({ email, password })
    }
  }

  return (
    <div className="relative flex h-screen w-full overflow-hidden">

      {/* Fundo: mapa */}
      <div
        className="absolute inset-0 bg-cover bg-center"
        style={{ backgroundImage: "url('/src/assets/map-bg.png')", filter: 'brightness(0.85)' }}
      />
      {/* Overlay suave */}
      <div className="absolute inset-0 bg-white/10 backdrop-blur-[1px]" />

      {/* Card dividido — ocupa a tela toda, centralizado */}
      <div className="relative z-10 flex w-full h-full items-center justify-center">
        <div className="flex flex-col md:flex-row w-full max-w-3xl shadow-modal overflow-hidden rounded-2xl" style={{ minHeight: '520px' }}>

          {/* Painel esquerdo escuro */}
          <div className="md:w-1/2 bg-bg-sidebar text-text-on-dark flex flex-col justify-center items-center p-8 space-y-8">
            <div className="flex flex-col items-center text-center">
              <img
                src={logo}
                alt="SMDN Logo"
                className="w-full max-w-[200px] mb-4"
              />
              <p className="text-sm font-medium opacity-80 leading-snug">
                Sistema de Monitoramento de Desastres Naturais
              </p>
            </div>

            <div className="space-y-5 w-full">
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 mt-0.5">
                  <img src={monitoramentoIcon} width="20" height="20" alt="map-pin" />
                </span>
                <p className="text-sm opacity-90">Monitoramento em Tempo Real</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 mt-0.5">
                  <img src={disparoIcon} width="20" height="20" alt="flag" />
                </span>
                <p className="text-sm opacity-90">Disparo de Alertas Segmentados</p>
              </div>
              <div className="flex items-start gap-3">
                <span className="flex-shrink-0 mt-0.5">
                  <img src={relatoriosIcon} width="20" height="20" alt="pie-chart" />
                </span>
                <p className="text-sm opacity-90">Relatórios e Auditoria Completa</p>
              </div>
            </div>
          </div>

          {/* Painel direito claro — formulário */}
          <div className="md:w-1/2 bg-bg-surface flex flex-col justify-center p-8 space-y-5 flex-1">

            {/* Cadastro */}
            {isRegister && (
              <>
                <select
                  value={institution}
                  onChange={(e) => setInstitution(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-text-main focus:outline-none focus:ring-2 focus:ring-bg-sidebar bg-gray-50"
                >
                  <option value="" disabled>Instituição</option>
                  <option value="Corpo de Bombeiros">Corpo de Bombeiros</option>
                  <option value="S.A.M.U">S.A.M.U</option>
                  <option value="Polícia Federal">Polícia Federal</option>
                  <option value="Defesa Civil">Defesa Civil</option>
                </select>
                <input
                  type="text"
                  placeholder="Seu nome"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-text-main placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-bg-sidebar bg-gray-50"
                />
              </>
            )}

            {/* Email */}
            <input
              type="email"
              placeholder="Digite seu email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-text-main placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-bg-sidebar bg-gray-50"
            />

            {/* Função — só no cadastro */}
            {isRegister && (
              <input
                type="text"
                placeholder="Sua função"
                value={role}
                onChange={(e) => setRole(e.target.value)}
                className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-text-main placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-bg-sidebar bg-gray-50"
              />
            )}

            {/* Senha */}
            <input
              type="password"
              placeholder="Digite sua senha"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-4 py-3 border border-gray-200 rounded-xl text-sm text-text-main placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-bg-sidebar bg-gray-50"
            />

            {/* Link troca de view */}
            <p className="text-sm text-gray-500 text-center">
              {isRegister ? 'Já possui conta? ' : 'Não possui conta? '}
              <span
                onClick={() => setView(isRegister ? 'login' : 'cadastro')}
                className="text-bg-sidebar font-semibold cursor-pointer hover:underline"
              >
                {isRegister ? 'Fazer login' : 'Cadastre-se'}
              </span>
            </p>

            {/* Botão principal */}
            <button
              onClick={handleSubmit}
              className="w-full py-3 bg-bg-sidebar text-text-on-dark rounded-full font-semibold text-sm hover:opacity-90 transition-all"
            >
              {isRegister ? 'Solicitar Acesso' : 'Acessar'}
            </button>
          </div>

        </div>
      </div>
    </div>
  )
}

export default Login
