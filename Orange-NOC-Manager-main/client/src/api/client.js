import { API_BASE } from "./config";

export class ApiError extends Error {
  constructor(message, status, details = null) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.details = details;
  }
}

function buildUrl(path, query = {}) {
  const url = new URL(`${API_BASE}${path}`, window.location.origin);

  for (const [key, value] of Object.entries(query)) {
    if (value !== undefined && value !== null && value !== "") {
      url.searchParams.set(key, String(value));
    }
  }

  return url.toString();
}

async function parseResponse(response) {
  const contentType = response.headers.get("content-type") || "";

  if (!response.ok) {
    if (contentType.includes("application/json")) {
      const payload = await response.json();
      throw new ApiError(payload.message || "Erreur API.", response.status, payload.details || null);
    }

    throw new ApiError("Erreur de communication avec l'API.", response.status);
  }

  if (contentType.includes("application/json")) {
    return response.json();
  }

  if (contentType.includes("application/xml") || contentType.includes("text/xml")) {
    return response.text();
  }

  if (response.status === 204) {
    return null;
  }

  throw new ApiError("Reponse API non valide.", response.status);
}

async function request(path, options = {}, query) {
  let response;

  try {
    response = await fetch(buildUrl(path, query), {
      headers: {
        Accept: "application/json",
        ...(options.body ? { "Content-Type": "application/json" } : {}),
        ...options.headers
      },
      ...options
    });
  } catch (error) {
    throw new ApiError("API indisponible. Verifiez que le service fonctionne.", 0, error.message);
  }

  return parseResponse(response);
}

export const apiClient = {
  get: (path, query) => request(path, { method: "GET" }, query),
  post: (path, body) => request(path, { method: "POST", body: JSON.stringify(body) }),
  put: (path, body) => request(path, { method: "PUT", body: JSON.stringify(body) }),
  patch: (path, body) => request(path, { method: "PATCH", body: JSON.stringify(body) }),
  delete: (path) => request(path, { method: "DELETE" }),
  async downloadXml(path) {
    const response = await fetch(buildUrl(path), {
      method: "GET",
      headers: {
        Accept: "application/xml"
      }
    });

    if (!response.ok) {
      const text = await response.text();
      throw new ApiError(text || "Echec du telechargement XML.", response.status);
    }

    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);
    const anchor = document.createElement("a");
    anchor.href = url;
    anchor.download = `orange-noc-incidents-${new Date().toISOString().slice(0, 10)}.xml`;
    document.body.appendChild(anchor);
    anchor.click();
    anchor.remove();
    window.URL.revokeObjectURL(url);
  }
};
