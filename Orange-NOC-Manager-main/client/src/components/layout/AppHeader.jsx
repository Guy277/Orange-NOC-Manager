import { formatDateTime } from "../../utils/formatters.js";

export function AppHeader({ title, subtitle, apiStatus, onToggleMenu }) {
  return (
    <header className="topbar">
      <div className="topbar-main">
        <button type="button" className="menu-button" onClick={onToggleMenu} aria-label="Ouvrir le menu">
          ☰
        </button>
        <div>
          <p className="page-kicker">{subtitle}</p>
          <h2>{title}</h2>
        </div>
      </div>
      <div className="topbar-meta">
        <div className={`api-indicator ${apiStatus === "ok" ? "api-ok" : "api-down"}`}>
          <span className="status-dot" />
          <span>{apiStatus === "ok" ? "API operationnelle" : "API indisponible"}</span>
        </div>
        <span className="context-time">{formatDateTime(new Date().toISOString())}</span>
      </div>
    </header>
  );
}
