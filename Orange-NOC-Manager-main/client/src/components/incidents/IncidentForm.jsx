import { priorityOptions, statusOptions } from "../../utils/labels.js";

export function IncidentForm({
  mode = "create",
  values,
  errors,
  onChange,
  onSubmit,
  submitting,
  sites,
  incidentTypes,
  technicians
}) {
  return (
    <form className="form-grid" onSubmit={onSubmit}>
      <label className="field">
        <span>Titre</span>
        <input name="title" value={values.title} onChange={onChange} placeholder="Ex. Coupure fibre sur Cocody" />
        {errors.title ? <small>{errors.title}</small> : null}
      </label>

      <label className="field field-full">
        <span>Description</span>
        <textarea
          name="description"
          rows="5"
          value={values.description}
          onChange={onChange}
          placeholder="Decrivez le contexte et l'impact constate."
        />
        {errors.description ? <small>{errors.description}</small> : null}
      </label>

      <label className="field">
        <span>Priorite</span>
        <select name="priority" value={values.priority} onChange={onChange}>
          {priorityOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <label className="field">
        <span>Statut initial</span>
        <select name="status" value={values.status} onChange={onChange}>
          {statusOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </label>

      <label className="field">
        <span>Site reseau</span>
        <select name="siteId" value={values.siteId} onChange={onChange}>
          <option value="">Selectionner un site</option>
          {sites.map((site) => (
            <option key={site.id} value={site.id}>
              {site.code} - {site.name}
            </option>
          ))}
        </select>
        {errors.siteId ? <small>{errors.siteId}</small> : null}
      </label>

      <label className="field">
        <span>Type d'incident</span>
        <select name="typeId" value={values.typeId} onChange={onChange}>
          <option value="">Selectionner un type</option>
          {incidentTypes.map((type) => (
            <option key={type.id} value={type.id}>
              {type.label}
            </option>
          ))}
        </select>
        {errors.typeId ? <small>{errors.typeId}</small> : null}
      </label>

      <label className="field field-full">
        <span>Technicien affecte</span>
        <select name="technicianId" value={values.technicianId} onChange={onChange}>
          <option value="">Aucune affectation</option>
          {technicians.map((technician) => (
            <option key={technician.id} value={technician.id}>
              {technician.name} - {technician.zone}
            </option>
          ))}
        </select>
      </label>

      {errors.form ? <p className="form-error field-full">{errors.form}</p> : null}

      <div className="form-actions field-full">
        <button type="submit" className="button button-primary" disabled={submitting}>
          {submitting ? "Envoi..." : mode === "create" ? "Creer l'incident" : "Enregistrer les modifications"}
        </button>
      </div>
    </form>
  );
}
