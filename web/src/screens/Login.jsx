import { useState } from 'react'
import Card from '../components/Card'
import monitoramentoIcon from '../assets/menu/ativo/map-pin.svg';
import disparoIcon from '../assets/menu/ativo/flag.svg';
import relatoriosIcon from '../assets/menu/ativo/pie-chart.svg';

const Login = ({ view, setView, onLogin }) => {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')

  const handleSubmit = (e) => {
    e.preventDefault()
    onLogin()
  }

  return (
    <div className="flex h-screen">
      <div className="hidden lg:flex w-1/2 bg-bg-sidebar flex-col justify-center items-center p-12 text-text-on-dark">
        <div className="text-center space-y-10">
          <div>
            <div className="mb-6">
              <img src="/src/assets/logo-claro.svg" alt="SMDN Logo" className="w-full max-w-[280px] mx-auto"/>
            </div>
            <p className="text-2xl font-semibold">Sistema de Monitoramento de Desastres Naturais</p>
          </div>

          <div className="space-y-5 text-lg text-left">
            <div className="flex items-center gap-4">
              <span className="flex-shrink-0"><img src={monitoramentoIcon} width="30" height="30" alt="map-pin" /></span>
              <div>
                <p className="font-semibold">Monitoramento Geoespacial</p>
                <p className="text-sm opacity-80">Rastreie ocorrências em tempo real no mapa</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="flex-shrink-0"><img src={disparoIcon} width="30" height="30" alt="flag" /></span>
              <div>
                <p className="font-semibold">Disparo Segmentado</p>
                <p className="text-sm opacity-80">Envie alertas direcionados aos cidadãos</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <span className="flex-shrink-0"><img src={relatoriosIcon} width="30" height="30" alt="pie-chart" /></span>
              <div>
                <p className="font-semibold">Relatórios Analíticos</p>
                <p className="text-sm opacity-80">Visualize estatísticas e tendências</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="w-full lg:w-1/2 bg-bg-main flex flex-col justify-center items-center p-6">
        <Card className="w-full max-w-md">
          {view === 'login' ? (
            <div className="space-y-6">
              <div>
                <h2 className="text-title-large font-bold text-text-main">Login</h2>
                <p className="text-body text-gray-600 mt-2">Acesse o painel operacional</p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-label text-text-main mb-2">Email</label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="seu@email.com"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-text-main"
                    required
                  />
                </div>

                <div>
                  <label className="block text-label text-text-main mb-2">Senha</label>
                  <input
                    type="password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="•••••••••"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-text-main"
                    required
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-text-main text-bg-surface rounded-lg font-semibold hover:opacity-90 transition-all"
                >
                  Entrar
                </button>
              </form>

              <div className="text-center">
                <p className="text-body text-gray-600">
                  Não tem acesso?{' '}
                  <button
                    onClick={() => setView('signup')}
                    className="text-text-main font-semibold hover:underline"
                  >
                    Solicitar Acesso
                  </button>
                </p>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              <div>
                <h2 className="text-title-large font-bold text-text-main">Solicitar Acesso</h2>
                <p className="text-body text-gray-600 mt-2">Preencha o formulário abaixo</p>
              </div>

              <form className="space-y-4">
                <div>
                  <label className="block text-label text-text-main mb-2">Nome Completo</label>
                  <input
                    type="text"
                    placeholder="Seu Nome"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-text-main"
                  />
                </div>

                <div>
                  <label className="block text-label text-text-main mb-2">Email Institucional</label>
                  <input
                    type="email"
                    placeholder="seu@instituicao.gov.br"
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-text-main"
                  />
                </div>

                <div>
                  <label className="block text-label text-text-main mb-2">Instituição</label>
                  <select className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-text-main">
                    <option>Selecione sua instituição</option>
                    <option>Defesa Civil</option>
                    <option>SAMU</option>
                    <option>Bombeiros</option>
                    <option>Polícia</option>
                  </select>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-text-main text-bg-surface rounded-lg font-semibold hover:opacity-90 transition-all"
                >
                  Solicitar Acesso
                </button>
              </form>

              <div className="text-center">
                <p className="text-body text-gray-600">
                  Já tem acesso?{' '}
                  <button
                    onClick={() => setView('login')}
                    className="text-text-main font-semibold hover:underline"
                  >
                    Voltar ao Login
                  </button>
                </p>
              </div>
            </div>
          )}
        </Card>
      </div>
    </div>
  )
}

export default Login