export function PageSection({ title, actions, children }) {
  return (
    <section className="panel">
      {(title || actions) && (
        <div className="panel-header">
          {title ? <h2>{title}</h2> : <span />}
          {actions ? <div className="panel-actions">{actions}</div> : null}
        </div>
      )}
      {children}
    </section>
  );
}
