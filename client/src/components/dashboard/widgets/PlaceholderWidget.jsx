export default function PlaceholderWidget({ name, message }) {
  return (
    <article
      className={`dashboard-widget dashboard-widget-${name
        .toLowerCase()
        .replace(/[^a-z]/g, "")}`}
    >
      <div className="dashboard-widget-header">
        <h2 className="dashboard-widget-title">{name}</h2>
      </div>
      <div className="dashboard-widget-content">
        <p className="dashboard-widget-placeholder">{message}</p>
      </div>
    </article>
  );
}
