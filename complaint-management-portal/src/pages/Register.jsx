import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import {
  Eye,
  EyeOff,
  ShieldCheck,
  UserRound,
} from "lucide-react";

import Button from "../components/Button";
import Input from "../components/Input";

export default function Register({ onRegister }) {
  const navigate = useNavigate();

  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    userName: "",
    email: "",
    password: "",
    confirmPassword: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

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

    if (form.password.length < 6 || form.confirmPassword.length > 20) {
      setError("Password must contain at least 6 characters, and less than 20.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);

      await onRegister({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        userName: form.userName.trim(),
        email: form.email.trim(),
        password: form.password,
      });

      navigate("/dashboard");
    } catch (registerError) {
      setError(registerError.message || "Unable to create your account.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page signin-page register-page">
      <div className="signin-layout">
        <section className="signin-form-panel" aria-labelledby="register-title">
          <div className="auth-card signin-form-card">
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

            <div className="auth-header">
              <h2 id="register-title">Create your account</h2>
              <p>Start tracking and submitting complaints today.</p>
            </div>

            {error && (
              <div className="form-alert" role="alert">
                {error}
              </div>
            )}

            <fieldset className="account-type-picker">
              <legend>Account type</legend>
              <label className="account-type-option selected">
                <input type="radio" name="accountType" value="user" checked readOnly />
                <UserRound size={20} aria-hidden="true" />
                <span className="account-type-copy">
                  <strong>User</strong>
                  <small>Submit and track complaints</small>
                </span>
              </label>
              <Link
                className="account-type-option restricted"
                to="/admin-signup"
                aria-label="Admin signup"
              >
                <ShieldCheck size={20} aria-hidden="true" />
                <span className="account-type-copy">
                  <strong>Admin</strong>
                  <small>Available by official work email</small>
                </span>
                <span className="account-type-badge">Restricted</span>
              </Link>
            </fieldset>

            <form onSubmit={handleSubmit}>
              <div className="form-grid">
              <Input
                label="First name"
                name="firstName"
                value={form.firstName}
                onChange={handleChange}
                placeholder="Joe"
                autoComplete="given-name"
                required
              />

              <Input
                label="Last name"
                name="lastName"
                value={form.lastName}
                onChange={handleChange}
                placeholder="Smith"
                autoComplete="family-name"
                required
              />
              </div>

              <Input
                label="Username"
                name="userName"
                value={form.userName}
                onChange={handleChange}
                placeholder="joesmith"
                autoComplete="username"
                minLength={2}
                maxLength={20}
                required
              />

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
                  placeholder="Minimum 6 characters"
                  autoComplete="new-password"
                  minLength={6}
                  maxLength={20}
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

              <div className="password-field">
                <Input
                  label="Confirm password"
                  name="confirmPassword"
                  type={showConfirmPassword ? "text" : "password"}
                  value={form.confirmPassword}
                  onChange={handleChange}
                  placeholder="Repeat your password"
                  autoComplete="new-password"
                  minLength={6}
                  required
                />
                <button
                  type="button"
                  className="password-toggle"
                  onClick={() =>
                    setShowConfirmPassword((visible) => !visible)
                  }
                  aria-label={
                    showConfirmPassword
                      ? "Hide confirmation password"
                      : "Show confirmation password"
                  }
                  title={
                    showConfirmPassword
                      ? "Hide confirmation password"
                      : "Show confirmation password"
                  }
                >
                  {showConfirmPassword ? (
                    <EyeOff size={17} />
                  ) : (
                    <Eye size={17} />
                  )}
                </button>
              </div>

              <Button
                type="submit"
                loading={loading}
                className="auth-submit"
              >
                <span>Create account</span>
              </Button>
            </form>

            <p className="auth-switch">
              Already have an account?{" "}
              <Link to="/signin">Sign in</Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
