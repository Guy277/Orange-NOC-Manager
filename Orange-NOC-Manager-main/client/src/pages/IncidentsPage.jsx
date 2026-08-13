import { useEffect, useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { incidentApi, incidentTypeApi, siteApi } from "../api/index.js";
import { ErrorState } from "../components/common/ErrorState.jsx";
import { LoadingState } from "../components/common/LoadingState.jsx";
import { EmptyState } from "../components/common/EmptyState.jsx";
import { PageSection } from "../components/common/PageSection.jsx";
import { Pagination } from "../components/common/Pagination.jsx";
import { ConfirmDialog } from "../components/common/ConfirmDialog.jsx";
import { PriorityBadge } from "../components/common/PriorityBadge.jsx";
import { StatusBadge } from "../components/common/StatusBadge.jsx";
import { DataTable } from "../components/common/DataTable.jsx";
import { useAsyncData } from "../utils/hooks.js";
import { formatDateTime } from "../utils/formatters.js";
import { priorityOptions, statusOptions } from "../utils/labels.js";

export function IncidentsPage() {
  const [filters, setFilters] = useState({
    search: "",
    status: "",
    priority: "",
    typeId: "",
    siteId: "",
    page: 1,
    limit: 10
  });
  const [selectedIncident, setSelectedIncident] = useState(null);
  const [feedback, setFeedback] = useState("");

  const references = useAsyncData(async () => {
    const [types, sites] = await Promise.all([
      incidentTypeApi.list({ page: 1, limit: 100 }),
      siteApi.list({ page: 1, limit: 100 })
    ]);

    return { types: types.data, sites: sites.data };
  }, []);

  const incidents = useAsyncData(
    () => incidentApi.list({ ...filters, page: filters.page, limit: filters.limit }),
    [filters.search, filters.status, filters.priority, filters.typeId, filters.siteId, filters.page, filters.limit]
  );

  useEffect(() => {
    if (!feedback) {
      return undefined;
    }

    const timer = window.setTimeout(() => setFeedback(""), 3000);
    return () => window.clearTimeout(timer);
  }, [feedback]);

  const refData = useMemo(() => references.data || { types: [], sites: [] }, [references.data]);

  async function handleDelete() {
    if (!selectedIncident) {
      return;
    }

    try {
      await incidentApi.remove(selectedIncident.id);
      setFeedback("Incident supprime avec succes.");
      setSelectedIncident(null);
      await incidents.reload();
    } catch (error) {
      setFeedback(error.message);
      setSelectedIncident(null);
    }
  }

  function resetFilters() {
    setFilters({
      search: "",
      status: "",
      priority: "",
      typeId: "",
      siteId: "",
      page: 1,
      limit: 10
    });
  }

  if (references.loading || incidents.loading) {
    return <LoadingState label="Chargement des incidents..." />;
  }

  if (references.error) {
    return <ErrorState error={references.error} onRetry={references.reload} />;
  }

  if (incidents.error) {
    return <ErrorState error={incidents.error} onRetry={incidents.reload} />;
  }

  return (
    <div className="page-stack">
      <PageSection
        title="Liste des incidents"
        actions={
          <Link to="/incidents/new" className="button button-primary">
            Nouvel incident
          </Link>
        }
      >
        <div className="filters-grid">
          <label className="field">
            <span>Recherche</span>
            <input
              value={filters.search}
              onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value, page: 1 }))}
              placeholder="Reference, titre ou description"
            />
          </label>

          <label className="field">
            <span>Statut</span>
            <select value={filters.status} onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value, page: 1 }))}>
              <option value="">Tous</option>
              {statusOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Priorite</span>
            <select value={filters.priority} onChange={(event) => setFilters((current) => ({ ...current, priority: event.target.value, page: 1 }))}>
              <option value="">Toutes</option>
              {priorityOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Type</span>
            <select value={filters.typeId} onChange={(event) => setFilters((current) => ({ ...current, typeId: event.target.value, page: 1 }))}>
              <option value="">Tous</option>
              {refData.types.map((type) => (
                <option key={type.id} value={type.id}>
                  {type.label}
                </option>
              ))}
            </select>
          </label>

          <label className="field">
            <span>Site</span>
            <select value={filters.siteId} onChange={(event) => setFilters((current) => ({ ...current, siteId: event.target.value, page: 1 }))}>
              <option value="">Tous</option>
              {refData.sites.map((site) => (
                <option key={site.id} value={site.id}>
                  {site.code}
                </option>
              ))}
            </select>
          </label>

          <div className="form-actions align-end">
            <button type="button" className="button button-secondary" onClick={resetFilters}>
              Reinitialiser
            </button>
          </div>
        </div>

        {feedback ? <p className="success-banner">{feedback}</p> : null}

        {!incidents.data?.data?.length ? (
          <EmptyState message="Aucun incident ne correspond aux filtres courants." />
        ) : (
          <>
            <DataTable
              rows={incidents.data.data}
              columns={[
                { key: "reference", label: "Reference" },
                { key: "title", label: "Titre" },
                { key: "type_label", label: "Type" },
                { key: "site_name", label: "Site" },
                { key: "priority", label: "Priorite", render: (row) => <PriorityBadge value={row.priority} /> },
                { key: "status", label: "Statut", render: (row) => <StatusBadge value={row.status} /> },
                { key: "technician_name", label: "Technicien", render: (row) => row.technician_name || "Non affecte" },
                { key: "created_at", label: "Declare le", render: (row) => formatDateTime(row.created_at) },
                {
                  key: "actions",
                  label: "Actions",
                  render: (row) => (
                    <div className="table-actions">
                      <Link to={`/incidents/${row.id}`} className="button button-secondary button-small">
                        Detail
                      </Link>
                      <button type="button" className="button button-danger button-small" onClick={() => setSelectedIncident(row)}>
                        Supprimer
                      </button>
                    </div>
                  )
                }
              ]}
            />

            <Pagination
              page={incidents.data.pagination.page}
              limit={incidents.data.pagination.limit}
              total={incidents.data.pagination.total}
              onPageChange={(page) => setFilters((current) => ({ ...current, page }))}
            />
          </>
        )}
      </PageSection>

      <ConfirmDialog
        open={Boolean(selectedIncident)}
        title="Supprimer l'incident"
        message={`Voulez-vous vraiment supprimer ${selectedIncident?.reference || "cet incident"} ?`}
        destructive
        confirmLabel="Supprimer"
        onCancel={() => setSelectedIncident(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
