import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "./AuthContext";
import "./RegisterPage.css";

/**
 * Register page — lets a new user create an account.
 * Required fields are first name, email, and password. All others are optional.
 * Calls the `register` function from AuthContext and redirects to the dashboard on success.
 */
// WHY (Code Style): The component name should match the file name (RegisterPage.jsx → RegisterPage).
// Consistent PascalCase naming makes it easy to find the right component when reading imports.
export default function RegisterPage() {
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
      navigate("/dashboard");
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
            {/* WHY (Functionality): type="email" tells the browser this is an email field.
                The browser will show a proper keyboard on mobile, validate the format before
                submitting, and improve accessibility. type="text" works but misses all of that. */}
            <input type="email" name="email" required />
          </label>
          <label className="register-field">
            Password
            <input type="password" name="password" required />
          </label>
          {/* WHY (Code Style): <br> for layout spacing and <center> are deprecated HTML.
              Use a semantic element with a CSS class instead so spacing and alignment
              are controlled in the stylesheet, not in the markup. */}
          <p className="register-divider">-- Optional --</p>
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
