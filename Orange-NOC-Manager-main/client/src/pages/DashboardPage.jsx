import {
  ArcElement,
  CategoryScale,
  Chart as ChartJS,
  Legend,
  LineElement,
  PointElement,
  Tooltip
} from "chart.js";
import { Doughnut } from "react-chartjs-2";
import { dashboardApi } from "../api/index.js";
import { useAsyncData } from "../utils/hooks.js";
import { ErrorState } from "../components/common/ErrorState.jsx";
import { LoadingState } from "../components/common/LoadingState.jsx";
import { EmptyState } from "../components/common/EmptyState.jsx";
import { KpiCard } from "../components/common/KpiCard.jsx";
import { PageSection } from "../components/common/PageSection.jsx";
import { DataTable } from "../components/common/DataTable.jsx";
import { StatusBadge } from "../components/common/StatusBadge.jsx";
import { PriorityBadge } from "../components/common/PriorityBadge.jsx";
import { formatDateTime, formatMinutes } from "../utils/formatters.js";

ChartJS.register(ArcElement, Tooltip, Legend, CategoryScale, LineElement, PointElement);

export function DashboardPage() {
  const { data, loading, error, reload } = useAsyncData(async () => {
    const [summary, byType, byStatus, recent, performance] = await Promise.all([
      dashboardApi.summary(),
      dashboardApi.incidentsByType(),
      dashboardApi.incidentsByStatus(),
      dashboardApi.recentIncidents({ limit: 5 }),
      dashboardApi.technicianPerformance({ limit: 5 })
    ]);

    return { summary, byType: byType.data, byStatus: byStatus.data, recent: recent.data, performance: performance.data };
  }, []);

  if (loading) {
    return <LoadingState label="Chargement du tableau de bord..." />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={reload} />;
  }

  if (!data) {
    return <EmptyState message="Aucune donnee dashboard disponible." />;
  }

  const typeChartData = {
    labels: data.byType.map((item) => item.label),
    datasets: [
      {
        data: data.byType.map((item) => item.count),
        backgroundColor: ["#FF7900", "#2563EB", "#16A34A", "#F59E0B", "#DC2626", "#111111"]
      }
    ]
  };

  const statusChartData = {
    labels: data.byStatus.map((item) => item.status),
    datasets: [
      {
        data: data.byStatus.map((item) => item.count),
        backgroundColor: ["#2563EB", "#F59E0B", "#16A34A", "#DC2626", "#111111", "#FF7900", "#6B7280"]
      }
    ]
  };

  return (
    <div className="page-stack">
      <section className="kpi-grid">
        <KpiCard label="Total incidents" value={data.summary.total_incidents} tone="orange" />
        <KpiCard label="Incidents ouverts" value={data.summary.open_incidents} tone="blue" />
        <KpiCard label="Incidents critiques" value={data.summary.critical_incidents} tone="red" />
        <KpiCard label="Incidents resolus" value={data.summary.resolved_incidents} tone="green" />
        <KpiCard
          label="Temps moyen de resolution"
          value={formatMinutes(data.summary.average_resolution_minutes)}
          tone="dark"
        />
      </section>

      <div className="grid-two">
        <PageSection title="Incidents par type">
          {data.byType.length ? <Doughnut data={typeChartData} /> : <EmptyState message="Aucun type a afficher." />}
        </PageSection>
        <PageSection title="Incidents par statut">
          {data.byStatus.length ? <Doughnut data={statusChartData} /> : <EmptyState message="Aucun statut a afficher." />}
        </PageSection>
      </div>

      <div className="grid-two">
        <PageSection title="Incidents recents">
          <DataTable
            rows={data.recent}
            columns={[
              { key: "reference", label: "Reference" },
              { key: "title", label: "Titre" },
              { key: "priority", label: "Priorite", render: (row) => <PriorityBadge value={row.priority} /> },
              { key: "status", label: "Statut", render: (row) => <StatusBadge value={row.status} /> },
              { key: "created_at", label: "Declare le", render: (row) => formatDateTime(row.created_at) }
            ]}
          />
        </PageSection>

        <PageSection title="Techniciens les plus actifs">
          <DataTable
            rows={data.performance}
            columns={[
              { key: "name", label: "Technicien" },
              { key: "specialty", label: "Specialite" },
              { key: "assigned_incidents", label: "Incidents affectes" },
              { key: "interventions_count", label: "Interventions" },
              { key: "resolved_incidents", label: "Resolus" }
            ]}
          />
        </PageSection>
      </div>
    </div>
  );
}
