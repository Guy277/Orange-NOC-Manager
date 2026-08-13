import { getStatusLabel } from "../../utils/labels.js";

export function StatusBadge({ value }) {
  return <span className={`badge badge-status status-${value}`}>{getStatusLabel(value)}</span>;
}
