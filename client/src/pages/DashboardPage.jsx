import { useState, useEffect, useMemo, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import "./DashboardPage.css";
import Modal from "../components/Modal";
import Calendar from "react-calendar";
import "react-calendar/dist/Calendar.css";

const WIDGETS = ["Calendar", "To-Dos", "Bills", "Events", "Notes", "Birthdays"];

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
  const emptyTodoForm = {
    title: "",
    description: "",
    due_date: "",
    priority: "low",
    completed: false,
  };
  const [todoForm, setTodoForm] = useState(emptyTodoForm);
  const [todoFormError, setTodoFormError] = useState(null);
  const [isTodoSubmitting, setIsTodoSubmitting] = useState(false);
  const [recentlyCompleted, setRecentlyCompleted] = useState({});
  const recentlyCompletedTimersRef = useRef({});

  const [calendarDate, setCalendarDate] = useState(new Date());

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
  const eventsCount = widgets.events?.length ?? 0;
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

      case "Events":
        return eventsCount === 0
          ? "No events yet."
          : `${eventsCount} item(s) loaded.`;

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
    setTodoForm(emptyTodoForm);
    setTodoFormError(null);
  };

  const openEditModal = (widgetName, item) => {
    setModalError(null);
    setModalMode("edit");
    setActiveWidget(widgetName);
    setActiveItem(item);
    setIsModalOpen(true);
    setTodoForm({
      title: item.title ?? "",
      description: item.description ?? "",
      due_date: item.due_date ? item.due_date.slice(0, 10) : "",
      priority: item.priority ?? "low",
      completed: Boolean(item.completed),
    });
    setTodoFormError(null);
  };

  const handleTodoFieldChange = (e) => {
    const { name, value, type, checked } = e.target;
    setTodoForm((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const validateTodoForm = () => {
    if (!todoForm.title.trim()) return "Title is required.";
    return null;
  };

  const submitTodoForm = async (e) => {
    e.preventDefault();
    const validateError = validateTodoForm();
    if (validateError) return setTodoFormError(validateError);

    setIsTodoSubmitting(true);
    setTodoFormError(null);

    const payload = {
      title: todoForm.title.trim(),
      description: todoForm.description.trim() || null,
      priority: todoForm.priority,
      completed: Boolean(todoForm.completed),
    };

    const isEdit = modalMode === "edit" && activeItem?.id;
    payload.due_date = todoForm.due_date || null;

    const url = isEdit
      ? `${import.meta.env.VITE_API}/todos/${activeItem.id}`
      : `${import.meta.env.VITE_API}/todos`;
    const method = isEdit ? "PATCH" : "POST";

    try {
      const response = await fetch(url, {
        method,
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(payload),
      });
      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error || "Failed to save to-do.");

      setTodoItems((prev) =>
        isEdit
          ? prev.map((t) => (t.id === result.id ? result : t))
          : [result, ...prev],
      );
      closeModal();
    } catch (err) {
      setTodoFormError(err.message);
    } finally {
      setIsTodoSubmitting(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setModalError(null);
  };

  // Todos
  const [todoFilter, setTodoFilter] = useState("today");
  const [todoItems, setTodoItems] = useState([]);
  const todos = todoItems;

  useEffect(() => {
    const loadTodos = async () => {
      if (!token) return;

      try {
        const response = await fetch(`${import.meta.env.VITE_API}/todos`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Failed to load to-dos.");
        }

        setTodoItems(result);
      } catch (err) {
        setDashboardError(err.message);
      }
    };

    loadTodos();
  }, [token]);

  useEffect(() => {
    return () => {
      Object.values(recentlyCompletedTimersRef.current).forEach((timerId) => {
        clearTimeout(timerId);
      });
      recentlyCompletedTimersRef.current = {};
    };
  }, []);

  const priorityRank = { high: 0, medium: 1, low: 2 };

  const parseDateValue = (value) => {
    if (!value) return null;
    const d = new Date(value);
    return Number.isNaN(d.getTime()) ? null : d;
  };

  const startOfDay = (date) =>
    new Date(date.getFullYear(), date.getMonth(), date.getDate());

  const isToday = (dateString) => {
    const d = parseDateValue(dateString);
    if (!d) return false;
    const today = startOfDay(new Date());
    return startOfDay(d).getTime() === today.getTime();
  };

  const isWithinWeek = (dateString) => {
    const d = parseDateValue(dateString);
    if (!d) return false;
    const today = startOfDay(new Date());
    const end = startOfDay(new Date());
    end.setDate(today.getDate() + 7);
    const day = startOfDay(d);
    return day >= today && day <= end;
  };

  const visibleTodos = todos
    .filter((t) => {
      if (todoFilter === "completed") return Boolean(t.completed);
      return !t.completed || recentlyCompleted[t.id];
    })
    .filter((t) => {
      if (todoFilter === "today") return isToday(t.due_date);
      if (todoFilter === "week") return isWithinWeek(t.due_date);
      if (todoFilter === "completed") return true;
      return true;
    })
    .sort((a, b) => {
      const p =
        (priorityRank[a.priority] ?? 99) - (priorityRank[b.priority] ?? 99);
      if (p !== 0) return p;

      if (!a.due_date && !b.due_date) return 0;
      if (!a.due_date) return 1;
      if (!b.due_date) return -1;
      return new Date(a.due_date) - new Date(b.due_date);
    });

  const toggleTodoCompleted = async (todo) => {
    const isMarkingComplete = !todo.completed;

    const existingTimer = recentlyCompletedTimersRef.current[todo.id];
    if (existingTimer) {
      clearTimeout(existingTimer);
      delete recentlyCompletedTimersRef.current[todo.id];
    }

    if (isMarkingComplete) {
      setRecentlyCompleted((prev) => ({ ...prev, [todo.id]: true }));

      const timerId = setTimeout(() => {
        setRecentlyCompleted((prev) => {
          const next = { ...prev };
          delete next[todo.id];
          return next;
        });
        delete recentlyCompletedTimersRef.current[todo.id];
      }, 2000);

      recentlyCompletedTimersRef.current[todo.id] = timerId;
    } else {
      setRecentlyCompleted((prev) => {
        if (!prev[todo.id]) return prev;
        const next = { ...prev };
        delete next[todo.id];
        return next;
      });
    }
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API}/todos/${todo.id}`,
        {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ completed: !todo.completed }),
        },
      );

      const result = await response.json();
      if (!response.ok)
        throw new Error(result.error || "Failed to update to-do.");

      setTodoItems((prev) => prev.map((t) => (t.id === todo.id ? result : t)));
    } catch (err) {
      setDashboardError(err.message);
    }
  };

  const formatDueDate = (dateString) => {
    const due = parseDateValue(dateString);
    if (!due) return "";
    return due.toLocaleDateString("en-US", {
      month: "numeric",
      day: "numeric",
      year: "2-digit",
    });
  };

  const toDateKey = (value) => {
    const d = parseDateValue(value);
    if (!d) return null;
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, "0");
    const day = String(d.getDate()).padStart(2, "0");
    return `${y}-${m}-${day}`;
  };

  const calendarIndicatorsByDate = useMemo(() => {
    const map = {};

    const add = (dateValue, type) => {
      const key = toDateKey(dateValue);
      if (!key) return;
      if (!map[key]) map[key] = [];
      map[key].push(type);
    };

    todoItems.forEach((t) => add(t.due_date, "todo"));
    (widgets.bills ?? []).forEach((b) =>
      add(b.due_date ?? b.next_due_date, "bill"),
    );
    (widgets.events ?? []).forEach((e) => add(e.event_date ?? e.date, "event"));
    (widgets.birthdays ?? []).forEach((b) =>
      add(b.birthday ?? b.birth_date, "birthday"),
    );

    return map;
  }, [todoItems, widgets.bills, widgets.events, widgets.birthdays]);

  const renderCalendarTileContent = ({ date, view }) => {
    if (view !== "month") return null;

    const key = toDateKey(date);
    const indicators = calendarIndicatorsByDate[key] ?? [];
    if (indicators.length === 0) return null;

    const visible = indicators.slice(0, 3);
    const overflow = indicators.length - visible.length;

    return (
      <div className="calendar-tile-indicators" aria-hidden="true">
        {visible.map((type, idx) => (
          <span
            key={`${type}-${idx}`}
            className={`calendar-tile-dot calendar-tile-dot-${type}`}
          />
        ))}
        {overflow > 0 ? (
          <span className="calendar-tile-overflow">...</span>
        ) : null}
      </div>
    );
  };

  return (
    <main className="dashboard-page">
      <section className="dashboard-card">
        <header className="dashboard-header">
          <h1 className="dashboard-title">hello, {name}!</h1>
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
              settings
            </Link>
            <Link
              className="dashboard-settings-link"
              onClick={logout}
              to="/login"
            >
              logout
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
                )}
              </div>
              <div className="dashboard-widget-content">
                {name === "Calendar" ? (
                  <Calendar
                    onChange={setCalendarDate}
                    value={calendarDate}
                    tileContent={renderCalendarTileContent}
                  />
                ) : name === "To-Dos" ? (
                  visibleTodos.length === 0 ? (
                    <p className="dashboard-widget-placeholder">
                      {todoFilter === "completed"
                        ? "No completed to-dos yet."
                        : "No to-dos yet."}
                    </p>
                  ) : (
                    <ul className="todo-list">
                      {visibleTodos.map((todo) => {
                        const hasDescription = Boolean(
                          todo.description?.trim(),
                        );
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
                                  <strong className="todo-title">
                                    {todo.title}
                                  </strong>
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
                                <p className="todo-description">
                                  {todo.description.trim()}
                                </p>
                              ) : null}
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
                        );
                      })}
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
        {activeWidget === "To-Dos" ? (
          <form className="todo-modal-form" onSubmit={submitTodoForm}>
            <div className="todo-modal-field">
              <label htmlFor="todo-title">Title</label>
              <input
                id="todo-title"
                name="title"
                value={todoForm.title}
                onChange={handleTodoFieldChange}
              />
            </div>

            <div className="todo-modal-field">
              <label htmlFor="todo-description">Description</label>
              <textarea
                id="todo-description"
                name="description"
                value={todoForm.description}
                onChange={handleTodoFieldChange}
              />
            </div>

            <div className="todo-modal-row">
              <div className="todo-modal-field">
                <label htmlFor="todo-due-date">Due Date</label>
                <input
                  id="todo-due-date"
                  type="date"
                  name="due_date"
                  value={todoForm.due_date}
                  onChange={handleTodoFieldChange}
                />
              </div>

              <div className="todo-modal-field">
                <label htmlFor="todo-priority">Priority</label>
                <select
                  id="todo-priority"
                  name="priority"
                  value={todoForm.priority}
                  onChange={handleTodoFieldChange}
                >
                  <option value="low">low</option>
                  <option value="medium">medium</option>
                  <option value="high">high</option>
                </select>
              </div>
            </div>

            <label className="todo-modal-checkbox">
              <input
                type="checkbox"
                name="completed"
                checked={todoForm.completed}
                onChange={handleTodoFieldChange}
              />
              completed
            </label>

            <button
              className="todo-modal-submit-btn"
              type="submit"
              disabled={isTodoSubmitting}
            >
              {isTodoSubmitting
                ? "saving..."
                : modalMode === "edit"
                  ? "save changes"
                  : "create to-do"}
            </button>

            {todoFormError && (
              <p role="alert" className="dashboard-error">
                {todoFormError}
              </p>
            )}
          </form>
        ) : (
          <p>Modal form not implemented for this widget yet.</p>
        )}
      </Modal>
    </main>
  );
}
