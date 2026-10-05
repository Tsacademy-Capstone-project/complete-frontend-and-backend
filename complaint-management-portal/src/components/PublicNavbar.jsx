import { Link } from "react-router-dom";

export default function PublicNavbar() {
  return (
    <header className="public-navbar">
      <div className="container public-navbar-inner">

        <Link to="/" className="brand">
          <span className="brand-mark">C</span>
          <span className="brand-name">ComplaintsHQ</span>
        </Link>

        <nav className="public-nav-links" aria-label="Public navigation">
          <Link to="/">Home</Link>
          <Link to="/about">About</Link>
        </nav>

        <div className="public-nav-actions">
          <Link to="/signin" className="public-nav-signin">
            Sign in
          </Link>

          <Link to="/register" className="btn btn-primary">
            Get started
          </Link>
        </div>

      </div>
    </header>
  );
}
