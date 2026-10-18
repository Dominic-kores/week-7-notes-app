
import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";

import api from "../services/api";

// ======================================================
// 1. CREATE AUTHENTICATION CONTEXT
// ======================================================

// This Context shares authentication data across
// the entire React application.
const AuthContext = createContext(null);

// ======================================================
// 2. AUTHENTICATION PROVIDER
// ======================================================

export function AuthProvider({ children }) {
  // Stores the currently logged-in user.
  const [user, setUser] = useState(null);

  // Tracks authentication verification on page load.
  const [loading, setLoading] = useState(true);

  // ====================================================
  // 3. LOGOUT FUNCTION
  // ====================================================

  // useCallback keeps this function reference stable.
  // This helps prevent unnecessary API calls in
  // components that depend on logout.
  const logout = useCallback(() => {
    // Remove the stored JWT token.
    localStorage.removeItem("notes_token");

    // Clear authenticated user information.
    setUser(null);
  }, []);

  // ====================================================
  // 4. RESTORE AUTHENTICATION SESSION
  // ====================================================

  useEffect(() => {
    let active = true;

    async function restoreSession() {
      // Check whether a JWT token exists in localStorage.
      const token = localStorage.getItem("notes_token");

      // No token means the user is not authenticated.
      if (!token) {
        if (active) {
          setLoading(false);
        }
        return;
      }

      try {
        // Verify the token with the protected backend route.
        const response = await api.get("/auth/me");

        // Restore the authenticated user.
        if (active) {
          setUser(response.data.user);
        }
      } catch (error) {
        // An expired or invalid token should not
        // allow access to the dashboard.
        console.error(
          "Session restoration failed:",
          error.response?.data?.message || error.message
        );

        if (active) {
          localStorage.removeItem("notes_token");
          setUser(null);
        }
      } finally {
        // Authentication verification is complete.
        if (active) {
          setLoading(false);
        }
      }
    }

    restoreSession();

    // Avoid updating state after effect cleanup.
    return () => {
      active = false;
    };
  }, []);

  // ====================================================
  // 5. SAVE AUTHENTICATED SESSION
  // ====================================================

  const saveSession = useCallback((data) => {
    // Save the backend-generated JWT.
    localStorage.setItem("notes_token", data.token);

    // Store the user's profile in React state.
    setUser(data.user);
  }, []);

  // ====================================================
  // 6. LOGIN FUNCTION
  // ====================================================

  const login = useCallback(
    async (credentials) => {
      // Send email and password to Express backend.
      const response = await api.post(
        "/auth/login",
        credentials
      );

      // Save JWT and user after successful login.
      saveSession(response.data);

      // Return data if a component needs the response.
      return response.data;
    },
    [saveSession]
  );

  // ====================================================
  // 7. REGISTRATION FUNCTION
  // ====================================================

  const register = useCallback(
    async (details) => {
      // Send name, email and password to the server.
      const response = await api.post(
        "/auth/register",
        details
      );

      // Automatically authenticate after registration.
      saveSession(response.data);

      return response.data;
    },
    [saveSession]
  );

  // ====================================================
  // 8. AUTHENTICATION STATUS
  // ====================================================

  // If a user object exists, authentication succeeded.
  const isAuthenticated = Boolean(user);

  // ====================================================
  // 9. SHARED CONTEXT VALUES
  // ====================================================

  // Memoize the context value for better performance.
  const value = useMemo(
    () => ({
      user,
      loading,
      login,
      register,
      logout,
      isAuthenticated,
    }),
    [
      user,
      loading,
      login,
      register,
      logout,
      isAuthenticated,
    ]
  );

  // ====================================================
  // 10. PROVIDE AUTHENTICATION TO CHILD COMPONENTS
  // ====================================================

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// ======================================================
// 11. CUSTOM AUTHENTICATION HOOK
// ======================================================

// Allows components to access authentication using:
// const { user, login, logout } = useAuth();

export function useAuth() {
  const context = useContext(AuthContext);

  // Prevent using this hook outside AuthProvider.
  if (!context) {
    throw new Error(
      "useAuth must be used within an AuthProvider"
    );
  }

  return context;
}
