import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "./AuthContext";

/**
 * Wraps any route that requires a logged-in user.
 * Shows a loading state while auth is being restored from localStorage,
 * then redirects unauthenticated users to /login, preserving where they were trying to go.
 */
export default function ProtectedRoute({ children }) {
  const { token, isAuthLoading } = useAuth();
  const location = useLocation();

  if (isAuthLoading) return <main>Loading...</main>;
  if (!token)
    return <Navigate to="/login" replace state={{ from: location }} />;
  return children;
}
