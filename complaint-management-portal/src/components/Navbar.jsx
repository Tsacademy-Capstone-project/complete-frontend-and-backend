import { Menu, X } from "lucide-react";

export default function Navbar({ mobileOpen, onMenuToggle }) {
  return (
    <header className="mobile-navbar">
      <button
        type="button"
        className="mobile-menu-button"
        onClick={onMenuToggle}
        aria-label={mobileOpen ? "Close navigation" : "Open navigation"}
        aria-expanded={mobileOpen}
      >
        {mobileOpen ? <X size={22} /> : <Menu size={22} />}
      </button>

      <div className="mobile-brand">
        <span className="brand-mark" aria-hidden="true">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 0 1-2-2V6a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v8a2 2 0 0 1-2 2h-5l-3 3v-3z"
            />
          </svg>
        </span>

        <span>ComplaintsHQ</span>
      </div>
    </header>
  );
}