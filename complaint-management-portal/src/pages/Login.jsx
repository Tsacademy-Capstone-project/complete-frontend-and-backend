import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
} from "lucide-react";

import Button from "../components/Button";
import Input from "../components/Input";

export default function Login({ onLogin }) {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    email: "",
    password: "",
  });

  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    try {
      setLoading(true);

      const user = await onLogin(form);

      navigate(
        user?.role === "ADMIN"
          ? "/admin"
          : "/dashboard"
      );
    } catch (loginError) {
      setError(
        loginError.message ||
          "Unable to sign in. Please check your details."
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page signin-page">
      <div className="signin-layout">
        <aside className="signin-intro">
          <div className="auth-brand">
            <div className="brand-mark" aria-hidden="true">
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
            <span>ComplaintsHQ</span>
          </div>

          <div className="signin-intro-copy">
            <h1>
              Every concern
              <br />
              deserves a
              <br />
              resolution.
            </h1>
            <p>
              Submit, track, and resolve complaints with full 
              <br/>
              transparency. Our team is committed to 
               <br/>
              addressing every issue with care.
            </p>
          </div>

          <div className="signin-stats">
            <div className="stat">
              <strong>98%</strong>
              <span>Resolution rate</span>
            </div>

            <div className="stat">
              <strong>&lt; 48h</strong>
              <span>Average response time</span>
            </div>

            <div className="stat">
              <strong>12,400+</strong>
              <span>Issues resolved</span>
            </div>
          </div>
        </aside>

        <section className="signin-form-panel" aria-labelledby="signin-title">
          <div className="auth-card signin-form-card">

            <div className="auth-header">
              <h2 id="signin-title">Sign in to your account</h2>
              <p>Enter your credentials to access the portal.</p>
            </div>

            {error && (
              <div className="form-alert" role="alert">
                {error}
              </div>
            )}

            <div className="demo-credentials">
              <strong>Demo credentials</strong>
              <p>
                User: <code>user@demo.com</code> / <code>password</code>
              </p>

              <p>
                Admin: <code>admin@demo.com</code> / <code>admin123</code>
              </p>
            </div>


            <form onSubmit={handleSubmit}>
              <Input
                label="Email address"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                autoComplete="email"
                required
              />

              <div className="password-field">
            <Input
              label="Password"
              name="password"
              type={showPassword ? "text" : "password"}
              value={form.password}
              onChange={handleChange}
              placeholder="Enter your password"
              autoComplete="current-password"
              required
            />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() => setShowPassword((visible) => !visible)}
                  aria-label={showPassword ? "Hide password" : "Show password"}
                  title={showPassword ? "Hide password" : "Show password"}
                >
                  {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                </button>
              </div>

              <p className="signin-forgot-password">
                <Link to="/verify-otp">Forgot password?</Link>
              </p>

              <Button
                type="submit"
                loading={loading}
                className="auth-submit"
              >
                Sign in
              </Button>
            </form>

            <p className="auth-switch">
              Don't have an account?{" "}
              <Link to="/register">Create one</Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
