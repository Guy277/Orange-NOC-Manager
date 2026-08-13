import { apiClient } from "./client.js";

export const incidentApi = {
  list: (params) => apiClient.get("/incidents", params),
  get: (id) => apiClient.get(`/incidents/${id}`),
  create: (payload) => apiClient.post("/incidents", payload),
  update: (id, payload) => apiClient.put(`/incidents/${id}`, payload),
  remove: (id) => apiClient.delete(`/incidents/${id}`),
  changeStatus: (id, payload) => apiClient.patch(`/incidents/${id}/status`, payload),
  assign: (id, payload) => apiClient.patch(`/incidents/${id}/assignment`, payload),
  listInterventions: (id) => apiClient.get(`/incidents/${id}/interventions`),
  createIntervention: (id, payload) => apiClient.post(`/incidents/${id}/interventions`, payload),
  listLogs: (id) => apiClient.get(`/incidents/${id}/logs`)
};

export const interventionApi = {
  update: (id, payload) => apiClient.put(`/interventions/${id}`, payload),
  remove: (id) => apiClient.delete(`/interventions/${id}`)
};

export const technicianApi = {
  list: (params) => apiClient.get("/technicians", params),
  get: (id) => apiClient.get(`/technicians/${id}`),
  create: (payload) => apiClient.post("/technicians", payload),
  update: (id, payload) => apiClient.put(`/technicians/${id}`, payload),
  remove: (id) => apiClient.delete(`/technicians/${id}`)
};

export const siteApi = {
  list: (params) => apiClient.get("/sites", params),
  get: (id) => apiClient.get(`/sites/${id}`),
  create: (payload) => apiClient.post("/sites", payload),
  update: (id, payload) => apiClient.put(`/sites/${id}`, payload),
  remove: (id) => apiClient.delete(`/sites/${id}`)
};

export const incidentTypeApi = {
  list: (params) => apiClient.get("/incident-types", params),
  get: (id) => apiClient.get(`/incident-types/${id}`),
  create: (payload) => apiClient.post("/incident-types", payload),
  update: (id, payload) => apiClient.put(`/incident-types/${id}`, payload),
  remove: (id) => apiClient.delete(`/incident-types/${id}`)
};

export const logApi = {
  list: (params) => apiClient.get("/logs", params)
};

export const dashboardApi = {
  summary: (params) => apiClient.get("/dashboard/summary", params),
  incidentsByType: (params) => apiClient.get("/dashboard/incidents-by-type", params),
  incidentsByStatus: (params) => apiClient.get("/dashboard/incidents-by-status", params),
  recentIncidents: (params) => apiClient.get("/dashboard/recent-incidents", params),
  technicianPerformance: (params) => apiClient.get("/dashboard/technician-performance", params)
};

export const healthApi = {
  get: () => apiClient.get("/health")
};

export const exportApi = {
  download: () => apiClient.downloadXml("/exports/incidents.xml")
};
