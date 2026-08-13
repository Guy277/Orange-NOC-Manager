import { Outlet, useLocation } from "react-router-dom";
import { useEffect, useMemo, useState } from "react";
import { Sidebar } from "./Sidebar.jsx";
import { AppHeader } from "./AppHeader.jsx";
import { healthApi } from "../../api/index.js";

const titles = {
  "/dashboard": { title: "Tableau de bord", subtitle: "Vision temps reel du NOC" },
  "/incidents": { title: "Incidents", subtitle: "Suivi et pilotage des incidents reseau" },
  "/incidents/new": { title: "Nouvel incident", subtitle: "Declaration d'un incident reseau" },
  "/technicians": { title: "Techniciens", subtitle: "Gestion des equipes terrain" },
  "/sites": { title: "Sites reseau", subtitle: "Referentiel des sites supervises" },
  "/history": { title: "Historique", subtitle: "Journalisation technique PostgreSQL" },
  "/exports": { title: "Export XML", subtitle: "Extraction des incidents au format XML" }
};

export function AppLayout() {
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [apiStatus, setApiStatus] = useState("ok");

  const pageMeta = useMemo(() => {
    if (location.pathname.startsWith("/incidents/") && location.pathname !== "/incidents/new") {
      return { title: "Detail incident", subtitle: "Analyse, interventions et historique" };
    }

    return titles[location.pathname] || { title: "Orange NOC Manager", subtitle: "Plateforme de gestion des incidents" };
  }, [location.pathname]);

  useEffect(() => {
    setMobileOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    let active = true;

    async function checkHealth() {
      try {
        await healthApi.get();
        if (active) {
          setApiStatus("ok");
        }
      } catch {
        if (active) {
          setApiStatus("down");
        }
      }
    }

    checkHealth();
    const interval = window.setInterval(checkHealth, 20000);

    return () => {
      active = false;
      window.clearInterval(interval);
    };
  }, []);

  return (
    <div className="shell">
      <Sidebar mobileOpen={mobileOpen} onNavigate={() => setMobileOpen(false)} />
      {mobileOpen ? <button type="button" className="sidebar-overlay" onClick={() => setMobileOpen(false)} aria-label="Fermer le menu" /> : null}
      <div className="shell-main">
        <AppHeader
          title={pageMeta.title}
          subtitle={pageMeta.subtitle}
          apiStatus={apiStatus}
          onToggleMenu={() => setMobileOpen((value) => !value)}
        />
        <main className="page-content">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
