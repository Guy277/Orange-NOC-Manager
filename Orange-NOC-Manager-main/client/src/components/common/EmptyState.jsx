export function EmptyState({ title = "Aucune donnee", message = "Aucun element a afficher." }) {
  return (
    <div className="state-card">
      <h3>{title}</h3>
      <p>{message}</p>
    </div>
  );
}
