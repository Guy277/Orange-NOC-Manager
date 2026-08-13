import { useState } from "react";
import { siteApi } from "../api/index.js";
import { ErrorState } from "../components/common/ErrorState.jsx";
import { LoadingState } from "../components/common/LoadingState.jsx";
import { EmptyState } from "../components/common/EmptyState.jsx";
import { PageSection } from "../components/common/PageSection.jsx";
import { DataTable } from "../components/common/DataTable.jsx";
import { ConfirmDialog } from "../components/common/ConfirmDialog.jsx";
import { Pagination } from "../components/common/Pagination.jsx";
import { getSiteTypeLabel, siteTypeOptions } from "../utils/labels.js";
import { useAsyncData } from "../utils/hooks.js";

const emptyForm = { code: "", name: "", city: "", region: "", siteType: "radio" };

export function SitesPage() {
  const [filters, setFilters] = useState({ search: "", page: 1, limit: 8 });
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [selectedSite, setSelectedSite] = useState(null);
  const [message, setMessage] = useState("");

  const sites = useAsyncData(() => siteApi.list(filters), [filters.search, filters.page, filters.limit]);

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      if (editingId) {
        await siteApi.update(editingId, form);
        setMessage("Site mis a jour.");
      } else {
        await siteApi.create(form);
        setMessage("Site ajoute.");
      }

      setEditingId(null);
      setForm(emptyForm);
      await sites.reload();
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function handleDelete() {
    try {
      await siteApi.remove(selectedSite.id);
      setSelectedSite(null);
      setMessage("Site supprime.");
      await sites.reload();
    } catch (error) {
      setSelectedSite(null);
      setMessage(error.message);
    }
  }

  if (sites.loading) {
    return <LoadingState label="Chargement des sites..." />;
  }

  if (sites.error) {
    return <ErrorState error={sites.error} onRetry={sites.reload} />;
  }

  return (
    <div className="page-stack grid-two-wide">
      <PageSection title="Sites reseau">
        <div className="filters-inline">
          <input
            value={filters.search}
            onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value, page: 1 }))}
            placeholder="Rechercher par code ou nom"
          />
        </div>

        {message ? <p className="success-banner">{message}</p> : null}

        {!sites.data?.data?.length ? (
          <EmptyState message="Aucun site disponible." />
        ) : (
          <>
            <DataTable
              rows={sites.data.data}
              columns={[
                { key: "code", label: "Code" },
                { key: "name", label: "Nom" },
                { key: "city", label: "Ville" },
                { key: "region", label: "Region" },
                { key: "siteType", label: "Type", render: (row) => getSiteTypeLabel(row.siteType) },
                {
                  key: "actions",
                  label: "Actions",
                  render: (row) => (
                    <div className="table-actions">
                      <button
                        type="button"
                        className="button button-secondary button-small"
                        onClick={() => {
                          setEditingId(row.id);
                          setForm({
                            code: row.code,
                            name: row.name,
                            city: row.city,
                            region: row.region,
                            siteType: row.siteType
                          });
                        }}
                      >
                        Modifier
                      </button>
                      <button type="button" className="button button-danger button-small" onClick={() => setSelectedSite(row)}>
                        Supprimer
                      </button>
                    </div>
                  )
                }
              ]}
            />
            <Pagination
              page={sites.data.pagination.page}
              limit={sites.data.pagination.limit}
              total={sites.data.pagination.total}
              onPageChange={(page) => setFilters((current) => ({ ...current, page }))}
            />
          </>
        )}
      </PageSection>

      <PageSection title={editingId ? "Modifier le site" : "Ajouter un site"}>
        <form className="form-grid" onSubmit={handleSubmit}>
          <label className="field">
            <span>Code</span>
            <input value={form.code} onChange={(event) => setForm((current) => ({ ...current, code: event.target.value }))} />
          </label>
          <label className="field">
            <span>Nom</span>
            <input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} />
          </label>
          <label className="field">
            <span>Ville</span>
            <input value={form.city} onChange={(event) => setForm((current) => ({ ...current, city: event.target.value }))} />
          </label>
          <label className="field">
            <span>Region</span>
            <input value={form.region} onChange={(event) => setForm((current) => ({ ...current, region: event.target.value }))} />
          </label>
          <label className="field field-full">
            <span>Type de site</span>
            <select value={form.siteType} onChange={(event) => setForm((current) => ({ ...current, siteType: event.target.value }))}>
              {siteTypeOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <div className="form-actions field-full">
            <button type="submit" className="button button-primary">
              {editingId ? "Enregistrer" : "Ajouter"}
            </button>
            {editingId ? (
              <button
                type="button"
                className="button button-secondary"
                onClick={() => {
                  setEditingId(null);
                  setForm(emptyForm);
                }}
              >
                Annuler
              </button>
            ) : null}
          </div>
        </form>
      </PageSection>

      <ConfirmDialog
        open={Boolean(selectedSite)}
        title="Supprimer le site"
        message={`Voulez-vous supprimer ${selectedSite?.code || "ce site"} ?`}
        destructive
        confirmLabel="Supprimer"
        onCancel={() => setSelectedSite(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
