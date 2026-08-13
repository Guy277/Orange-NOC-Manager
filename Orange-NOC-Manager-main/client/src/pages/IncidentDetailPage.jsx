import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import { incidentApi, incidentTypeApi, interventionApi, siteApi, technicianApi } from "../api/index.js";
import { LoadingState } from "../components/common/LoadingState.jsx";
import { ErrorState } from "../components/common/ErrorState.jsx";
import { PageSection } from "../components/common/PageSection.jsx";
import { ConfirmDialog } from "../components/common/ConfirmDialog.jsx";
import { PriorityBadge } from "../components/common/PriorityBadge.jsx";
import { StatusBadge } from "../components/common/StatusBadge.jsx";
import { DataTable } from "../components/common/DataTable.jsx";
import { IncidentForm } from "../components/incidents/IncidentForm.jsx";
import { useAsyncData } from "../utils/hooks.js";
import { formatDateTime, formatMinutes } from "../utils/formatters.js";
import { priorityOptions, statusOptions } from "../utils/labels.js";

export function IncidentDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [editing, setEditing] = useState(false);
  const [deleting, setDeleting] = useState(false);
  const [message, setMessage] = useState("");
  const [interventionEditId, setInterventionEditId] = useState(null);

  const pageData = useAsyncData(async () => {
    const [incident, sites, types, technicians, logs] = await Promise.all([
      incidentApi.get(id),
      siteApi.list({ page: 1, limit: 100 }),
      incidentTypeApi.list({ page: 1, limit: 100 }),
      technicianApi.list({ page: 1, limit: 100 }),
      incidentApi.listLogs(id)
    ]);

    return {
      incident,
      sites: sites.data,
      types: types.data,
      technicians: technicians.data,
      logs: logs.data
    };
  }, [id]);

  const [editValues, setEditValues] = useState(null);
  const [interventionForm, setInterventionForm] = useState({
    technicianId: "",
    action: "",
    comment: "",
    startedAt: "",
    endedAt: ""
  });

  const incident = pageData.data?.incident;

  const incidentFormValues = useMemo(() => {
    if (!incident) {
      return null;
    }

    return (
      editValues || {
        title: incident.title,
        description: incident.description,
        priority: incident.priority,
        status: incident.status,
        siteId: String(incident.site.id),
        typeId: String(incident.incident_type.id),
        technicianId: incident.technician ? String(incident.technician.id) : ""
      }
    );
  }, [editValues, incident]);

  if (pageData.loading) {
    return <LoadingState label="Chargement du detail incident..." />;
  }

  if (pageData.error) {
    return <ErrorState error={pageData.error} onRetry={pageData.reload} />;
  }

  async function handleUpdateIncident(event) {
    event.preventDefault();

    try {
      await incidentApi.update(id, {
        title: incidentFormValues.title,
        description: incidentFormValues.description,
        priority: incidentFormValues.priority,
        siteId: Number(incidentFormValues.siteId),
        typeId: Number(incidentFormValues.typeId),
        technicianId: incidentFormValues.technicianId ? Number(incidentFormValues.technicianId) : null
      });
      setEditing(false);
      setEditValues(null);
      setMessage("Incident mis a jour.");
      await pageData.reload();
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function handleStatusChange(nextStatus) {
    try {
      await incidentApi.changeStatus(id, { status: nextStatus });
      setMessage("Statut mis a jour.");
      await pageData.reload();
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function handleAssignmentChange(nextTechnicianId) {
    try {
      await incidentApi.assign(id, { technicianId: nextTechnicianId ? Number(nextTechnicianId) : null });
      setMessage("Affectation mise a jour.");
      await pageData.reload();
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function handleInterventionSubmit(event) {
    event.preventDefault();

    try {
      const payload = {
        technicianId: Number(interventionForm.technicianId),
        action: interventionForm.action,
        comment: interventionForm.comment,
        startedAt: new Date(interventionForm.startedAt).toISOString(),
        endedAt: interventionForm.endedAt ? new Date(interventionForm.endedAt).toISOString() : null
      };

      if (interventionEditId) {
        await interventionApi.update(interventionEditId, payload);
        setMessage("Intervention mise a jour.");
      } else {
        await incidentApi.createIntervention(id, payload);
        setMessage("Intervention ajoutee.");
      }

      setInterventionEditId(null);
      setInterventionForm({ technicianId: "", action: "", comment: "", startedAt: "", endedAt: "" });
      await pageData.reload();
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function handleDeleteIntervention(interventionId) {
    try {
      await interventionApi.remove(interventionId);
      setMessage("Intervention supprimee.");
      await pageData.reload();
    } catch (error) {
      setMessage(error.message);
    }
  }

  async function handleDeleteIncident() {
    try {
      await incidentApi.remove(id);
      navigate("/incidents");
    } catch (error) {
      setMessage(error.message);
      setDeleting(false);
    }
  }

  return (
    <div className="page-stack">
      <PageSection
        title={`${incident.reference} - ${incident.title}`}
        actions={
          <div className="table-actions">
            <Link to="/incidents" className="button button-secondary">
              Retour a la liste
            </Link>
            <button type="button" className="button button-danger" onClick={() => setDeleting(true)}>
              Supprimer
            </button>
          </div>
        }
      >
        {message ? <p className="success-banner">{message}</p> : null}

        <div className="detail-grid">
          <div className="detail-card">
            <span>Priorite</span>
            <PriorityBadge value={incident.priority} />
          </div>
          <div className="detail-card">
            <span>Statut</span>
            <StatusBadge value={incident.status} />
          </div>
          <div className="detail-card">
            <span>Site</span>
            <strong>{incident.site.name}</strong>
          </div>
          <div className="detail-card">
            <span>Type</span>
            <strong>{incident.incident_type.label}</strong>
          </div>
        </div>

        <div className="detail-description">
          <h3>Description</h3>
          <p>{incident.description}</p>
        </div>

        <div className="detail-meta-grid">
          <div className="meta-block">
            <h3>Dates importantes</h3>
            <ul>
              <li>Creation : {formatDateTime(incident.created_at)}</li>
              <li>Mise a jour : {formatDateTime(incident.updated_at)}</li>
              <li>Affectation : {formatDateTime(incident.assigned_at)}</li>
              <li>Resolution : {formatDateTime(incident.resolved_at)}</li>
              <li>Cloture : {formatDateTime(incident.closed_at)}</li>
            </ul>
          </div>
          <div className="meta-block">
            <h3>Technicien affecte</h3>
            <p>{incident.technician ? `${incident.technician.name} - ${incident.technician.zone}` : "Non affecte"}</p>
          </div>
        </div>
      </PageSection>

      <div className="grid-two-wide">
        <PageSection title="Modifier les informations">
          {!editing ? (
            <button
              type="button"
              className="button button-secondary"
              onClick={() => {
                setEditing(true);
                setEditValues({
                  title: incident.title,
                  description: incident.description,
                  priority: incident.priority,
                  status: incident.status,
                  siteId: String(incident.site.id),
                  typeId: String(incident.incident_type.id),
                  technicianId: incident.technician ? String(incident.technician.id) : ""
                });
              }}
            >
              Editer l'incident
            </button>
          ) : (
            <IncidentForm
              mode="edit"
              values={incidentFormValues}
              errors={{}}
              onChange={(event) => setEditValues((current) => ({ ...current, [event.target.name]: event.target.value }))}
              onSubmit={handleUpdateIncident}
              submitting={false}
              sites={pageData.data.sites}
              incidentTypes={pageData.data.types}
              technicians={pageData.data.technicians.filter((item) => item.isActive)}
            />
          )}
        </PageSection>

        <PageSection title="Actions rapides">
          <div className="field">
            <span>Changer le statut</span>
            <div className="action-list">
              {statusOptions.map((option) => (
                <button key={option.value} type="button" className="button button-secondary" onClick={() => handleStatusChange(option.value)}>
                  {option.label}
                </button>
              ))}
            </div>
          </div>

          <label className="field">
            <span>Affecter un technicien</span>
            <select defaultValue={incident.technician?.id || ""} onChange={(event) => handleAssignmentChange(event.target.value)}>
              <option value="">Aucune affectation</option>
              {pageData.data.technicians.map((technician) => (
                <option key={technician.id} value={technician.id}>
                  {technician.name} - {technician.zone}
                </option>
              ))}
            </select>
          </label>
        </PageSection>
      </div>

      <div className="grid-two-wide">
        <PageSection title="Interventions">
          <DataTable
            rows={incident.interventions}
            columns={[
              { key: "action", label: "Action" },
              { key: "comment", label: "Commentaire" },
              { key: "duration_minutes", label: "Duree", render: (row) => formatMinutes(row.duration_minutes) },
              { key: "started_at", label: "Debut", render: (row) => formatDateTime(row.started_at) },
              {
                key: "actions",
                label: "Actions",
                render: (row) => (
                  <div className="table-actions">
                    <button
                      type="button"
                      className="button button-secondary button-small"
                      onClick={() => {
                        setInterventionEditId(row.id);
                        setInterventionForm({
                          technicianId: String(row.technician.id),
                          action: row.action,
                          comment: row.comment,
                          startedAt: row.started_at.slice(0, 16),
                          endedAt: row.ended_at ? row.ended_at.slice(0, 16) : ""
                        });
                      }}
                    >
                      Modifier
                    </button>
                    <button type="button" className="button button-danger button-small" onClick={() => handleDeleteIntervention(row.id)}>
                      Supprimer
                    </button>
                  </div>
                )
              }
            ]}
          />
        </PageSection>

        <PageSection title={interventionEditId ? "Modifier une intervention" : "Ajouter une intervention"}>
          <form className="form-grid" onSubmit={handleInterventionSubmit}>
            <label className="field">
              <span>Technicien</span>
              <select value={interventionForm.technicianId} onChange={(event) => setInterventionForm((current) => ({ ...current, technicianId: event.target.value }))}>
                <option value="">Selectionner</option>
                {pageData.data.technicians.filter((item) => item.isActive).map((technician) => (
                  <option key={technician.id} value={technician.id}>
                    {technician.name}
                  </option>
                ))}
              </select>
            </label>
            <label className="field">
              <span>Action</span>
              <input value={interventionForm.action} onChange={(event) => setInterventionForm((current) => ({ ...current, action: event.target.value }))} />
            </label>
            <label className="field field-full">
              <span>Commentaire</span>
              <textarea rows="4" value={interventionForm.comment} onChange={(event) => setInterventionForm((current) => ({ ...current, comment: event.target.value }))} />
            </label>
            <label className="field">
              <span>Debut</span>
              <input type="datetime-local" value={interventionForm.startedAt} onChange={(event) => setInterventionForm((current) => ({ ...current, startedAt: event.target.value }))} />
            </label>
            <label className="field">
              <span>Fin</span>
              <input type="datetime-local" value={interventionForm.endedAt} onChange={(event) => setInterventionForm((current) => ({ ...current, endedAt: event.target.value }))} />
            </label>
            <div className="form-actions field-full">
              <button type="submit" className="button button-primary">
                {interventionEditId ? "Enregistrer" : "Ajouter l'intervention"}
              </button>
              {interventionEditId ? (
                <button
                  type="button"
                  className="button button-secondary"
                  onClick={() => {
                    setInterventionEditId(null);
                    setInterventionForm({ technicianId: "", action: "", comment: "", startedAt: "", endedAt: "" });
                  }}
                >
                  Annuler
                </button>
              ) : null}
            </div>
          </form>
        </PageSection>
      </div>

      <PageSection title="Historique de l'incident">
        <DataTable
          rows={pageData.data.logs}
          columns={[
            { key: "changedAt", label: "Date", render: (row) => formatDateTime(row.changedAt) },
            { key: "action", label: "Action" },
            { key: "dbUser", label: "Utilisateur" },
            {
              key: "detail",
              label: "Detail",
              render: (row) => (
                <details>
                  <summary>Afficher le JSON</summary>
                  <pre>{JSON.stringify({ oldData: row.oldData, newData: row.newData }, null, 2)}</pre>
                </details>
              )
            }
          ]}
        />
      </PageSection>

      <ConfirmDialog
        open={deleting}
        title="Supprimer l'incident"
        message="Confirmez-vous la suppression definitive de cet incident ?"
        destructive
        confirmLabel="Supprimer"
        onCancel={() => setDeleting(false)}
        onConfirm={handleDeleteIncident}
      />
    </div>
  );
}
