import { Routes, Route, Navigate } from "react-router-dom";
import RegisterPage from "./auth/RegisterPage.jsx";
import LoginPage from "./auth/LoginPage.jsx";
import ProtectedRoute from "./auth/ProtectedRoute.jsx";
import DashboardPage from "./pages/DashboardPage.jsx";

function App() {
  return (
    <Routes>
      <Route path="/register" element={<RegisterPage />} />
      <Route path="/login" element={<LoginPage />} />
      <Route
        path="/dashboard"
        element={
          <ProtectedRoute>
            <DashboardPage />
          </ProtectedRoute>
        }
      />
      <Route path="*" element={<Navigate to="/login" replace />} />
    </Routes>
  );
}

export default App;
