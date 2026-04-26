import "./BillsWidget.css";

export default function BillsWidget({ bills = [], openCreateModal }) {
  return (
    <article className="dashboard-widget">
      <div className="dashboard-widget-header">
        <h2 className="dashboard-widget-title">Bills</h2>
        <button type="button" onClick={() => openCreateModal?.("Bills")}>
          Add
        </button>
      </div>
      <div className="dashboard-widget-content">
        {bills.length === 0 ? <p>No bills yet.</p> : null}
      </div>
    </article>
  );
}
