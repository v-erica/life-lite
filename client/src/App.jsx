import { Routes, Route, Navigate } from "react-router-dom";
import RegisterPage from "./pages/RegisterPage.jsx";

function App() {
  return (
    <Routes>
      <Route path="/register" element={<RegisterPage />} />
      <Route path="*" element={<Navigate to="/register" replace />} />
    </Routes>
  );
}

export default App;
