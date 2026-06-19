import { useEffect, useRef, useState } from 'react'
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
import logoClaro from '../assets/logo-claro.svg'
import logoEscuro from '../assets/logo.svg'
import SettingsPanel from './SettingsPanel.jsx'
import AssistantWidget from './AssistantWidget.jsx'
import { useSmdnSettings } from '../hooks/useSmdnSettings.js'
import { supabase } from '../backend/supabase/client.js'

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
  { id: 'admin', label: 'Painel do Admin', icon: <img src={auditoriaIcon} width="20" height="20" alt="admin" />, iconWhite: <img src={auditoriaIconWHITE} width="20" height="20" alt="admin" /> },
  { id: 'users', label: 'Lista de Usuário', icon: <img src={perfilIcon} width="20" height="20" alt="usuários" />, iconWhite: <img src={perfilIconWHITE} width="20" height="20" alt="usuários" /> },
]

const DASHBOARD_ALERTS_SEEN_KEY = 'smdn_dashboard_alerts_seen_count'

function readSeenDashboardAlerts() {
  return Number(localStorage.getItem(DASHBOARD_ALERTS_SEEN_KEY) || '0')
}

function writeSeenDashboardAlerts(value) {
  localStorage.setItem(DASHBOARD_ALERTS_SEEN_KEY, String(value || 0))
}

function getInitials(name) {
  return String(name || '')
    .split(' ')
    .filter(Boolean)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase()
}

function UserAvatar({ user, size = 'sm' }) {
  const avatarUrl = user?.avatar || user?.perfil?.prf_avatar_url
  const sizeClass = size === 'lg' ? 'w-16 h-16 text-xl' : 'w-8 h-8 text-xs'

  if (avatarUrl) {
    return (
      <img
        src={avatarUrl}
        alt={user?.name || 'Foto do usuário'}
        className={`${sizeClass} rounded-full object-cover border border-white/10 bg-text-main/30 flex-shrink-0`}
      />
    )
  }

  return (
    <div className={`${sizeClass} rounded-full bg-text-main/30 flex items-center justify-center flex-shrink-0`}>
      <span className="text-text-on-dark font-bold">
        {getInitials(user?.name)}
      </span>
    </div>
  )
}

function NavButton({ item, currentScreen, setCurrentScreen, badge }) {
  const active = currentScreen === item.id

  return (
    <button
      key={item.id}
      type="button"
      onClick={() => setCurrentScreen(item.id)}
      aria-current={active ? 'page' : undefined}
      className={`
        group w-full flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium text-left transition-all duration-200 ease-out
        focus-visible:outline focus-visible:outline-2 focus-visible:outline-text-main
        ${active
          ? 'bg-text-main text-white shadow-sm'
          : 'text-text-on-dark hover:bg-text-main/10 hover:text-text-main hover:translate-x-1 hover:shadow-sm'
        }
      `}
    >
      <span className="transition-transform duration-200 ease-out group-hover:scale-105">{active ? item.iconWhite : item.icon}</span>
      <span className="truncate">{item.label}</span>
      {badge && (
        <span className="notification-badge ml-auto inline-flex min-w-5 items-center justify-center rounded-full px-1.5 py-0.5 text-[10px] font-black leading-none">
          {badge}
        </span>
      )}
    </button>
  )
}

