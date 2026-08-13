import { Navigate, Route, Routes } from "react-router-dom";
import { AppLayout } from "./components/layout/AppLayout.jsx";
import { DashboardPage } from "./pages/DashboardPage.jsx";
import { IncidentsPage } from "./pages/IncidentsPage.jsx";
import { IncidentCreatePage } from "./pages/IncidentCreatePage.jsx";
import { IncidentDetailPage } from "./pages/IncidentDetailPage.jsx";
import { TechniciansPage } from "./pages/TechniciansPage.jsx";
import { SitesPage } from "./pages/SitesPage.jsx";
import { HistoryPage } from "./pages/HistoryPage.jsx";
import { ExportPage } from "./pages/ExportPage.jsx";

export function App() {
  return (
    <Routes>
      <Route path="/" element={<AppLayout />}>
        <Route index element={<Navigate to="/dashboard" replace />} />
        <Route path="dashboard" element={<DashboardPage />} />
        <Route path="incidents" element={<IncidentsPage />} />
        <Route path="incidents/new" element={<IncidentCreatePage />} />
        <Route path="incidents/:id" element={<IncidentDetailPage />} />
        <Route path="technicians" element={<TechniciansPage />} />
        <Route path="sites" element={<SitesPage />} />
        <Route path="history" element={<HistoryPage />} />
        <Route path="exports" element={<ExportPage />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Route>
    </Routes>
  );
}
