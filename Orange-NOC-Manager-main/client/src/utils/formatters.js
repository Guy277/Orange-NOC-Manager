const dateTimeFormatter = new Intl.DateTimeFormat("fr-FR", {
  dateStyle: "medium",
  timeStyle: "short"
});

const dateFormatter = new Intl.DateTimeFormat("fr-FR", {
  dateStyle: "medium"
});

export function formatDateTime(value) {
  if (!value) {
    return "Non renseigne";
  }

  return dateTimeFormatter.format(new Date(value));
}

export function formatDate(value) {
  if (!value) {
    return "Non renseigne";
  }

  return dateFormatter.format(new Date(value));
}

export function formatMinutes(value) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) {
    return "Non calcule";
  }

  const minutes = Number(value);
  if (minutes < 60) {
    return `${minutes.toFixed(0)} min`;
  }

  const hours = Math.floor(minutes / 60);
  const remaining = Math.round(minutes % 60);
  return `${hours} h ${remaining.toString().padStart(2, "0")}`;
}

export function truncateText(value, maxLength = 120) {
  if (!value) {
    return "";
  }

  return value.length > maxLength ? `${value.slice(0, maxLength)}...` : value;
}
