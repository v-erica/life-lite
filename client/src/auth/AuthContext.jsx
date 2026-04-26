/* eslint-disable react-refresh/only-export-components */
import { createContext, useContext, useState, useEffect } from "react";

const API = import.meta.env.VITE_API;
const TOKEN_KEY = "life_lite_token";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  const clearSession = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem(TOKEN_KEY);
  };

  const fetchCurrentUser = async (jwt) => {
    const response = await fetch(`${API}/users/me`, {
      headers: { Authorization: `Bearer ${jwt}` },
    });

    const result = await response.json();

    if (!response.ok) {
      clearSession();
      throw new Error(result.error || "Session expired. Please log in again.");
    }

    setUser(result);
    return result;
  };

  const establishSession = async (nextToken) => {
    setToken(nextToken);

    localStorage.setItem(TOKEN_KEY, nextToken);

    return fetchCurrentUser(nextToken);
  };

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
    await establishSession(nextToken);
    return nextToken;
  };

  const login = async (credentials) => {
    const response = await fetch(`${API}/users/login`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(credentials),
    });

    const result = await response.json();
    if (!response.ok) {
      throw new Error(result.error || "Login failed.");
    }

    const nextToken = result.token ?? result;
    await establishSession(nextToken);
    return nextToken;
  };

  const logout = () => {
    clearSession();
  };

  const updateProfile = async (profileUpdates) => {
    if (!token) throw new Error("You must be logged in.");

    const response = await fetch(`${API}/users/me`, {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
      body: JSON.stringify(profileUpdates),
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || "Profile update failed.");
    }

    setUser(result);
    return result;
  };

  useEffect(() => {
    const loadStoredUser = async () => {
      const storedToken = localStorage.getItem(TOKEN_KEY);

      if (!storedToken) {
        setIsAuthLoading(false);
        return;
      }

      try {
        setToken(storedToken);
        await fetchCurrentUser(storedToken);
      } catch {
        clearSession();
      } finally {
        setIsAuthLoading(false);
      }
    };

    loadStoredUser();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = {
    token,
    user,
    isAuthLoading,
    login,
    register,
    logout,
    updateProfile,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
