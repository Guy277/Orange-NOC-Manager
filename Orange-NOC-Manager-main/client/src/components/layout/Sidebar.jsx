import { NavLink } from "react-router-dom";

const navigationItems = [
  { to: "/dashboard", label: "Tableau de bord" },
  { to: "/incidents", label: "Incidents" },
  { to: "/incidents/new", label: "Nouvel incident" },
  { to: "/technicians", label: "Techniciens" },
  { to: "/sites", label: "Sites reseau" },
  { to: "/history", label: "Historique" },
  { to: "/exports", label: "Export XML" }
];

export function Sidebar({ mobileOpen, onNavigate }) {
  return (
    <aside className={`sidebar ${mobileOpen ? "sidebar-open" : ""}`}>
      <div className="sidebar-brand">
        <p>Orange NOC</p>
        <h1>Manager</h1>
      </div>
      <nav className="sidebar-nav" aria-label="Navigation principale">
        {navigationItems.map((item) => (
          <NavLink
            key={item.to}
            to={item.to}
            className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
            onClick={onNavigate}
          >
            {item.label}
          </NavLink>
        ))}
      </nav>
    </aside>
  );
}
