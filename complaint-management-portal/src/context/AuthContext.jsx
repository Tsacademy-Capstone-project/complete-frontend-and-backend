import {
  createContext,
  useContext,
  useEffect,
  useState,
} from "react";

import api from "../services/api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [currentUser, setCurrentUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    let active = true;
    async function restoreSession() {
      if (!api.hasSession()) {
        setIsLoading(false);
        return;
      }

      try {
        const user = await api.getCurrentUser();
        if (active) setCurrentUser(user);
      } catch {
        if (active) {
          api.logout();
          setCurrentUser(null);
        }
      } finally {
        if (active) setIsLoading(false);
      }
    }

    restoreSession();
    return () => { active = false; };
  }, []);

  async function login(credentials) {
    const user = await api.login(credentials);

    setCurrentUser(user);

    return user;
  }

  async function register(userData) {
    const user = await api.register(userData);

    setCurrentUser(user);

    return user;
  }

  async function registerAdmin(userData) {
    const user = await api.registerAdmin(userData);
    setCurrentUser(user);
    return user;
  }

  function logout() {
    api.logout();
    setCurrentUser(null);
  }

  const value = {
    currentUser,
    isAuthenticated: Boolean(currentUser),
    isLoading,
    login,
    register,
    registerAdmin,
    logout,
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
}

// This hook intentionally lives with the provider so consumers can import both
// from the same context module.
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth() {
  const context = useContext(AuthContext);

  if (!context) {
    throw new Error(
      "useAuth must be used inside AuthProvider"
    );
  }

  return context;
}
