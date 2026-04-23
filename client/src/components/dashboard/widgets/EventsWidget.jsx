import "./EventsWidget.css";

export default function EventsWidget({
  events,
  openCreateModal,
  openEditModal,
  formatEventDate,
  formatEventTime,
}) {
  return (
    <article className="dashboard-widget dashboard-widget-events">
      <div className="dashboard-widget-header">
        <h2 className="dashboard-widget-title">Events</h2>
        <button
          type="button"
          className="todo-add-btn"
          onClick={() => openCreateModal("Events")}
        >
          +
        </button>
      </div>

      <div className="dashboard-widget-content">
        {events.length === 0 ? (
          <p className="dashboard-widget-placeholder">No events yet.</p>
        ) : (
          <ul className="event-list">
            {events.map((event) => (
              <li key={event.id} className="event-item">
                <div className="event-content">
                  <div className="event-top-row">
                    <strong className="event-title">{event.title}</strong>
                    <button
                      type="button"
                      className="todo-edit-btn todo-row-edit-btn"
                      onClick={() => openEditModal("Events", event)}
                      aria-label={`Edit ${event.title}`}
                      title={`Edit ${event.title}`}
                    >
                      <svg
                        className="todo-edit-icon"
                        viewBox="0 0 24 24"
                        aria-hidden="true"
                      >
                        <path
                          d="M16.862 3.487a2.25 2.25 0 1 1 3.182 3.182L9.75 16.963 6 18l1.037-3.75 9.825-9.825Z"
                          fill="currentColor"
                        />
                        <path
                          d="M19.5 13.5v5.25A2.25 2.25 0 0 1 17.25 21H5.25A2.25 2.25 0 0 1 3 18.75V6.75A2.25 2.25 0 0 1 5.25 4.5H10.5"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="1.5"
                          strokeLinecap="round"
                        />
                      </svg>
                    </button>
                  </div>
                  {event.description?.trim() ? (
                    <p className="event-description">{event.description.trim()}</p>
                  ) : null}
                  <div className="event-meta-row">
                    <span className="event-date">{formatEventDate(event.event_date)}</span>
                    {event.start_time ? (
                      <span className="event-time">
                        {formatEventTime(event.start_time)}
                        {event.end_time ? ` - ${formatEventTime(event.end_time)}` : ""}
                      </span>
                    ) : null}
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </article>
  );
}
