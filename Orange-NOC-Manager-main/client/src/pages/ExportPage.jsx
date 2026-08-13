import { useState } from "react";
import { exportApi } from "../api/index.js";
import { PageSection } from "../components/common/PageSection.jsx";

export function ExportPage() {
  const [status, setStatus] = useState({ loading: false, message: "", error: "" });

  async function handleDownload() {
    setStatus({ loading: true, message: "", error: "" });

    try {
      await exportApi.download();
      setStatus({ loading: false, message: "Le fichier XML a ete telecharge.", error: "" });
    } catch (error) {
      setStatus({ loading: false, message: "", error: error.message });
    }
  }

  return (
    <div className="page-stack">
      <PageSection title="Export XML des incidents">
        <p className="helper-text">
          Cet export recupere les incidents, leur type, leur site, leur technicien et les interventions associees
          depuis la route backend existante.
        </p>
        <button type="button" className="button button-primary" onClick={handleDownload} disabled={status.loading}>
          {status.loading ? "Telechargement..." : "Telecharger les incidents en XML"}
        </button>
        {status.message ? <p className="success-banner">{status.message}</p> : null}
        {status.error ? <p className="form-error">{status.error}</p> : null}
      </PageSection>
    </div>
  );
}
