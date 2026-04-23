import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import "./LoginPage.css";

export default function Login() {
  const { login } = useAuth();

  const navigate = useNavigate();

  const [error, setError] = useState(null);

  const tryLogin = async (formData) => {
    const identifier = formData.get("identifier")?.trim();
    const password = formData.get("password")?.trim();
    setError(null);

    if (!identifier || !password) {
      setError("Username/email and password are required.");
      return;
    }

    try {
      await login({
        identifier,
        password,
      });
      navigate("/dashboard");
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <main className="login-page">
      <div className="login-card">
        <h1 className="login-title">Login to your account</h1>
        <form className="login-form" action={tryLogin}>
          <label className="login-field">
            Username or Email
            <input type="text" name="identifier" required />
          </label>
          <label className="login-field">
            Password
            <input type="password" name="password" required />
          </label>
          <button className="login-button">Login</button>
          {error && (
            <p className="login-error" role="alert">
              {error}
            </p>
          )}
        </form>
        <Link className="login-link" to="/register">
          Don't have an account? Register here.
        </Link>
      </div>
    </main>
  );
}
