import { Link } from "react-router-dom";

export default function PublicFooter() {
  return (
    <footer className="public-footer">
      <div className="container footer-grid">
        <div className="footer-brand">
          <Link to="/" className="brand footer-logo">
            <span className="brand-mark">C</span>
            <span className="brand-name">ComplaintsHQ</span>
          </Link>

          <p>
            A structured way for organizations to collect, manage, track, and
            resolve complaints and feedback.
          </p>
        </div>

        <div className="footer-column">
          <h4>Product</h4>
          <Link to="/">Home</Link>
          <Link to="/about">About</Link>
        </div>

        <div className="footer-column">
          <h4>Account</h4>
          <Link to="/signin">Sign in</Link>
          <Link to="/register">Get started</Link>
        </div>

        <div className="footer-column">
          <h4>Contact</h4>
          <a href="mailto:hello@complaintshq.com">
            hello@complaintshq.com
          </a>
          <span>Support available through your organization</span>
        </div>
      </div>

      <div className="container footer-bottom">
        <span>© {new Date().getFullYear()} ComplaintsHQ.</span>
        <span>Built for better communication and accountability.</span>
      </div>
    </footer>
  );
}