import { useState } from 'react'
import { useAuth } from '../hooks/useAuth.js'
import dashboardIcon from '../assets/menu/ativo/map-pin.svg'
import dashboardIconWHITE from '../assets/menu/hover/map-pin.svg'
import reportIcon from '../assets/menu/ativo/flag.svg'
import reportIconWHITE from '../assets/menu/hover/flag.svg'
import ocorrenciasIcon from '../assets/menu/ativo/alert-triangle.svg'
import ocorrenciasIconWHITE from '../assets/menu/hover/alert-triangle.svg'
import relatoriosIcon from '../assets/menu/ativo/pie-chart.svg'
import relatoriosIconWHITE from '../assets/menu/hover/pie-chart.svg'
import auditoriaIcon from '../assets/menu/ativo/lock.svg'
import auditoriaIconWHITE from '../assets/menu/hover/lock.svg'
import perfilIcon from '../assets/menu/ativo/user.svg'
import perfilIconWHITE from '../assets/menu/hover/user.svg'
import logoutIcon from '../assets/menu/ativo/log-out.svg'
import logoutIconWHITE from '../assets/menu/hover/log-out.svg'


function getLocalDevBypass() {
  const isLocalhost =
    window.location.hostname === 'localhost' ||
    window.location.hostname === '127.0.0.1'

  const devBypassAuth =
    import.meta.env.DEV &&
    import.meta.env.VITE_DEV_BYPASS_AUTH === 'true' &&
    isLocalhost

  const devBypassAdmin =
    devBypassAuth &&
    import.meta.env.VITE_DEV_BYPASS_ADMIN === 'true'

  return { devBypassAuth, devBypassAdmin }
}

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', icon: <img src={dashboardIcon} width="20" height="20" alt="map-pin" />, iconWhite: <img src={dashboardIconWHITE} width="20" height="20" alt="map-pin" /> },
  { id: 'reportar', label: 'Reportar', icon: <img src={reportIcon} width="20" height="20" alt="flag" />, iconWhite: <img src={reportIconWHITE} width="20" height="20" alt="flag" /> },
  { id: 'ocorrencias', label: 'Ocorrências', icon: <img src={ocorrenciasIcon} width="20" height="20" alt="alert-triangle" />, iconWhite: <img src={ocorrenciasIconWHITE} width="20" height="20" alt="alert-triangle" /> },
  { id: 'relatorios', label: 'Relatórios', icon: <img src={relatoriosIcon} width="20" height="20" alt="pie-chart" />, iconWhite: <img src={relatoriosIconWHITE} width="20" height="20" alt="pie-chart" /> },
  { id: 'auditoria', label: 'Auditoria', icon: <img src={auditoriaIcon} width="20" height="20" alt="lock" />, iconWhite: <img src={auditoriaIconWHITE} width="20" height="20" alt="lock" /> },
  { id: 'perfil', label: 'Perfil', icon: <img src={perfilIcon} width="20" height="20" alt="user" />, iconWhite: <img src={perfilIconWHITE} width="20" height="20" alt="user" /> },
]

const ADMIN_ITEMS = [
  { id: 'admin', label: 'Painel do Administrador', icon: <img src={auditoriaIcon} width="20" height="20" alt="admin" />, iconWhite: <img src={auditoriaIconWHITE} width="20" height="20" alt="admin" /> },
]

function NavButton({ item, currentScreen, setCurrentScreen, hoveredItem, setHoveredItem }) {
  const active = currentScreen === item.id

  return (
    <button
      key={item.id}
      onClick={() => setCurrentScreen(item.id)}
      onMouseEnter={() => setHoveredItem(item.id)}
      onMouseLeave={() => setHoveredItem(null)}
      className={`
        w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-left transition-all duration-150
        ${active ? 'bg-text-main text-white shadow-sm' : 'text-text-on-dark hover:bg-white/5 hover:text-white'}
      `}
    >
      <span>{active || hoveredItem === item.id ? item.iconWhite : item.icon}</span>
      <span className="truncate">{item.label}</span>
    </button>
  )
}

