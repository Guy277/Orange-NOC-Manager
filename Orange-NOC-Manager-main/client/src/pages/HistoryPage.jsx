import { useState } from "react";
import { logApi } from "../api/index.js";
import { LoadingState } from "../components/common/LoadingState.jsx";
import { ErrorState } from "../components/common/ErrorState.jsx";
import { EmptyState } from "../components/common/EmptyState.jsx";
import { PageSection } from "../components/common/PageSection.jsx";
import { DataTable } from "../components/common/DataTable.jsx";
import { Pagination } from "../components/common/Pagination.jsx";
import { formatDateTime, truncateText } from "../utils/formatters.js";
import { useAsyncData } from "../utils/hooks.js";

export function HistoryPage() {
  const [filters, setFilters] = useState({
    action: "",
    tableName: "",
    recordId: "",
    dateFrom: "",
    dateTo: "",
    page: 1,
    limit: 10
  });
  const [selectedLog, setSelectedLog] = useState(null);

  const logs = useAsyncData(() => logApi.list(filters), [
    filters.action,
    filters.tableName,
    filters.recordId,
    filters.dateFrom,
    filters.dateTo,
    filters.page,
    filters.limit
  ]);

  if (logs.loading) {
    return <LoadingState label="Chargement des logs..." />;
  }

  if (logs.error) {
    return <ErrorState error={logs.error} onRetry={logs.reload} />;
  }

  return (
    <div className="page-stack">
      <PageSection title="Historique technique">
        <div className="filters-grid">
          <label className="field">
            <span>Action</span>
            <select value={filters.action} onChange={(event) => setFilters((current) => ({ ...current, action: event.target.value, page: 1 }))}>
              <option value="">Toutes</option>
              <option value="INSERT">INSERT</option>
              <option value="UPDATE">UPDATE</option>
              <option value="DELETE">DELETE</option>
            </select>
          </label>
          <label className="field">
            <span>Table</span>
            <input value={filters.tableName} onChange={(event) => setFilters((current) => ({ ...current, tableName: event.target.value, page: 1 }))} />
          </label>
          <label className="field">
            <span>ID enregistrement</span>
            <input value={filters.recordId} onChange={(event) => setFilters((current) => ({ ...current, recordId: event.target.value, page: 1 }))} />
          </label>
          <label className="field">
            <span>Date debut</span>
            <input type="datetime-local" value={filters.dateFrom} onChange={(event) => setFilters((current) => ({ ...current, dateFrom: event.target.value ? new Date(event.target.value).toISOString() : "", page: 1 }))} />
          </label>
          <label className="field">
            <span>Date fin</span>
            <input type="datetime-local" value={filters.dateTo} onChange={(event) => setFilters((current) => ({ ...current, dateTo: event.target.value ? new Date(event.target.value).toISOString() : "", page: 1 }))} />
          </label>
        </div>

        {!logs.data?.data?.length ? (
          <EmptyState message="Aucun log correspondant." />
        ) : (
          <>
            <DataTable
              rows={logs.data.data}
              columns={[
                { key: "changedAt", label: "Date", render: (row) => formatDateTime(row.changedAt) },
                { key: "action", label: "Action" },
                { key: "tableName", label: "Table" },
                { key: "recordId", label: "ID" },
                { key: "dbUser", label: "Utilisateur" },
                {
                  key: "detail",
                  label: "Detail",
                  render: (row) => (
                    <button type="button" className="button button-secondary button-small" onClick={() => setSelectedLog(row)}>
                      {truncateText(JSON.stringify(row.newData || row.oldData || {}), 50)}
                    </button>
                  )
                }
              ]}
            />
            <Pagination
              page={logs.data.pagination.page}
              limit={logs.data.pagination.limit}
              total={logs.data.pagination.total}
              onPageChange={(page) => setFilters((current) => ({ ...current, page }))}
            />
          </>
        )}
      </PageSection>

      {selectedLog ? (
        <PageSection
          title={`Detail du log #${selectedLog.id}`}
          actions={
            <button type="button" className="button button-secondary" onClick={() => setSelectedLog(null)}>
              Fermer
            </button>
          }
        >
          <div className="log-detail">
            <div>
              <h3>Ancienne valeur</h3>
              <pre>{JSON.stringify(selectedLog.oldData, null, 2)}</pre>
            </div>
            <div>
              <h3>Nouvelle valeur</h3>
              <pre>{JSON.stringify(selectedLog.newData, null, 2)}</pre>
            </div>
          </div>
        </PageSection>
      ) : null}
    </div>
  );
}
