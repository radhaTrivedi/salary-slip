import { createContext, useContext, useEffect, useState } from "react";
import api from "../api";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [token, setToken] = useState(() => localStorage.getItem("rp_token"));
  const [user, setUser] = useState(() => {
    const stored = localStorage.getItem("rp_user");
    return stored ? JSON.parse(stored) : null;
  });
  const [checking, setChecking] = useState(true);

  useEffect(() => {
    if (!token) {
      setChecking(false);
      return;
    }
    // Confirm the stored token still works (e.g. hasn't expired)
    api
      .get("/auth/me")
      .then(() => setChecking(false))
      .catch(() => {
        logout();
        setChecking(false);
      });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function login(newToken, newUser) {
    localStorage.setItem("rp_token", newToken);
    localStorage.setItem("rp_user", JSON.stringify(newUser));
    setToken(newToken);
    setUser(newUser);
  }

  function logout() {
    localStorage.removeItem("rp_token");
    localStorage.removeItem("rp_user");
    setToken(null);
    setUser(null);
  }

  return (
    <AuthContext.Provider value={{ token, user, checking, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
