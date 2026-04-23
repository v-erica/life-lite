import "./TodosWidget.css";

export default function TodosWidget({
  todoFilter,
  setTodoFilter,
  visibleTodos,
  toggleTodoCompleted,
  openCreateModal,
  openEditModal,
  formatDueDate,
}) {
  return (
    <article className="dashboard-widget dashboard-widget-todos">
      <div className="dashboard-widget-header">
        <h2 className="dashboard-widget-title">To-Dos</h2>
        <div className="todo-widget-actions">
          <div className="todo-filter-group">
            <button
              type="button"
              className={`todo-filter-btn ${todoFilter === "today" ? "is-active" : ""}`}
              onClick={() => setTodoFilter("today")}
            >
              today
            </button>
            <button
              type="button"
              className={`todo-filter-btn ${todoFilter === "week" ? "is-active" : ""}`}
              onClick={() => setTodoFilter("week")}
            >
              week
            </button>
            <button
              type="button"
              className={`todo-filter-btn ${todoFilter === "all" ? "is-active" : ""}`}
              onClick={() => setTodoFilter("all")}
            >
              all
            </button>
            <button
              type="button"
              className={`todo-filter-btn ${todoFilter === "completed" ? "is-active" : ""}`}
              onClick={() => setTodoFilter("completed")}
            >
              completed
            </button>
          </div>
          <button
            type="button"
            className="todo-add-btn"
            onClick={() => openCreateModal("To-Dos")}
          >
            +
          </button>
        </div>
      </div>

      <div className="dashboard-widget-content">
        {visibleTodos.length === 0 ? (
          <p className="dashboard-widget-placeholder">
            {todoFilter === "completed" ? "No completed to-dos yet." : "No to-dos yet."}
          </p>
        ) : (
          <ul className="todo-list">
            {visibleTodos.map((todo) => {
              const hasDescription = Boolean(todo.description?.trim());
              return (
                <li
                  key={todo.id}
                  className={`todo-item ${todo.completed ? "is-complete" : ""}`}
                >
                  <div className="todo-content">
                    <div className="todo-top-row">
                      <label className="todo-main">
                        <input
                          type="checkbox"
                          checked={Boolean(todo.completed)}
                          onChange={() => toggleTodoCompleted(todo)}
                          aria-label={`Mark ${todo.title} complete`}
                        />
                        <strong className="todo-title">{todo.title}</strong>
                      </label>
                      <button
                        type="button"
                        className="todo-edit-btn todo-row-edit-btn"
                        onClick={() => openEditModal("To-Dos", todo)}
                        aria-label={`Edit ${todo.title}`}
                        title={`Edit ${todo.title}`}
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
                    {hasDescription ? (
                      <p className="todo-description">{todo.description.trim()}</p>
                    ) : null}
                    <div className="todo-meta-row">
                      <span className={`todo-priority priority-${todo.priority}`}>
                        {todo.priority}
                      </span>
                      <span className="todo-due">{formatDueDate(todo.due_date)}</span>
                    </div>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </article>
  );
}
