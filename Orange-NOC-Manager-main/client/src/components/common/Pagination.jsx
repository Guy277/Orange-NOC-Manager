export function Pagination({ page, limit, total, onPageChange }) {
  const totalPages = Math.max(1, Math.ceil((total || 0) / limit));

  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="pagination">
      <button type="button" className="button button-secondary" disabled={page <= 1} onClick={() => onPageChange(page - 1)}>
        Precedent
      </button>
      <span>
        Page {page} sur {totalPages}
      </span>
      <button
        type="button"
        className="button button-secondary"
        disabled={page >= totalPages}
        onClick={() => onPageChange(page + 1)}
      >
        Suivant
      </button>
    </div>
  );
}
