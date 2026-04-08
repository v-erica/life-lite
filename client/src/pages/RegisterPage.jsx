import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import "./RegisterPage.css";

export default function Register() {
  const { register } = useAuth();

  const navigate = useNavigate();

  const [error, setError] = useState(null);

  const tryRegister = async (formData) => {
    const first_name = formData.get("first_name")?.trim();
    const email = formData.get("email")?.trim();
    const password = formData.get("password")?.trim();
    const username = formData.get("username")?.trim() || null;
    const birthday = formData.get("birthday")?.trim() || null;
    const photo_url = formData.get("photo_url")?.trim() || null;

    if (!first_name || !email || !password) {
      setError("First name, email, and password are required.");
      return;
    }

    try {
      await register({
        first_name,
        email,
        password,
        username,
        birthday,
        photo_url,
      });
      navigate("/register");
    } catch (e) {
      setError(e.message);
    }
  };

  return (
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
          <br></br>
          <center>-- Optional --</center>
          <label className="register-field">
            Username
            <input type="text" name="username" />
          </label>
          <label className="register-field">
            Birthday
            <input type="date" name="birthday" />
          </label>
          <label className="register-field">
            Profile Photo URL
            <input type="text" name="photo_url" />
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
