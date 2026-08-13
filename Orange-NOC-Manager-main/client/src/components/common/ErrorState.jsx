export function ErrorState({ error, onRetry }) {
  return (
    <div className="state-card state-error">
      <h3>Erreur API</h3>
      <p>{error?.message || "Une erreur est survenue."}</p>
      {onRetry ? (
        <button type="button" className="button button-primary" onClick={onRetry}>
          Reessayer
        </button>
      ) : null}
    </div>
  );
}
