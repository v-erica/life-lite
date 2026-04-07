import { createContext, useContext, useState } from "react";

const API = import.meta.env.VITE_API;

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);

  const register = async (credentials) => {
    const response = await fetch(`${API}/users/register`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || "Registration failed.");
    }

    const nextToken = result.token ?? result;
    setToken(nextToken);
    return nextToken;
  };

  const value = { token, setToken, register };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
