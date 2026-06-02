import bellIcon from "../assets/bell.svg";

function Header({ ativos, notificacoes }) {
  return (
    <header className="header">
      <div className="header-user">
        <div className="header-avatar">C</div>
        <div className="header-user-info">
          <span className="header-user-name">Carlos H. da Silva</span>
          <span className="header-user-role">Defesa Civil</span>
        </div>
        <button className="header-menu-btn">≡</button>
        <button className="notification-btn-small">
          <img src={bellIcon} alt="Notificações" className="bell-icon-small" />
        </button>
      </div>

      <div className="header-stats">
        <div className="header-stat">
          <span className="header-stat-value red">{ativos}</span>
          <span className="header-stat-label">Ativos</span>
        </div>
        <div className="header-stat">
          <span className="header-stat-value">{notificacoes}</span>
          <span className="header-stat-label">Notificações enviadas</span>
        </div>
      </div>

      <button className="notification-btn-big">
        <img src={bellIcon} alt="Notificações" className="bell-icon-big" />
      </button>
    </header>
  );
}

export default Header;