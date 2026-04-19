import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import "./DashboardPage.css";
import Modal from "../components/Modal";

const WIDGETS = ["Calendar", "To-Dos", "Notes", "Bills", "Birthdays"];

export default function Dashboard() {
  const { logout, user, token, isAuthLoading } = useAuth();
  const [showImage, setShowImage] = useState(true);
  const [dashboardData, setDashboardData] = useState(null);
  const [isDashboardLoading, setIsDashboardLoading] = useState(true);
  const [dashboardError, setDashboardError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState("create");
  const [activeWidget, setActiveWidget] = useState(null);
  const [activeItem, setActiveItem] = useState(null);
  const [modalError, setModalError] = useState(null);

  const name = user?.first_name ?? "there";
  const initials = (user?.first_name?.[0] ?? "U").toUpperCase();

  if (isAuthLoading) return <main className="dashboard-page">Loading...</main>;

  //  Dashboard / General
  useEffect(() => {
    setShowImage(true);
  }, [user?.photo_url]);

  useEffect(() => {
    const loadDashboard = async () => {
      if (!token) {
        setIsDashboardLoading(false);
        return;
      }

      try {
        setDashboardError(null);
        setIsDashboardLoading(true);

        const response = await fetch(`${import.meta.env.VITE_API}/dashboard`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Failed to load dashboard.");
        }

        setDashboardData(result);
      } catch (err) {
        setDashboardError(err.message);
      } finally {
        setIsDashboardLoading(false);
      }
    };

    loadDashboard();
  }, [token]);

  //  Widgets / Dashboard Components

  const widgets = dashboardData?.widgets ?? {};
  const todoCount = widgets.todos?.length ?? 0;
  const notesCount = widgets.notes?.length ?? 0;
  const billsCount = widgets.bills?.length ?? 0;
  const birthdaysCount = widgets.birthdays?.length ?? 0;
  const calendarCount = widgets.calendar?.length ?? 0;

  const getWidgetMessage = (name) => {
    switch (name) {
      case "Calendar":
        return calendarCount === 0
          ? "No calendar items yet."
          : `${calendarCount} item(s) loaded.`;

      case "To-Dos":
        return todoCount === 0
          ? "No to-dos yet."
          : `${todoCount} item(s) loaded.`;

      case "Notes":
        return notesCount === 0
          ? "No notes yet."
          : `${notesCount} item(s) loaded.`;

      case "Bills":
        return billsCount === 0
          ? "No bills yet."
          : `${billsCount} item(s) loaded.`;

      case "Birthdays":
        return birthdaysCount === 0
          ? "No birthdays yet."
          : `${birthdaysCount} item(s) loaded.`;

      default:
        return "No items yet.";
    }
  };

  //  Reusable Modal Component

  const openCreateModal = (widgetName) => {
    setModalError(null);
    setModalMode("create");
    setActiveWidget(widgetName);
    setActiveItem(null);
    setIsModalOpen(true);
  };

  const openEditModal = (widgetName, item) => {
    setModalError(null);
    setModalMode("edit");
    setActiveWidget(widgetName);
    setActiveItem(item);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalError(null);
  };

  // Todos

  const todos = widgets.todos ?? [];

  //   const mockTodos = [
  //     {
  //       id: 2,
  //       title: "Get ready for day",
  //       priority: "high",
  //       due_date: "2026-04-18",
  //       completed: true,
  //     },
  //     {
  //       id: 3,
  //       title: "Get starbies",
  //       priority: "high",
  //       due_date: "2026-04-18",
  //       completed: true,
  //     },
  //     {
  //       id: 4,
  //       title: "Get lunch",
  //       priority: "high",
  //       due_date: "2026-04-18",
  //       completed: true,
  //     },
  //     {
  //       id: 5,
  //       title: "Get back to work",
  //       priority: "high",
  //       due_date: "2026-04-18",
  //       completed: true,
  //     },
  //   ];

  const formatDueDate = (dateString) => {
    if (!dateString) return "No due date";
    return new Date(`${dateString}T00:00:00`).toLocaleDateString("en-US", {
      month: "numeric",
      day: "numeric",
      year: "2-digit",
    });
  };

  return (
    <main className="dashboard-page">
      <section className="dashboard-card">
        <header className="dashboard-header">
          <h1 className="dashboard-title">Hello, {name}!</h1>
          <div className="dashboard-avatar-wrap">
            {user?.photo_url && showImage ? (
              <img
                className="dashboard-avatar"
                src={user.photo_url}
                alt={`${user.first_name ?? "User"} profile`}
                onError={() => setShowImage(false)}
              />
            ) : (
              <div
                className="dashboard-avatar-fallback"
                aria-label="Profile fallback"
              >
                {initials}
              </div>
            )}
          </div>
          <div className="dashboard-actions">
            <Link className="dashboard-settings-link" to="/settings">
              Settings
            </Link>
            <Link
              className="dashboard-settings-link"
              onClick={logout}
              to="/login"
            >
              Logout
            </Link>
          </div>
        </header>
        {isDashboardLoading && <p>Loading dashboard data...</p>}
        {dashboardError && (
          <p role="alert" className="dashboard-error">
            {dashboardError}
          </p>
        )}
        <section className="dashboard-grid" aria-label="Dashboard widgets">
          {WIDGETS.map((name) => (
            <article
              key={name}
              className={`dashboard-widget dashboard-widget-${name
                .toLowerCase()
                .replace(/[^a-z]/g, "")}`}
            >
              <div className="dashboard-widget-header">
                <h2 className="dashboard-widget-title">{name}</h2>
                {name === "To-Dos" && (
                  <div className="todo-widget-actions">
                    <button
                      type="button"
                      className="todo-add-btn"
                      onClick={() => openCreateModal("To-Dos")}
                    >
                      +
                    </button>
                    <button
                      type="button"
                      className="todo-edit-btn"
                      onClick={() => openEditModal("To-Dos", todos[0])}
                      disabled={todos.length === 0}
                      aria-label="Edit to-do"
                      title="Edit to-do"
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
                )}
              </div>
              <div className="dashboard-widget-content">
                {name === "To-Dos" ? (
                  todos.length === 0 ? (
                    <p className="dashboard-widget-placeholder">
                      No to-dos yet.
                    </p>
                  ) : (
                    <ul className="todo-list">
                      {todos.map((todo) => (
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
                                  readOnly
                                  aria-label={`Mark ${todo.title} complete`}
                                />
                                <strong className="todo-title">
                                  {todo.title}
                                </strong>
                              </label>
                              <button
                                type="button"
                                className="todo-edit-btn"
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
                            <div className="todo-meta-row">
                              <span
                                className={`todo-priority priority-${todo.priority}`}
                              >
                                {todo.priority}
                              </span>
                              <span className="todo-due">
                                {formatDueDate(todo.due_date)}
                              </span>
                            </div>
                          </div>
                        </li>
                      ))}
                    </ul>
                  )
                ) : (
                  <p className="dashboard-widget-placeholder">
                    {getWidgetMessage(name)}
                  </p>
                )}
              </div>
            </article>
          ))}
        </section>
      </section>
      <Modal
        isOpen={isModalOpen}
        title={modalMode === "edit" ? "Edit Item" : "Create Item"}
        onClose={closeModal}
      >
        <p>
          {modalMode === "edit"
            ? `Editing ${activeWidget ?? "item"}`
            : `Creating new ${activeWidget ?? "item"}`}
        </p>
        <button
          onClick={() =>
            setModalError("Could not save item. Please try again.")
          }
        >
          Submit (Not Yet Working)
        </button>
        {modalError && (
          <p role="alert" className="dashboard-error">
            {modalError}
          </p>
        )}
      </Modal>
    </main>
  );
}