export default function Sidebar({ currentScreen, setCurrentScreen, onLogout }) {
  const { user, isAdmin, savedAccounts, switchAccount, startAddAccount } = useAuth()
  const { effectiveTheme } = useSmdnSettings()
  const { devBypassAuth, devBypassAdmin } = getLocalDevBypass()
  const showAdmin = isAdmin || devBypassAdmin

  const displayUser =
    user ||
    (devBypassAuth
      ? {
          name: 'Dev Local',
          roleLabel: devBypassAdmin ? 'Administrador local' : 'Bypass local',
        }
      : null)

  const permissions = displayUser?.permissions || {}
  const visibleNavItems = NAV_ITEMS.filter((item) => {
    if (item.id === 'perfil') return true
    return Boolean(permissions[item.id]) || devBypassAuth
  })

  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const [showProfilePopup, setShowProfilePopup] = useState(false)
  const [accountSwitchError, setAccountSwitchError] = useState('')
  const [notifications, setNotifications] = useState({ dashboard: '', admin: 0 })

  const popupRef = useRef(null)
  const buttonRef = useRef(null)

  useEffect(() => {
    function handleClickOutside(event) {
      if (
        showProfilePopup &&
        popupRef.current &&
        !popupRef.current.contains(event.target) &&
        buttonRef.current &&
        !buttonRef.current.contains(event.target)
      ) {
        setShowProfilePopup(false)
      }
    }

    document.addEventListener('mousedown', handleClickOutside)

    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [showProfilePopup])

  useEffect(() => {
    let mounted = true

    async function loadNotifications() {
      try {
        const [{ count: alertCount }, { count: accessCount }, { count: profileCount }] = await Promise.all([
          supabase
            .from('Alerta_Web')
            .select('alw_id', { count: 'exact', head: true })
            .eq('alw_status', 'disparado'),
          showAdmin
            ? supabase
                .from('Solicitacao_Acesso_Web')
                .select('saw_id', { count: 'exact', head: true })
                .eq('saw_status', 'pendente')
            : Promise.resolve({ count: 0 }),
          showAdmin
            ? supabase
                .from('Solicitacao_Alteracao_Perfil')
                .select('sap_id', { count: 'exact', head: true })
                .eq('sap_status', 'pendente')
            : Promise.resolve({ count: 0 }),
        ])

        if (!mounted) return

        const totalAlerts = alertCount || 0
        if (currentScreen === 'dashboard') {
          writeSeenDashboardAlerts(totalAlerts)
        }

        const seenAlerts = currentScreen === 'dashboard' ? totalAlerts : readSeenDashboardAlerts()
        setNotifications({
          dashboard: totalAlerts > seenAlerts ? '!' : '',
          admin: (accessCount || 0) + (profileCount || 0),
        })
      } catch (error) {
        console.warn('Não foi possível carregar notificações da sidebar:', error.message)
      }
    }

    loadNotifications()

    const channel = supabase
      .channel('sidebar-notifications')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'Alerta_Web' }, loadNotifications)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'Solicitacao_Acesso_Web' }, loadNotifications)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'Solicitacao_Alteracao_Perfil' }, loadNotifications)
      .subscribe()

    return () => {
      mounted = false
      supabase.removeChannel(channel)
    }
  }, [currentScreen, showAdmin])

  async function handleSwitchAccount(accountId) {
    setAccountSwitchError('')

    try {
      await switchAccount(accountId)
      setShowProfilePopup(false)
    } catch (error) {
      setAccountSwitchError(error.message || 'Não foi possível alternar a conta.')
    }
  }

  async function handleAddAccount() {
    setAccountSwitchError('')
    setShowProfilePopup(false)
    await startAddAccount()
  }

  return (
    <>
      <aside
        className="sidebar-scroll relative flex flex-col w-[220px] min-w-[220px] h-screen bg-bg-sidebar shadow-sidebar overflow-y-auto z-[10000]"
      >
        <div className="px-5 pt-6 pb-6 border-b border-white/5">
          <img
            src={effectiveTheme === 'light' ? logoEscuro : logoClaro}
            alt="SMDN Logo"
            className="w-full max-w-[160px]"
          />
        </div>

        <nav className="flex-1 px-3 py-4 space-y-0.5">
          {visibleNavItems.map((item) => (
            <NavButton
              key={item.id}
              item={item}
              currentScreen={currentScreen}
              setCurrentScreen={setCurrentScreen}
              badge={notifications[item.id]}
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
                    badge={item.id === 'admin' && notifications.admin ? notifications.admin : ''}
                  />
                ))}
              </div>
            </div>
          )}
        </nav>

        <div className="px-3 py-4 border-t border-white/5 space-y-2">
          <AssistantWidget currentScreen={currentScreen} setCurrentScreen={setCurrentScreen} />

          {displayUser && (
            <div className="relative">
              <button
                ref={buttonRef}
                type="button"
                onClick={() => { setAccountSwitchError(''); setShowProfilePopup((value) => !value) }}
                className="w-full flex items-center gap-3 px-3 py-2 rounded-lg hover:bg-white/5 transition-all"
              >
                <UserAvatar user={displayUser} />

                <div className="min-w-0 text-left">
                  <p className="text-text-on-dark text-xs font-semibold truncate">
                    {displayUser.name}
                  </p>
                  <p className="text-text-on-dark text-[10px] opacity-60 truncate">
                    {displayUser.roleLabel || displayUser.role}
                  </p>
                </div>
              </button>

              {showProfilePopup && (
                <div
                  ref={popupRef}
                  className="fixed bottom-14 left-[210px] w-72 bg-bg-surface rounded-2xl shadow-2xl p-5 pt-6 z-[99999] border border-border-soft"
                >
                  <div className="absolute left-4 top-4">
                    <SettingsPanel variant="icon" panelClassName="bottom-20" />
                  </div>

                  <button
                    type="button"
                    onClick={() => {
                      setShowProfilePopup(false)
                      setShowLogoutConfirm(true)
                    }}
                    className="absolute right-4 top-4 inline-flex h-9 w-9 items-center justify-center rounded-xl border border-border-soft bg-bg-surface text-slate-500 hover:bg-red-50 hover:text-red-600 transition-all"
                    title="Sair"
                    aria-label="Sair da conta"
                  >
                    <img src={logoutIcon} width="18" height="18" alt="" />
                  </button>

                  <div className="flex flex-col items-center">
                    <UserAvatar user={displayUser} size="lg" />

                    <div className="mt-3 w-full px-10 text-center">
                      <h3 className="font-bold text-slate-800 truncate">
                        {displayUser.name}
                      </h3>

                      <p className="text-sm text-slate-500 truncate">
                        {displayUser.roleLabel || displayUser.role}
                      </p>
                    </div>

                    <div className="w-full border-t mt-3 pt-3 text-sm text-slate-600 space-y-2 text-center">
                      <p>{displayUser.institution || displayUser.instituicao?.ins_numero || 'SMDN'}</p>
                    </div>

                    <button
                      onClick={() => {
                        setCurrentScreen('perfil')
                        setShowProfilePopup(false)
                      }}
                      className="btn-primary w-full mt-4"
                    >
                      Abrir Perfil
                    </button>

                    <div className="mt-4 w-full border-t border-border-soft pt-3">
                      <div className="mb-2 flex items-center justify-between gap-2">
                        <p className="text-[10px] font-bold uppercase tracking-[0.16em] text-slate-400">Contas</p>
                        <button
                          type="button"
                          onClick={handleAddAccount}
                          className="rounded-lg border border-border-soft px-2 py-1 text-[11px] font-bold text-text-main hover:bg-text-main/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-text-main"
                        >
                          + Adicionar
                        </button>
                      </div>

                      {accountSwitchError && (
                        <p className="mb-2 rounded-lg border border-yellow-200 bg-yellow-50 px-2 py-1.5 text-left text-[11px] font-semibold text-yellow-800">
                          {accountSwitchError}
                        </p>
                      )}

                      <div className="flex flex-wrap items-center gap-2">
                        {(savedAccounts || []).map((account) => {
                          const activeAccount = account.id === displayUser?.id
                          return (
                            <button
                              key={account.id}
                              type="button"
                              disabled={activeAccount}
                              onClick={() => handleSwitchAccount(account.id)}
                              className={`group relative rounded-full border p-0.5 transition-all ${activeAccount ? 'border-text-main bg-text-main/10' : 'border-border-soft bg-bg-surface hover:border-text-main hover:bg-text-main/10'}`}
                              title={`${account.name} ${activeAccount ? '(conta atual)' : account.email}`}
                              aria-label={`Alternar para ${account.name}`}
                            >
                              <UserAvatar user={account} />
                              {activeAccount && (
                                <span className="absolute -bottom-0.5 -right-0.5 h-3 w-3 rounded-full border-2 border-bg-surface bg-status-success" aria-hidden="true" />
                              )}
                            </button>
                          )
                        })}
                      </div>

                      <p className="mt-2 text-left text-[10px] leading-snug text-slate-400">
                        48h sem acesso pede login novamente.
                      </p>
                    </div>
                  </div>
                </div>
              )}
            </div>
          )}
        </div>
      </aside>

      {showLogoutConfirm && (
        <div className="fixed inset-0 z-[100000] flex items-center justify-center">
          <div className="absolute inset-0 bg-black/40" onClick={() => setShowLogoutConfirm(false)} />

          <div className="relative bg-bg-surface rounded-2xl shadow-modal px-8 py-7 flex flex-col items-center gap-4 max-w-xs w-full mx-4 animate-slide-up border border-border-soft">
            <div className="w-12 h-12 rounded-full bg-text-main/10 text-text-main flex items-center justify-center">
              <img
                src={logoutIcon}
                width="22"
                height="22"
                alt="log-out"
                className="logout-confirm-icon-img"
              />
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
                onClick={() => {
                  setShowLogoutConfirm(false)
                  onLogout()
                }}
                className="flex-1 py-2.5 rounded-lg bg-text-main text-white text-sm font-semibold hover:bg-action-hover transition-all disabled:opacity-60"
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
