import { getPriorityLabel } from "../../utils/labels.js";

export function PriorityBadge({ value }) {
  return <span className={`badge badge-priority priority-${value}`}>{getPriorityLabel(value)}</span>;
}
