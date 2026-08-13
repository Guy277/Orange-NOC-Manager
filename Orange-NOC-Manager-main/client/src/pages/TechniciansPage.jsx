import { useState } from "react";
import { technicianApi } from "../api/index.js";
import { ErrorState } from "../components/common/ErrorState.jsx";
import { LoadingState } from "../components/common/LoadingState.jsx";
import { EmptyState } from "../components/common/EmptyState.jsx";
import { PageSection } from "../components/common/PageSection.jsx";
import { DataTable } from "../components/common/DataTable.jsx";
import { ConfirmDialog } from "../components/common/ConfirmDialog.jsx";
import { Pagination } from "../components/common/Pagination.jsx";
import { specialtyOptions } from "../utils/labels.js";
import { useAsyncData } from "../utils/hooks.js";

const emptyForm = { name: "", email: "", employeeCode: "", specialty: "radio", zone: "", isActive: true };

export function TechniciansPage() {
  const [filters, setFilters] = useState({ search: "", page: 1, limit: 8 });
  const [form, setForm] = useState(emptyForm);
  const [editingId, setEditingId] = useState(null);
  const [selectedTechnician, setSelectedTechnician] = useState(null);
  const [message, setMessage] = useState("");

  const technicians = useAsyncData(
    () => technicianApi.list(filters),
    [filters.search, filters.page, filters.limit]
  );

  async function handleSubmit(event) {
    event.preventDefault();

    try {
      if (editingId) {
        await technicianApi.update(editingId, form);
        setMessage("Technicien mis a jour.");
      } else {
        await technicianApi.create(form);
        setMessage("Technicien ajoute.");
      }

      setForm(emptyForm);
      setEditingId(null);
      await technicians.reload();
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function handleDelete() {
    try {
      await technicianApi.remove(selectedTechnician.id);
      setSelectedTechnician(null);
      setMessage("Technicien supprime.");
      await technicians.reload();
    } catch (error) {
      setSelectedTechnician(null);
      setMessage(error.message);
    }
  }

  if (technicians.loading) {
    return <LoadingState label="Chargement des techniciens..." />;
  }

  if (technicians.error) {
    return <ErrorState error={technicians.error} onRetry={technicians.reload} />;
  }

  return (
    <div className="page-stack grid-two-wide">
      <PageSection title="Equipe technique">
        <div className="filters-inline">
          <input
            value={filters.search}
            onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value, page: 1 }))}
            placeholder="Rechercher un technicien"
          />
        </div>

        {message ? <p className="success-banner">{message}</p> : null}

        {!technicians.data?.data?.length ? (
          <EmptyState message="Aucun technicien disponible." />
        ) : (
          <>
            <DataTable
              rows={technicians.data.data}
              columns={[
                { key: "name", label: "Nom" },
                { key: "employeeCode", label: "Matricule" },
                { key: "specialty", label: "Specialite" },
                { key: "zone", label: "Zone" },
                { key: "isActive", label: "Etat", render: (row) => (row.isActive ? "Actif" : "Inactif") },
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
                            name: row.name,
                            email: row.email,
                            employeeCode: row.employeeCode,
                            specialty: row.specialty,
                            zone: row.zone,
                            isActive: row.isActive
                          });
                        }}
                      >
                        Modifier
                      </button>
                      <button type="button" className="button button-danger button-small" onClick={() => setSelectedTechnician(row)}>
                        Supprimer
                      </button>
                    </div>
                  )
                }
              ]}
            />
            <Pagination
              page={technicians.data.pagination.page}
              limit={technicians.data.pagination.limit}
              total={technicians.data.pagination.total}
              onPageChange={(page) => setFilters((current) => ({ ...current, page }))}
            />
          </>
        )}
      </PageSection>

      <PageSection title={editingId ? "Modifier le technicien" : "Ajouter un technicien"}>
        <form className="form-grid" onSubmit={handleSubmit}>
          <label className="field">
            <span>Nom</span>
            <input value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} />
          </label>
          <label className="field">
            <span>Email</span>
            <input value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} />
          </label>
          <label className="field">
            <span>Matricule</span>
            <input value={form.employeeCode} onChange={(event) => setForm((current) => ({ ...current, employeeCode: event.target.value }))} />
          </label>
          <label className="field">
            <span>Specialite</span>
            <select value={form.specialty} onChange={(event) => setForm((current) => ({ ...current, specialty: event.target.value }))}>
              {specialtyOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </select>
          </label>
          <label className="field">
            <span>Zone</span>
            <input value={form.zone} onChange={(event) => setForm((current) => ({ ...current, zone: event.target.value }))} />
          </label>
          <label className="field checkbox-field">
            <input
              type="checkbox"
              checked={form.isActive}
              onChange={(event) => setForm((current) => ({ ...current, isActive: event.target.checked }))}
            />
            <span>Technicien actif</span>
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
        open={Boolean(selectedTechnician)}
        title="Supprimer le technicien"
        message={`Voulez-vous supprimer ${selectedTechnician?.name || "ce technicien"} ?`}
        destructive
        confirmLabel="Supprimer"
        onCancel={() => setSelectedTechnician(null)}
        onConfirm={handleDelete}
      />
    </div>
  );
}
