import logoClaro from '../assets/logo-claro.svg'

export default function ConfirmacaoApp() {

  return (
    <div className="min-h-screen bg-bg-sidebar flex flex-col">
      {/* Header com barra azul */}
      <div className="bg-slate-900 p-2">
        <img src={logoClaro} className="w-full max-w-[150px] ml-5"></img>
      </div>

      {/* Conteúdo principal */}
      <div className="flex-1 flex flex-col items-center px-4 sm:px-6 lg:px-8 py-12 sm:py-16 bg-slate-900">
        <div className="w-full max-w-2xl text-center">
          {/* Título */}
          <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white mb-8 sm:mb-12 font-sans">
            Email Confirmado com Sucesso
          </h1>

          {/* Espaçador visual */}
          <div className="space-y-6 sm:space-y-8 text-left sm:text-center">
            {/* Baixar app */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center gap-2">
              <p className="text-white/50 text-base sm:text-lg">
                Baixe o app através do link:
              </p>
              <a
                href="/app-release.apk"
                target="_blank"
                rel="noopener noreferrer"
                className="text-action-hover hover:text-action-inactive font-semibold underline transition-colors" download
              >
                SMDN Mobile
              </a>
            </div>

            {/* Acessar app */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center gap-2">
              <p className="text-white/50 text-base sm:text-lg">
                Acesse o app através do link:
              </p>
              <a
                href="smdnmobile://login-callback"
                target="_blank"
                rel="noopener noreferrer"
                className="text-action-hover hover:text-action-inactive font-semibold underline transition-colors"
              >
                App Mobile
              </a>
            </div>

            {/* Divisor */}
            <div className="h-px bg-action-inactive opacity-30 my-4 sm:my-6"></div>

            {/* Seção de links */}
            <div className="space-y-4">
              <p className="text-white/50 text-base sm:text-lg font-semibold">
                Conheça melhor nosso projeto:
              </p>
              <div className="flex flex-col sm:flex-row sm:items-center sm:justify-center gap-4 sm:gap-8">
                <a
                  href="https://github.com/Beto-Ribeiro/Projeto-Integrador-SMDN.git"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-action-hover hover:text-action-inactive font-semibold underline transition-colors text-base sm:text-lg"
                >
                  Nosso GitHub
                </a>
                <a
                  href="https://visualizersmdn.vercel.app/"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-action-hover hover:text-action-inactive font-semibold underline transition-colors text-base sm:text-lg"
                >
                  Landing Page
                </a>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  )
}
