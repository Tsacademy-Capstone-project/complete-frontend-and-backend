import { useEffect } from "react";
import { NavLink } from "react-router-dom";
import {
  ClipboardList,
  FilePlus2,
  LogOut,
  X,
} from "lucide-react";

const userNavigation = [
  {
    label: "My Complaints",
    to: "/dashboard",
    icon: ClipboardList,
  },
  {
    label: "New Complaint",
    to: "/complaints/new",
    icon: FilePlus2,
  },
];

const adminNavigation = [
  {
    label: "All Complaints",
    to: "/admin",
    icon: ClipboardList,
  },
];

export default function Sidebar({
  user,
  open = false,
  onClose,
  onLogout,
}) {
  useEffect(() => {
    if (!open) return;

    const handleEscape = (event) => {
      if (event.key === "Escape") onClose?.();
    };

    window.addEventListener("keydown", handleEscape);

    return () => {
      window.removeEventListener("keydown", handleEscape);
    };
  }, [open, onClose]);

  if (!user) return null;

  const navigation =
    user.role === "ADMIN" ? adminNavigation : userNavigation;

  const displayName = [user.firstName, user.lastName].filter(Boolean).join(" ") || user.name;

  return (
    <>
      {open && (
        <button
          type="button"
          className="sidebar-backdrop"
          aria-label="Close navigation"
          onClick={onClose}
        />
      )}

      <aside className={`app-sidebar ${open ? "is-open" : ""}`}>
        <div className="sidebar-header">
          <div className="brand-mark">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2.2"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-5l-3 3v-3z"
              />
            </svg>
          </div>

          <div>
            <p className="brand-name">ComplaintsHQ</p>
            <p className="brand-subtitle">Management Portal</p>
          </div>

          <button
            type="button"
            className="sidebar-close"
            onClick={onClose}
            aria-label="Close navigation"
          >
            <X size={20} />
          </button>
        </div>

        <nav className="sidebar-nav">
          <p className="sidebar-label">
            {user.role === "ADMIN" ? "Admin" : "Menu"}
          </p>

          {navigation.map(({ label, to, icon: Icon }) => (
            <NavLink
              key={to}
              to={to}
              end
              onClick={onClose}
              className={({ isActive }) =>
                `sidebar-link ${isActive ? "active" : ""}`
              }
            >
              <Icon size={20} strokeWidth={1.8} />
              <span>{label}</span>
            </NavLink>
          ))}
        </nav>

        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="user-avatar">
              {displayName
                ?.split(" ")
                .map((name) => name[0])
                .join("")
                .slice(0, 2)
                .toUpperCase()}
            </div>

            <div className="sidebar-user-info">
              <p>{displayName}</p>
              <span>{user.role}</span>
            </div>
          </div>

          <button
            type="button"
            className="signout-button"
            onClick={onLogout}
          >
            <LogOut size={17} strokeWidth={1.8} />
            <span>Sign out</span>
          </button>
        </div>
      </aside>
    </>
  );
}
