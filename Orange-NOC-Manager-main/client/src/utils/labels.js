export const statusOptions = [
  { value: "reported", label: "Declare" },
  { value: "qualified", label: "Qualifie" },
  { value: "assigned", label: "Affecte" },
  { value: "in_progress", label: "En cours" },
  { value: "resolved", label: "Resolue" },
  { value: "closed", label: "Cloturee" },
  { value: "cancelled", label: "Annulee" }
];

export const priorityOptions = [
  { value: "low", label: "Faible" },
  { value: "medium", label: "Moyenne" },
  { value: "high", label: "Haute" },
  { value: "critical", label: "Critique" }
];

export const specialtyOptions = [
  { value: "radio", label: "Radio" },
  { value: "fiber", label: "Fibre" },
  { value: "core", label: "Coeur de reseau" },
  { value: "fixed_internet", label: "Internet fixe" },
  { value: "power", label: "Energie" }
];

export const siteTypeOptions = [
  { value: "radio", label: "Site radio" },
  { value: "fiber_hub", label: "Hub fibre" },
  { value: "datacenter", label: "Datacenter" },
  { value: "pop", label: "POP" },
  { value: "switching_center", label: "Centre de commutation" }
];

export function getStatusLabel(value) {
  return statusOptions.find((item) => item.value === value)?.label || value;
}

export function getPriorityLabel(value) {
  return priorityOptions.find((item) => item.value === value)?.label || value;
}

export function getSpecialtyLabel(value) {
  return specialtyOptions.find((item) => item.value === value)?.label || value;
}

export function getSiteTypeLabel(value) {
  return siteTypeOptions.find((item) => item.value === value)?.label || value;
}
