import { createContext, useContext, useState, useEffect } from "react";

const API = import.meta.env.VITE_API;
const TOKEN_KEY = "life_lite_token";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [isAuthLoading, setIsAuthLoading] = useState(true);

  // Clears all auth state from memory and removes the stored token.
  const clearSession = () => {
    setToken(null);
    setUser(null);
    localStorage.removeItem(TOKEN_KEY);
  };

  // Fetches the logged-in user's profile from the API using a JWT.
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

  // Saves the token to state + localStorage, then fetches the user profile.
  const establishSession = async (nextToken) => {
    setToken(nextToken);

    localStorage.setItem(TOKEN_KEY, nextToken);

    return fetchCurrentUser(nextToken);
  };

  // Registers a new user and immediately establishes a session with the returned token.
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

  // Logs in an existing user and establishes a session with the returned token.
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

  // Logs out the current user by clearing all session state.
  const logout = () => {
    clearSession();
  };

  // Sends updated profile fields to the API and refreshes the user in state.
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
    const bootAuth = async () => {
      const storedToken = localStorage.getItem(TOKEN_KEY);

      if (!storedToken) {
        setIsAuthLoading(false);
        return;
      }

      try {
        setToken(storedToken);
        await fetchCurrentUser(storedToken);
      } catch (err) {
        // WHY (Functionality): Log the error instead of silently swallowing it.
        // An empty catch block hides unexpected problems (network failures, bad
        // responses) that would otherwise be invisible during development.
        // clearSession() is already called inside fetchCurrentUser on a bad token,
        // so this catch is only reached for truly unexpected errors.
        console.error("Auth boot failed:", err.message);
      } finally {
        setIsAuthLoading(false);
      }
    };

    bootAuth();
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

/**
 * Custom hook for accessing auth state and actions anywhere in the component tree.
 * Must be used inside AuthProvider — throws a clear error if it isn't.
 */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within AuthProvider");
  return context;
}
