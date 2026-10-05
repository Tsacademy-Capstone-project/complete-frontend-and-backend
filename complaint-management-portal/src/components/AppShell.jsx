import { useState } from "react";
import Navbar from "./Navbar";
import Sidebar from "./Sidebar";

export default function AppShell({
  user,
  children,
  onLogout,
}) {
  const [mobileOpen, setMobileOpen] = useState(false);

  return (
    <div className="app-shell">
      <Navbar
        mobileOpen={mobileOpen}
        onMenuToggle={() => setMobileOpen((open) => !open)}
      />

      <Sidebar
        user={user}
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        onLogout={onLogout}
      />

      <main className="app-content">
        {children}
      </main>
    </div>
  );
}