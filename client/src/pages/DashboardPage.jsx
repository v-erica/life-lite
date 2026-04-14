import { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import "./DashboardPage.css";

const WIDGETS = ["Calendar", "To-Dos", "Notes", "Bills", "Birthdays"];

export default function Dashboard() {
  const { logout, user, isAuthLoading } = useAuth();

  if (isAuthLoading) return <main className="dashboard-page">Loading...</main>;

  const name = user?.first_name ?? "there";

  const initials = (user?.first_name?.[0] ?? "U").toUpperCase();
  const [showImage, setShowImage] = useState(true);

  useEffect(() => {
    setShowImage(true);
  }, [user?.photo_url]);

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
        <section className="dashboard-grid" aria-label="Dashboard widgets">
          {WIDGETS.map((name) => (
            <article key={name} className="dashboard-widget">
              <h2 className="dashboard-widget-title">{name}</h2>
              <p className="dashboard-widget-placeholder">
                Placeholder for {name} widget.
              </p>
            </article>
          ))}
        </section>
      </section>
    </main>
  );
}
