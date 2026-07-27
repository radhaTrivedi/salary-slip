import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

export default function ProtectedRoute({ children }) {
  const { token, checking } = useAuth();
  const location = useLocation();

  if (checking) {
    return (
      <div className="min-h-screen grid place-items-center bg-paper-100 text-sm text-ink-500">
        Checking your session…
      </div>
    );
  }

  if (!token) {
    return <Navigate to="/login" replace state={{ from: location.pathname }} />;
  }

  return children;
}
