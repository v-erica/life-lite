import { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import "./SettingsPage.css";

export default function SettingsPage() {
  const { user, updateProfile } = useAuth();

  const [form, setForm] = useState({
    photo_url: "",
    username: "",
    first_name: "",
    email: "",
    password: "",
    birthday: "",
  });

  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (!user) return;
    setForm({
      photo_url: user.photo_url ?? "",
      username: user.username ?? "",
      first_name: user.first_name ?? "",
      email: user.email ?? "",
      password: "",
      birthday: user.birthday ? user.birthday.slice(0, 10) : "",
    });
  }, [user]);

  const onChange = (e) => {
    const { name, value } = e.target;
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSuccess(null);
    setIsSaving(true);

    try {
      const payload = {
        photo_url: form.photo_url,
        username: form.username,
        first_name: form.first_name,
        email: form.email,
        birthday: form.birthday,
      };

      if (form.password.trim()) {
        payload.password = form.password.trim();
      }

      await updateProfile(payload);
      setForm((prev) => ({ ...prev, password: "" }));
      setSuccess("Profile updated.");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsSaving(false);
    }
  };

  const initials = (user?.first_name?.[0] ?? "U").toUpperCase();
  const [showImage, setShowImage] = useState(true);

  useEffect(() => {
    setShowImage(true);
  }, [user?.photo_url]);

  return (
    <main className="settings-page">
      <div className="settings-card">
        <h1 className="settings-title">Settings</h1>
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
        <form className="settings-form" onSubmit={onSubmit}>
          <label className="settings-field">
            Profile Photo URL
            <input
              name="photo_url"
              value={form.photo_url}
              onChange={onChange}
            />
          </label>

          <label className="settings-field">
            Username
            <input name="username" value={form.username} onChange={onChange} />
          </label>

          <label className="settings-field">
            First Name
            <input
              name="first_name"
              value={form.first_name}
              onChange={onChange}
              required
            />
          </label>

          <label className="settings-field">
            Email
            <input
              name="email"
              value={form.email}
              onChange={onChange}
              required
            />
          </label>

          <label className="settings-field">
            New Password
            <input
              name="password"
              value={form.password}
              onChange={onChange}
              placeholder="Leave blank to keep current password."
            />
          </label>

          <label className="settings-field">
            Birthday
            <input
              type="date"
              name="birthday"
              value={form.birthday || ""}
              onChange={onChange}
            />
          </label>

          <button className="settings-button" disabled={isSaving}>
            {isSaving ? "Saving..." : "Save"}
          </button>

          {error && (
            <p className="settings-error" role="alert">
              {error}
            </p>
          )}
          {success && <p className="settings-success">{success}</p>}
        </form>
        <Link className="dashboard-link" to="/dashboard">
          Back to dashboard.
        </Link>
      </div>
    </main>
  );
}
