import { NavLink } from "react-router-dom";
import logoWeb from "../assets/logoweb.svg";

const iconPath = "/icons/menu";

const links = [
  { label: "Dashboard", path: "/dashboard", icon: "map-pin.svg" },
  { label: "Reportar", path: "/reportar", icon: "flag.svg" },
  { label: "Ocorrências", path: "/ocorrencias", icon: "alert-triangle.svg" },
  { label: "Relatórios", path: "/relatorios", icon: "pie-chart.svg" },
  { label: "Auditoria", path: "/auditoria", icon: "lock.svg" },
  { label: "Perfil", path: "/perfil", icon: "user.svg" },
];

export default function Menu() {
  return (
    <aside className="menu-sidebar" aria-label="Menu principal">
      <div className="brand" aria-label="SMDN">
        <img className="brand-logo" src={logoWeb} alt="Logo SMDN" />
        <span className="brand-mark" aria-hidden="true">
          <span className="brand-mountain" />
          <span className="brand-wave brand-wave-one" />
          <span className="brand-wave brand-wave-two" />
        </span>
        <span className="brand-text brand-last">N</span>
      </div>

      <nav className="menu-nav">
        {links.map((link) => (
          <NavLink
            key={link.path}
            to={link.path}
            className={({ isActive }) => `menu-link ${isActive ? "is-active" : ""}`}
          >
            {({ isActive }) => (
              <>
                <img
                  className="menu-icon"
                  src={`${iconPath}/${isActive ? "ativo" : "inativo"}/${link.icon}`}
                  alt=""
                  aria-hidden="true"
                />
                <span>{link.label}</span>
              </>
            )}
          </NavLink>
        ))}
      </nav>

      <NavLink to="/logout" className="menu-link logout-link">
        {({ isActive }) => (
          <>
            <img
              className="menu-icon"
              src={`${iconPath}/${isActive ? "ativo" : "inativo"}/log-out.svg`}
              alt=""
              aria-hidden="true"
            />
            <span>Logout</span>
          </>
        )}
      </NavLink>
    </aside>
  );
}