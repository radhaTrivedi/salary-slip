import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

const linkBase =
  "flex items-center gap-3 rounded-lg px-3.5 py-2.5 text-sm font-medium transition-colors";

export default function Sidebar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  function handleLogout() {
    logout();
    navigate("/login", { replace: true });
  }

  return (
    <aside className="hidden md:flex md:w-64 md:flex-col md:shrink-0 bg-ink-900 text-paper-100 min-h-screen sticky top-0">
      <div className="px-6 py-7 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <img
            src="/logo.png"
            alt="ROBO+ EduTech"
            className="h-9 w-auto rounded-md bg-white/95 p-1"
          />
          <div>
            <p className="font-display text-base leading-tight tracking-tight">
              ROBO+ EduTech
            </p>
            <p className="text-[11px] text-ink-300 tracking-wide uppercase">
              Payroll register
            </p>
          </div>
        </div>
      </div>

      {/* <nav className="flex-1 px-4 py-6 space-y-1">
        <NavLink
          to="/"
          end
          className={({ isActive }) =>
            `${linkBase} ${
              isActive ? "bg-white/10 text-white" : "text-ink-300 hover:bg-white/5 hover:text-white"
            }`
          }
        >
          <IconGrid /> Employees
        </NavLink>
        <NavLink
          to="/add-slip"
          className={({ isActive }) =>
            `${linkBase} ${
              isActive ? "bg-white/10 text-white" : "text-ink-300 hover:bg-white/5 hover:text-white"
            }`
          }
        >
          <IconPlus /> New salary slip
        </NavLink>
      </nav> */}

      <nav className="flex-1 px-4 py-6 space-y-1">
        {user?.role === "employee" ? (
          <NavLink
            to="/"
            end
            className={({ isActive }) =>
              `${linkBase} ${isActive ? "bg-white/10 text-white" : "text-ink-300 hover:bg-white/5 hover:text-white"}`
            }
          >
            <IconGrid /> My salary slips
          </NavLink>
        ) : (
          <>
            <NavLink
              to="/"
              end
              className={({ isActive }) =>
                `${linkBase} ${isActive ? "bg-white/10 text-white" : "text-ink-300 hover:bg-white/5 hover:text-white"}`
              }
            >
              <IconGrid /> Employees
            </NavLink>
            <NavLink
              to="/add-slip"
              className={({ isActive }) =>
                `${linkBase} ${isActive ? "bg-white/10 text-white" : "text-ink-300 hover:bg-white/5 hover:text-white"}`
              }
            >
              <IconPlus /> New salary slip
            </NavLink>
            <NavLink
              to="/manage-employee-logins"
              className={({ isActive }) =>
                `${linkBase} ${isActive ? "bg-white/10 text-white" : "text-ink-300 hover:bg-white/5 hover:text-white"}`
              }
            >
              <IconUsers /> Employee logins
            </NavLink>
            <NavLink
              to="/manage-admins"
              className={({ isActive }) =>
                `${linkBase} ${isActive ? "bg-white/10 text-white" : "text-ink-300 hover:bg-white/5 hover:text-white"}`
              }
            >
              <IconPlus /> Add admin
            </NavLink>
          </>
        )}
      </nav>

      <div className="px-6 py-5 border-t border-white/10">
        <p className="text-[11px] text-ink-300">
          Working days are fixed at{" "}
          <span className="text-paper-100 font-medium">30 / month</span>.
        </p>
        {user && (
          <div className="mt-4 pt-4 border-t border-white/10 flex items-center justify-between">
            <div>
              <p className="text-xs text-ink-300">Signed in as</p>
              <p className="text-sm font-medium text-paper-100">
                {user.username}
              </p>
            </div>
            <button
              onClick={handleLogout}
              className="text-xs font-medium px-2.5 py-1.5 rounded-md bg-white/10 hover:bg-white/20 transition-colors"
            >
              Log out
            </button>
          </div>
        )}
      </div>
    </aside>
  );
}

function IconGrid() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="7" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
      <rect x="14" y="14" width="7" height="7" rx="1.5" />
    </svg>
  );
}

function IconPlus() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M12 8v8M8 12h8" />
    </svg>
  );
}

function IconUsers() {
  return (
    <svg
      width="18"
      height="18"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.8"
    >
      <path d="M17 21v-2a4 4 0 00-4-4H5a4 4 0 00-4 4v2" />
      <circle cx="9" cy="7" r="4" />
      <path d="M23 21v-2a4 4 0 00-3-3.87M16 3.13a4 4 0 010 7.75" />
    </svg>
  );
}
