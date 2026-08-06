import {
  Routes,
  Route,
  NavLink,
  useNavigate,
  Navigate,
} from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { AuthProvider, useAuth } from "./context/AuthContext";
import ProtectedRoute from "./components/ProtectedRoute";
import Sidebar from "./components/Sidebar";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import ForgotPassword from "./pages/ForgotPassword";
import AddSalary from "./pages/AddSalary";

import ManageAdmins from "./pages/ManageAdmins"; // if not already there
import ManageEmployeeLogins from "./pages/ManageEmployeeLogins";
import MySalarySlips from "./pages/MySalarySlips";
import AdminSalaryReport from "./pages/AdminSalaryReport";

export default function App() {
  return (
    <AuthProvider>
      <Routes>
        <Route path="/login" element={<Login />} />
        <Route path="/forgot-password" element={<ForgotPassword />} />
        <Route
          path="/*"
          element={
            <ProtectedRoute>
              <AppShell />
            </ProtectedRoute>
          }
        />
      </Routes>

      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3200,
          style: {
            background: "#1f3f80",
            color: "#f4f6fb",
            fontSize: "14px",
            borderRadius: "10px",
          },
          success: { iconTheme: { primary: "#3ac2d5", secondary: "#f4f6fb" } },
          error: { iconTheme: { primary: "#ee4a24", secondary: "#f4f6fb" } },
        }}
      />
    </AuthProvider>
  );
}

function AppShell() {
  const { user } = useAuth();
  const isEmployee = user?.role === "employee";

  return (
    <div className="min-h-screen flex bg-paper-100">
      <Sidebar />

      <div className="flex-1 min-w-0 ledger-bg">
        <MobileTopBar />
        <Routes>
          {isEmployee ? (
            <>
              <Route path="/" element={<MySalarySlips />} />
              <Route path="*" element={<Navigate to="/" replace />} />
            </>
          ) : (
            <>
              <Route path="/" element={<Dashboard />} />
              <Route path="/add-slip" element={<AddSalary />} />
              <Route path="/manage-admins" element={<ManageAdmins />} />
              <Route
                path="/manage-employee-logins"
                element={<ManageEmployeeLogins />}
              />

              <Route path="/admin/reports" element={<AdminSalaryReport />} />
            </>
          )}
        </Routes>
      </div>
    </div>
  );
}

function MobileTopBar() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <div className="md:hidden sticky top-0 z-30 flex items-center justify-between bg-ink-900 text-paper-100 px-5 py-3.5">
      <div className="flex items-center gap-2">
        <img src="/logo.png" alt="ROBO+" className="h-6 w-auto" />
      </div>
      <nav className="flex items-center gap-4 text-sm">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            isActive ? "text-white" : "text-ink-300"
          }
        >
          Employees
        </NavLink>
        <NavLink
          to="/add-slip"
          className={({ isActive }) =>
            isActive ? "text-white" : "text-ink-300"
          }
        >
          + Slip
        </NavLink>
        <button onClick={handleLogout} className="text-ink-300">
          Log out
        </button>
      </nav>
    </div>
  );
}
