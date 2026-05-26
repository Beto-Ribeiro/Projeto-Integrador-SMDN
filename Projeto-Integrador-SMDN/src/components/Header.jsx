import bellIcon from "../assets/bell.svg";

function Header() {
  return (
    <header className="header">
      <div>
        <h1>Dashboard</h1>
        <p>
          Monitoramento em tempo real
        </p>
      </div>

      <button className="notification-btn">
        <img
          src={bellIcon}
          alt="Notificações"
          className="bell-icon"
        />
      </button>
    </header>
  );
}

export default Header;