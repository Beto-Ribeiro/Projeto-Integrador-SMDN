import { useAuth } from '../hooks/useAuth.js'
import dashboardIcon from '../assets/menu/inativo/map-pin.svg';
import reportIcon from '../assets/menu/inativo/flag.svg';
import ocorrenciasIcon from '../assets/menu/inativo/alert-triangle.svg';
import relatoriosIcon from '../assets/menu/inativo/pie-chart.svg';
import auditoriaIcon from '../assets/menu/inativo/lock.svg';
import perfilIcon from '../assets/menu/inativo/user.svg';
import logoutIcon from '../assets/menu/inativo/log-out.svg';

const NAV_ITEMS = [
  { id: 'dashboard',
    label: 'Dashboard',
    icon: <img src={dashboardIcon} width="20" height="20" alt="map-pin" />,
  },
  {
    id: 'reportar',
    label: 'Reportar',
    icon: <img src={reportIcon} width="20" height="20" alt="flag" />,
  },
  {
    id: 'ocorrencias',
    label: 'Ocorrências',
    icon: <img src={ocorrenciasIcon} width="20" height="20" alt="alert-triangle" />,
  },
  {
    id: 'relatorios',
    label: 'Relatórios',
    icon: <img src={relatoriosIcon} width="20" height="20" alt="pie-chart" />,
  },
  {
    id: 'auditoria',
    label: 'Auditoria',
    icon: <img src={auditoriaIcon} width="20" height="20" alt="lock" />,
  },
  {
    id: 'perfil',
    label: 'Perfil',
    icon: <img src={perfilIcon} width="20" height="20" alt="user" />,
  },
]

export default function Sidebar({ currentScreen, setCurrentScreen, onLogout }) {
  const { user } = useAuth()

  return (
    <aside
      className="sidebar-scroll flex flex-col w-[220px] min-w-[220px] h-screen bg-bg-sidebar shadow-sidebar overflow-y-auto"
      style={{ zIndex: 10 }}
    >
      {/* Brand */}
      <div className="px-5 pt-6 pb-6 border-b border-white/5">
        <img src="/src/assets/logo-claro.svg" alt="SMDN Logo" className="w-full max-w-[160px]"/>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5">
        {NAV_ITEMS.map((item) => {
          const active = currentScreen === item.id
          return (
            <button
              key={item.id}
              onClick={() => setCurrentScreen(item.id)}
              className={`
                w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-left transition-all duration-150
                ${active
                  ? 'bg-text-main text-white shadow-sm'
                  : 'text-text-on-dark hover:bg-white/5 hover:text-white'
                }
              `}
            >
              <span className={active ? 'text-white' : 'text-text-on-dark opacity-70'}>{item.icon}</span>
              <span className="truncate">{item.label}</span>
            </button>
          )
        })}
      </nav>

      {/* User + Logout */}
      <div className="px-3 py-4 border-t border-white/5 space-y-2">
        {user && (
          <div className="flex items-center gap-3 px-3 py-2">
            <div className="w-8 h-8 rounded-full bg-text-main/30 flex items-center justify-center flex-shrink-0">
              <span className="text-text-on-dark text-xs font-bold">
                {user.name?.split(' ').map((n) => n[0]).slice(0, 2).join('')}
              </span>
            </div>
            <div className="min-w-0">
              <p className="text-white text-xs font-semibold truncate">{user.name}</p>
              <p className="text-text-on-dark text-[10px] opacity-60 truncate">{user.role}</p>
            </div>
          </div>
        )}
        <button
          onClick={onLogout}
          className="w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-text-on-dark hover:bg-white/5 hover:text-white transition-all"
        >
          <img src={logoutIcon} width="20" height="20" alt="log-out" />
          <span>Sair</span>
        </button>
      </div>
    </aside>
  )
}