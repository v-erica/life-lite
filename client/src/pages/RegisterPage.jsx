import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import "./RegisterPage.css";

export default function Register() {
  const { register } = useAuth();

  const navigate = useNavigate();

  const [error, setError] = useState(null);

  const tryRegister = async (formData) => {
    const email = formData.get("email");
    const password = formData.get("password");
    try {
      await register({ email, password });
    const first_name = formData.get("first_name");
    const email = formData.get("email");
    const password = formData.get("password");
    try {
      await register({ first_name, email, password });
      navigate("/register");
    } catch (e) {
      setError(e.message);
    }
  };

  return (
    <>
      <h1>Register for an account</h1>
      <form action={tryRegister}>
        <label>
          Email
          <input type="text" name="email" required />
        </label>
        <label>
          Password
          <input type="password" name="password" required />
        </label>
        <button>Register</button>
        {error && <p role="alert">{error}</p>}
      </form>
      <Link to="/login">Already have an account? Log in here.</Link>
    </>
    <main className="register-page">
      <div className="register-card">
        <h1 className="register-title">Register for an account</h1>
        <form className="register-form" action={tryRegister}>
          <label className="register-field">
            First Name
            <input type="text" name="first_name" required />
          </label>
          <label className="register-field">
            Email
            <input type="text" name="email" required />
          </label>
          <label className="register-field">
            Password
            <input type="password" name="password" required />
          </label>
          <button className="register-button">Register</button>
          {error && (
            <p className="register-error" role="alert">
              {error}
            </p>
          )}
        </form>
        <Link className="register-link" to="/login">
          Already have an account? Log in here.
        </Link>
      </div>
    </main>
  );
}
