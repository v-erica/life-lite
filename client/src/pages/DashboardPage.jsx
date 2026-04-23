import { useState, useEffect, useRef } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import "./DashboardPage.css";
import Modal from "../components/Modal";
import CalendarWidget from "../components/dashboard/widgets/CalendarWidget";
import TodosWidget from "../components/dashboard/widgets/TodosWidget";
import EventsWidget from "../components/dashboard/widgets/EventsWidget";
import PlaceholderWidget from "../components/dashboard/widgets/PlaceholderWidget";

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
  const emptyTodoForm = {
    title: "",
    description: "",
    due_date: "",
    priority: "low",
    completed: false,
  };
  const emptyEventForm = {
    title: "",
    description: "",
    event_date: "",
    start_time: "",
    end_time: "",
  };
  const [eventForm, setEventForm] = useState(emptyEventForm);
  const [eventFormError, setEventFormError] = useState(null);
  const [isEventSubmitting, setIsEventSubmitting] = useState(false);
  const [todoForm, setTodoForm] = useState(emptyTodoForm);
  const [todoFormError, setTodoFormError] = useState(null);
  const [isTodoSubmitting, setIsTodoSubmitting] = useState(false);
  const [recentlyCompleted, setRecentlyCompleted] = useState({});
  const recentlyCompletedTimersRef = useRef({});
  const [eventItems, setEventItems] = useState([]);

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
  const notesCount = widgets.notes?.length ?? 0;
  const billsCount = widgets.bills?.length ?? 0;
  const birthdaysCount = widgets.birthdays?.length ?? 0;

  const getWidgetMessage = (name) => {
    switch (name) {
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

  const toTimeInputValue = (value) => {
    if (!value) return "";
    const d = new Date(value);
    if (Number.isNaN(d.getTime())) return "";

    const pad = (n) => String(n).padStart(2, "0");

    return `${pad(d.getHours())}:${pad(d.getMinutes())}`;
  };

  const openCreateModal = (widgetName) => {
    setModalMode("create");
    setActiveWidget(widgetName);
    setActiveItem(null);
    setIsModalOpen(true);
    setTodoForm(emptyTodoForm);
    setTodoFormError(null);
    setEventForm(emptyEventForm);
    setEventFormError(null);
  };

  const openEditModal = (widgetName, item) => {
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
    setEventForm({
      title: item.title ?? "",
      description: item.description ?? "",
      event_date: item.event_date ? item.event_date.slice(0, 10) : "",
      start_time: toTimeInputValue(item.start_time),
      end_time: toTimeInputValue(item.end_time),
    });
    setEventFormError(null);
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

  const handleEventFieldChange = (e) => {
    const { name, value } = e.target;
    setEventForm((prev) => ({ ...prev, [name]: value }));
  };

  const combineEventDateTime = (dateValue, timeValue) => {
    if (!dateValue || !timeValue) return null;
    const combined = `${dateValue}T${timeValue}`;
    const d = new Date(combined);
    if (Number.isNaN(d.getTime())) return null;
    return d.toISOString();
  };

  const validateEventForm = () => {
    if (!eventForm.title.trim()) return "Title is required.";
    if (!eventForm.event_date.trim()) return "Event date is required.";

    const startDateTime = combineEventDateTime(
      eventForm.event_date,
      eventForm.start_time,
    );
    const endDateTime = combineEventDateTime(eventForm.event_date, eventForm.end_time);

    if (eventForm.start_time && !startDateTime) {
      return "Start time is invalid.";
    }

    if (eventForm.end_time && !endDateTime) {
      return "End time is invalid.";
    }

    if (startDateTime && endDateTime) {
      if (new Date(endDateTime) <= new Date(startDateTime)) {
        return "End time must be after start time.";
      }
    }
    return null;
  };

  const submitEventForm = async (e) => {
    e.preventDefault();

    const validationError = validateEventForm();
    if (validationError) return setEventFormError(validationError);

    setIsEventSubmitting(true);
    setEventFormError(null);

    const payload = {
      title: eventForm.title.trim(),
      description: eventForm.description.trim() || null,
      event_date: eventForm.event_date,
      start_time: combineEventDateTime(eventForm.event_date, eventForm.start_time),
      end_time: combineEventDateTime(eventForm.event_date, eventForm.end_time),
    };

    const isEdit = modalMode === "edit" && activeItem?.id;
    const url = isEdit
      ? `${import.meta.env.VITE_API}/events/${activeItem.id}`
      : `${import.meta.env.VITE_API}/events`;
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
        throw new Error(result.error || "Failed to save event.");

      setEventItems((prev) =>
        isEdit
          ? prev.map((ev) => (ev.id === result.id ? result : ev))
          : [result, ...prev],
      );

      closeModal();
    } catch (err) {
      setEventFormError(err.message);
    } finally {
      setIsEventSubmitting(false);
    }
  };

  const closeModal = () => {
    setIsModalOpen(false);
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

  const formatEventDate = (dateString) => {
    const d = parseDateValue(dateString);
    if (!d) return "";
    return d.toLocaleDateString("en-US", {
      month: "numeric",
      day: "numeric",
      year: "2-digit",
    });
  };

  const formatEventTime = (isoString) => {
    if (!isoString) return "";
    const d = parseDateValue(isoString);
    if (!d) return "";
    return d.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
    });
  };

  // EVENTS WIDGET //

  useEffect(() => {
    const loadEvents = async () => {
      if (!token) return;

      try {
        const response = await fetch(`${import.meta.env.VITE_API}/events`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        const result = await response.json();

        if (!response.ok) {
          throw new Error(result.error || "Failed to load events.");
        }

        setEventItems(result);
      } catch (err) {
        setDashboardError(err.message);
      }
    };

    loadEvents();
  }, [token]);

  const events = eventItems;

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
          {WIDGETS.map((name) => {
            if (name === "To-Dos") {
              return (
                <TodosWidget
                  key={name}
                  todoFilter={todoFilter}
                  setTodoFilter={setTodoFilter}
                  visibleTodos={visibleTodos}
                  toggleTodoCompleted={toggleTodoCompleted}
                  openCreateModal={openCreateModal}
                  openEditModal={openEditModal}
                  formatDueDate={formatDueDate}
                />
              );
            }

            if (name === "Events") {
              return (
                <EventsWidget
                  key={name}
                  events={events}
                  openCreateModal={openCreateModal}
                  openEditModal={openEditModal}
                  formatEventDate={formatEventDate}
                  formatEventTime={formatEventTime}
                />
              );
            }

            if (name === "Calendar") {
              return (
                <article
                  key={name}
                  className="dashboard-widget dashboard-widget-calendar"
                >
                  <div className="dashboard-widget-header">
                    <h2 className="dashboard-widget-title">Calendar</h2>
                  </div>
                  <div className="dashboard-widget-content">
                    <CalendarWidget
                      todoItems={todoItems}
                      eventItems={eventItems}
                      dashboardEvents={widgets.events}
                      bills={widgets.bills}
                      birthdays={widgets.birthdays}
                    />
                  </div>
                </article>
              );
            }

            return (
              <PlaceholderWidget
                key={name}
                name={name}
                message={getWidgetMessage(name)}
              />
            );
          })}
        </section>
      </section>
      <Modal
        isOpen={isModalOpen}
        title={modalMode === "edit" ? "Edit Item" : "Create Item"}
        onClose={closeModal}
      >
        {activeWidget === "Events" ? (
          <form className="event-modal-form" onSubmit={submitEventForm}>
            <div className="todo-modal-field">
              <label htmlFor="event-title">Title</label>
              <input
                id="event-title"
                name="title"
                value={eventForm.title}
                onChange={handleEventFieldChange}
              />
            </div>

            <div className="todo-modal-field">
              <label htmlFor="event-description">Description</label>
              <textarea
                id="event-description"
                name="description"
                value={eventForm.description}
                onChange={handleEventFieldChange}
              />
            </div>

            <div className="todo-modal-row">
              <div className="todo-modal-field">
                <label htmlFor="event-date">Event Date</label>
                <input
                  type="date"
                  id="event-date"
                  name="event_date"
                  value={eventForm.event_date}
                  onChange={handleEventFieldChange}
                />
              </div>
              <div className="todo-modal-field">
                <label htmlFor="event-start">Start Time</label>
                <input
                  type="time"
                  id="event-start"
                  name="start_time"
                  value={eventForm.start_time}
                  onChange={handleEventFieldChange}
                />
              </div>
            </div>

            <div className="todo-modal-field">
              <label htmlFor="event-end">End Time</label>
              <input
                type="time"
                id="event-end"
                name="end_time"
                value={eventForm.end_time}
                onChange={handleEventFieldChange}
              />
            </div>

            <button
              className="todo-modal-submit-btn"
              type="submit"
              disabled={isEventSubmitting}
            >
              {isEventSubmitting
                ? "Saving..."
                : modalMode === "edit"
                  ? "Save changes"
                  : "Create event"}
            </button>

            {eventFormError && (
              <p role="alert" className="dashboard-error">
                {eventFormError}
              </p>
            )}
          </form>
        ) : activeWidget === "To-Dos" ? (
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
