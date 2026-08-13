import { useEffect, useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { incidentApi, incidentTypeApi, siteApi, technicianApi } from "../api/index.js";
import { IncidentForm } from "../components/incidents/IncidentForm.jsx";
import { LoadingState } from "../components/common/LoadingState.jsx";
import { ErrorState } from "../components/common/ErrorState.jsx";
import { PageSection } from "../components/common/PageSection.jsx";
import { useAsyncData } from "../utils/hooks.js";

function validate(values) {
  const errors = {};

  if (!values.title.trim()) {
    errors.title = "Le titre est obligatoire.";
  }

  if (values.description.trim().length < 10) {
    errors.description = "La description doit contenir au moins 10 caracteres.";
  }

  if (!values.siteId) {
    errors.siteId = "Le site reseau est obligatoire.";
  }

  if (!values.typeId) {
    errors.typeId = "Le type d'incident est obligatoire.";
  }

  return errors;
}

export function IncidentCreatePage() {
  const navigate = useNavigate();
  const [values, setValues] = useState({
    title: "",
    description: "",
    priority: "medium",
    status: "reported",
    siteId: "",
    typeId: "",
    technicianId: ""
  });
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");

  const { data, loading, error, reload } = useAsyncData(async () => {
    const [sites, incidentTypes, technicians] = await Promise.all([
      siteApi.list({ page: 1, limit: 100 }),
      incidentTypeApi.list({ page: 1, limit: 100 }),
      technicianApi.list({ page: 1, limit: 100 })
    ]);

    return {
      sites: sites.data,
      incidentTypes: incidentTypes.data,
      technicians: technicians.data.filter((item) => item.isActive)
    };
  }, []);

  useEffect(() => {
    if (successMessage) {
      const timer = window.setTimeout(() => setSuccessMessage(""), 2500);
      return () => window.clearTimeout(timer);
    }
  }, [successMessage]);

  const referenceData = useMemo(
    () => data || { sites: [], incidentTypes: [], technicians: [] },
    [data]
  );

  function handleChange(event) {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const nextErrors = validate(values);
    setErrors(nextErrors);

    if (Object.keys(nextErrors).length) {
      return;
    }

    setSubmitting(true);

    try {
      const incident = await incidentApi.create({
        title: values.title.trim(),
        description: values.description.trim(),
        priority: values.priority,
        status: values.status,
        siteId: Number(values.siteId),
        typeId: Number(values.typeId),
        technicianId: values.technicianId ? Number(values.technicianId) : null,
        createdBy: 1
      });

      setSuccessMessage("Incident cree avec succes.");
      navigate(`/incidents/${incident.id}`);
    } catch (apiError) {
      setErrors({ form: apiError.message });
    } finally {
      setSubmitting(false);
    }
  }

  if (loading) {
    return <LoadingState label="Chargement du formulaire..." />;
  }

  if (error) {
    return <ErrorState error={error} onRetry={reload} />;
  }

  return (
    <div className="page-stack">
      <PageSection title="Declaration d'un incident">
        <p className="helper-text">
          Toutes les listes proviennent du backend. Les valeurs techniques attendues par l'API sont conservees.
        </p>
        {successMessage ? <p className="success-banner">{successMessage}</p> : null}
        <IncidentForm
          mode="create"
          values={values}
          errors={errors}
          onChange={handleChange}
          onSubmit={handleSubmit}
          submitting={submitting}
          sites={referenceData.sites}
          incidentTypes={referenceData.incidentTypes}
          technicians={referenceData.technicians}
        />
      </PageSection>
    </div>
  );
}
