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

  const name = user?.first_name ?? "there";
  const initials = (user?.first_name?.[0] ?? "U").toUpperCase();

  if (isAuthLoading) return <main className="dashboard-page">Loading...</main>;

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
            <button
              className="dashboard-open-modal"
              onClick={() => setIsModalOpen(true)}
            >
              Open Create Modal
            </button>

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
            <article key={name} className="dashboard-widget">
              <h2 className="dashboard-widget-title">{name}</h2>
              <p className="dashboard-widget-placeholder">
                {getWidgetMessage(name)}
              </p>
            </article>
          ))}
        </section>
      </section>
      <Modal
        isOpen={isModalOpen}
        title="Create Item"
        onClose={() => setIsModalOpen(false)}
      >
        <p>Reusable modal shell for create/edit flows.</p>
      </Modal>
    </main>
  );
}
