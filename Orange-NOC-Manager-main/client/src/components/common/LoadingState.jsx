export function LoadingState({ label = "Chargement des donnees..." }) {
  return (
    <div className="state-card">
      <div className="spinner" aria-hidden="true" />
      <p>{label}</p>
    </div>
  );
}