export default function Sidebar({ currentScreen, setCurrentScreen, onLogout }) {
  const { user, isAdmin } = useAuth()
  const { devBypassAuth, devBypassAdmin } = getLocalDevBypass()
  const showAdmin = isAdmin || devBypassAdmin
  const displayUser = user || (devBypassAuth ? { name: 'Dev Local', roleLabel: devBypassAdmin ? 'Administrador local' : 'Bypass local' } : null)
  const [hoveredItem, setHoveredItem] = useState(null)
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)

  return (
    <>
      <aside
        className="sidebar-scroll flex flex-col w-[220px] min-w-[220px] h-screen bg-bg-sidebar shadow-sidebar overflow-y-auto"
        style={{ zIndex: 10 }}
      >
        <div className="px-5 pt-6 pb-6 border-b border-white/5">
          <img src="/src/assets/logo-claro.svg" alt="SMDN Logo" className="w-full max-w-[160px]" />
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {NAV_ITEMS.map((item) => (
            <NavButton
              key={item.id}
              item={item}
              currentScreen={currentScreen}
              setCurrentScreen={setCurrentScreen}
              hoveredItem={hoveredItem}
              setHoveredItem={setHoveredItem}
            />
          ))}

          {showAdmin && (
            <div className="pt-4 mt-4 border-t border-white/10">
              <p className="px-3 pb-2 text-[10px] uppercase tracking-[0.18em] text-text-on-dark/50 font-bold">
                Administração
              </p>
              <div className="space-y-0.5">
                {ADMIN_ITEMS.map((item) => (
                  <NavButton
                    key={item.id}
                    item={item}
                    currentScreen={currentScreen}
                    setCurrentScreen={setCurrentScreen}
                    hoveredItem={hoveredItem}
                    setHoveredItem={setHoveredItem}
                  />
                ))}
              </div>
            </div>
          )}
        </nav>

        <div className="px-3 py-4 border-t border-white/5 space-y-2">
          {displayUser && (
            <div className="flex items-center gap-3 px-3 py-2">
              <div className="w-8 h-8 rounded-full bg-text-main/30 flex items-center justify-center flex-shrink-0">
                <span className="text-text-on-dark text-xs font-bold">
                  {displayUser.name?.split(' ').map((n) => n[0]).slice(0, 2).join('')}
                </span>
              </div>
              <div className="min-w-0">
                <p className="text-white text-xs font-semibold truncate">{displayUser.name}</p>
                <p className="text-text-on-dark text-[10px] opacity-60 truncate">{displayUser.roleLabel || displayUser.role}</p>
              </div>
            </div>
          )}
          <button
            onClick={() => setShowLogoutConfirm(true)}
            onMouseEnter={() => setHoveredItem('logout')}
            onMouseLeave={() => setHoveredItem(null)}
            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-text-on-dark hover:bg-white/5 hover:text-white transition-all"
          >
            <img src={hoveredItem === 'logout' ? logoutIconWHITE : logoutIcon} width="20" height="20" alt="log-out" />
            <span>Sair</span>
          </button>
        </div>
      </aside>

      {showLogoutConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowLogoutConfirm(false)} />
          <div className="relative bg-white rounded-2xl shadow-modal px-8 py-7 flex flex-col items-center gap-4 max-w-xs w-full mx-4 animate-slide-up">
            <div className="w-12 h-12 rounded-full bg-slate-100 flex items-center justify-center">
              <img src={logoutIcon} width="22" height="22" alt="log-out" style={{ filter: 'brightness(0) saturate(100%) invert(27%) sepia(10%) saturate(500%) hue-rotate(180deg)' }} />
            </div>
            <div className="text-center">
              <h3 className="text-lg font-bold text-slate-800">Deseja fazer logout?</h3>
              <p className="text-sm text-slate-500 mt-1">Você será redirecionado para a tela de login.</p>
            </div>
            <div className="flex gap-3 w-full mt-1">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-2.5 rounded-lg border border-border-soft text-sm font-semibold text-slate-600 hover:bg-slate-50 transition-all"
              >
                Não
              </button>
              <button
                onClick={() => { setShowLogoutConfirm(false); onLogout() }}
                className="flex-1 py-2.5 rounded-lg bg-bg-sidebar text-white text-sm font-semibold hover:opacity-90 transition-all"
              >
                Sim, sair
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  )
}
