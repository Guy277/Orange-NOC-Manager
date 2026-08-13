import { Router } from "express";
import { AppError } from "../errors/AppError.js";
import { getLegacyIncidentFormReferences, submitLegacyIncidentForm } from "../services/legacyFormService.js";

export const legacyRouter = Router();

function escapeHtml(value) {
  return String(value ?? "")
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#39;");
}

function renderSelectOptions(items, config, selectedValue = "") {
  return items
    .map((item) => {
      const value = String(item[config.valueKey]);
      const selected = value === String(selectedValue) ? " selected" : "";
      return `<option value="${escapeHtml(value)}"${selected}>${escapeHtml(config.label(item))}</option>`;
    })
    .join("");
}

function renderLegacyIncidentForm({ references, values = {}, errorMessage = "", successIncident = null }) {
  const technicianOptions = [
    '<option value="">Aucun technicien pour le moment</option>',
    renderSelectOptions(
      references.technicians,
      {
        valueKey: "id",
        label: (item) => `${item.name} - ${item.specialty} (${item.zone})`
      },
      values.technicianId
    )
  ].join("");

  const siteOptions = renderSelectOptions(
    references.sites,
    {
      valueKey: "id",
      label: (item) => `${item.code} - ${item.name} (${item.city})`
    },
    values.siteId
  );

  const typeOptions = renderSelectOptions(
    references.incidentTypes,
    {
      valueKey: "id",
      label: (item) => `${item.label} - ${item.requiredSpecialty}`
    },
    values.typeId
  );

  const userOptions = renderSelectOptions(
    references.users,
    {
      valueKey: "id",
      label: (item) => `${item.name} (${item.role})`
    },
    values.createdBy
  );

  const priorityOptions = [
    ["low", "Faible"],
    ["medium", "Moyenne"],
    ["high", "Haute"],
    ["critical", "Critique"]
  ]
    .map(([value, label]) => {
      const selected = String(values.priority ?? "high") === value ? " selected" : "";
      return `<option value="${value}"${selected}>${label}</option>`;
    })
    .join("");

  const statusOptions = [
    ["reported", "Declare"],
    ["qualified", "Qualifie"],
    ["assigned", "Affecte"],
    ["in_progress", "En cours"],
    ["resolved", "Resolue"],
    ["closed", "Cloturee"],
    ["cancelled", "Annulee"]
  ]
    .map(([value, label]) => {
      const selected = String(values.status ?? "reported") === value ? " selected" : "";
      return `<option value="${value}"${selected}>${label}</option>`;
    })
    .join("");

  const feedback = successIncident
    ? `
      <div class="notice success">
        Incident cree avec succes : <strong>${escapeHtml(successIncident.reference)}</strong>.
        <a href="/incidents/${successIncident.id}">Voir dans l'application web</a>
      </div>
    `
    : errorMessage
      ? `<div class="notice error">${escapeHtml(errorMessage)}</div>`
      : "";

  return `<!DOCTYPE html>
<html lang="fr">
  <head>
    <meta charset="UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>Formulaire HTML natif - Orange NOC Manager</title>
    <style>
      :root {
        color-scheme: light;
        --orange: #ff7900;
        --ink: #101418;
        --muted: #5d6875;
        --surface: #ffffff;
        --surface-alt: #f4f7fb;
        --border: #d9e1ea;
        --danger: #b42318;
        --success: #157347;
      }
      * { box-sizing: border-box; }
      body {
        margin: 0;
        font-family: "Segoe UI", Arial, sans-serif;
        background: linear-gradient(180deg, #fff5eb 0%, #f4f7fb 42%, #eef2f7 100%);
        color: var(--ink);
      }
      .page {
        max-width: 980px;
        margin: 0 auto;
        padding: 32px 16px 48px;
      }
      .hero {
        margin-bottom: 24px;
        padding: 24px;
        border-radius: 24px;
        background: #111111;
        color: #ffffff;
      }
      .hero h1 { margin: 0 0 8px; font-size: 2rem; }
      .hero p { margin: 0; color: #d8d8d8; line-height: 1.5; }
      .panel {
        background: var(--surface);
        border: 1px solid var(--border);
        border-radius: 24px;
        padding: 24px;
        box-shadow: 0 18px 60px rgba(17, 24, 39, 0.08);
      }
      .notice {
        margin-bottom: 18px;
        padding: 14px 16px;
        border-radius: 16px;
        font-weight: 600;
      }
      .notice a { color: inherit; }
      .notice.error { background: #fee4e2; color: var(--danger); }
      .notice.success { background: #dcfae6; color: var(--success); }
      form {
        display: grid;
        gap: 18px;
      }
      .grid {
        display: grid;
        grid-template-columns: repeat(2, minmax(0, 1fr));
        gap: 18px;
      }
      label {
        display: block;
        margin-bottom: 8px;
        font-weight: 600;
      }
      input, select, textarea {
        width: 100%;
        border: 1px solid var(--border);
        border-radius: 14px;
        padding: 12px 14px;
        font: inherit;
        background: var(--surface-alt);
      }
      textarea {
        min-height: 140px;
        resize: vertical;
      }
      .hint {
        margin-top: 6px;
        color: var(--muted);
        font-size: 0.92rem;
      }
      .actions {
        display: flex;
        flex-wrap: wrap;
        gap: 12px;
        align-items: center;
      }
      button, .link-button {
        appearance: none;
        border: none;
        border-radius: 999px;
        padding: 12px 18px;
        font: inherit;
        font-weight: 700;
        cursor: pointer;
      }
      button {
        background: var(--orange);
        color: #111111;
      }
      .link-button {
        text-decoration: none;
        background: #111111;
        color: #ffffff;
      }
      .footnote {
        margin-top: 16px;
        color: var(--muted);
        font-size: 0.94rem;
      }
      @media (max-width: 720px) {
        .grid { grid-template-columns: 1fr; }
        .hero h1 { font-size: 1.6rem; }
      }
    </style>
  </head>
  <body>
    <main class="page">
      <section class="hero">
        <h1>Formulaire HTML natif sans AJAX</h1>
        <p>
          Cette page couvre la consigne de soumission HTTP classique en <code>POST</code>.
          Elle enregistre un incident en base via Express et PostgreSQL sans appel JavaScript asynchrone.
        </p>
      </section>

      <section class="panel">
        ${feedback}
        <form method="post" action="/legacy/incidents">
          <div>
            <label for="title">Titre de l'incident</label>
            <input id="title" name="title" type="text" required minlength="5" maxlength="180" value="${escapeHtml(values.title)}" />
          </div>

          <div>
            <label for="description">Description</label>
            <textarea id="description" name="description" required minlength="10" maxlength="4000">${escapeHtml(values.description)}</textarea>
          </div>

          <div class="grid">
            <div>
              <label for="priority">Priorite</label>
              <select id="priority" name="priority" required>${priorityOptions}</select>
            </div>
            <div>
              <label for="status">Statut</label>
              <select id="status" name="status" required>${statusOptions}</select>
            </div>
          </div>

          <div class="grid">
            <div>
              <label for="siteId">Site reseau</label>
              <select id="siteId" name="siteId" required>
                <option value="">Selectionner un site</option>
                ${siteOptions}
              </select>
            </div>
            <div>
              <label for="typeId">Type d'incident</label>
              <select id="typeId" name="typeId" required>
                <option value="">Selectionner un type</option>
                ${typeOptions}
              </select>
            </div>
          </div>

          <div class="grid">
            <div>
              <label for="technicianId">Technicien</label>
              <select id="technicianId" name="technicianId">
                ${technicianOptions}
              </select>
              <div class="hint">Optionnel. L'affectation initiale remplit aussi <code>assigned_at</code>.</div>
            </div>
            <div>
              <label for="createdBy">Declare par</label>
              <select id="createdBy" name="createdBy" required>
                <option value="">Selectionner un declarant</option>
                ${userOptions}
              </select>
            </div>
          </div>

          <div class="actions">
            <button type="submit">Creer l'incident</button>
            <a class="link-button" href="/">Retour a l'application React</a>
            <a class="link-button" href="/api/incidents">Voir l'API JSON</a>
          </div>
        </form>

        <p class="footnote">
          Route de demonstration : <code>GET /legacy/incidents/new</code> puis <code>POST /legacy/incidents</code>.
        </p>
      </section>
    </main>
  </body>
</html>`;
}

legacyRouter.get("/incidents/new", async (req, res, next) => {
  try {
    const references = await getLegacyIncidentFormReferences();
    const successId = Number(req.query.successId);
    let successIncident = null;

    if (Number.isInteger(successId) && successId > 0) {
      successIncident = { id: successId, reference: String(req.query.reference ?? "") };
    }

    res.type("html").send(renderLegacyIncidentForm({ references, successIncident }));
  } catch (error) {
    next(error);
  }
});

legacyRouter.post("/incidents", async (req, res, next) => {
  try {
    const incident = await submitLegacyIncidentForm(req.body);
    res.redirect(
      303,
      `/legacy/incidents/new?successId=${encodeURIComponent(incident.id)}&reference=${encodeURIComponent(incident.reference)}`
    );
  } catch (error) {
    try {
      const references = await getLegacyIncidentFormReferences();
      const message = error instanceof AppError ? error.message : "Une erreur interne est survenue.";
      res.status(error instanceof AppError ? error.status : 500).type("html").send(
        renderLegacyIncidentForm({
          references,
          values: req.body,
          errorMessage: message
        })
      );
    } catch (renderError) {
      next(renderError);
    }
  }
});
