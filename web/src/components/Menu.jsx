import { NavLink } from "react-router-dom";
import logoWeb from "../assets/menu/logoweb.svg";

const iconPath = "/icons/menu";

const links = [
  { label: "Dashboard", path: "/dashboard", icon: "../assets/menu/inativo/map-pin.svg" },
  { label: "Reportar", path: "/reportar", icon: "../assets/menu/inativo/flag.svg" },
  { label: "Ocorrências", path: "/ocorrencias", icon: "../assets/menu/inativo/alert-triangle.svg" },
  { label: "Relatórios", path: "/relatorios", icon: "../assets/menu/inativo/pie-chart.svg" },
  { label: "Auditoria", path: "/auditoria", icon: "../assets/menu/inativo/lock.svg" },
  { label: "Perfil", path: "/perfil", icon: "../assets/menu/inativo/user.svg" },
];

export default function Menu() {
  return (
    <aside className="menu-sidebar" aria-label="Menu principal">
      <div className="brand" aria-label="SMDN">
        <img className="brand-logo" src={logoWeb} alt="Logo SMDN" />
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