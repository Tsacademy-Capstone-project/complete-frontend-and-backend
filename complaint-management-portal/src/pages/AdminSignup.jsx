import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ShieldCheck } from "lucide-react";

import Button from "../components/Button";
import Input from "../components/Input";

export default function AdminSignup({ onAdminRegister }) {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    firstName: "",
    lastName: "",
    userName: "",
    email: "",
    password: "",
    confirmPassword: "",
    signupCode: "",
  });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(event) {
    const { name, value } = event.target;

    setForm((previous) => ({
      ...previous,
      [name]: value,
    }));
    setError("");
  }

  async function handleSubmit(event) {
    event.preventDefault();
    setError("");

    if (form.password.length < 8 || form.password.length > 20) {
      setError("Password must contain between 8 and 20 characters.");
      return;
    }

    if (form.password !== form.confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    try {
      setLoading(true);
      await onAdminRegister({
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        userName: form.userName.trim(),
        email: form.email.trim(),
        password: form.password,
        signupCode: form.signupCode.trim(),
      });
      navigate("/admin");
    } catch (signupError) {
      setError(signupError.message || "Unable to create the admin account.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <main className="auth-page signin-page admin-signup-page">
      <div className="signin-layout">
        <section className="signin-form-panel" aria-labelledby="admin-signup-title">
          <div className="auth-card signin-form-card">
            <Link className="auth-brand" to="/" aria-label="ComplaintsHQ home">
              <span className="brand-mark" aria-hidden="true">
                <ShieldCheck size={20} />
              </span>
              <span>ComplaintsHQ</span>
            </Link>

            <div className="auth-header">
              <h2 id="admin-signup-title">Create an admin account</h2>
              <p>Use your work email and the admin signup code provided by your system administrator.</p>
            </div>

            {error && <div className="form-alert" role="alert">{error}</div>}

            <form onSubmit={handleSubmit}>
              <div className="form-grid">
                <Input
                  label="First name"
                  name="firstName"
                  value={form.firstName}
                  onChange={handleChange}
                  autoComplete="given-name"
                  required
                />
                <Input
                  label="Last name"
                  name="lastName"
                  value={form.lastName}
                  onChange={handleChange}
                  autoComplete="family-name"
                  required
                />
              </div>
              <Input
                label="Username"
                name="userName"
                value={form.userName}
                onChange={handleChange}
                autoComplete="username"
                minLength={2}
                maxLength={20}
                required
              />
              <Input
                label="Work Email"
                name="email"
                type="email"
                value={form.email}
                onChange={handleChange}
                placeholder="you@example.com"
                autoComplete="email"
                required
              />
              <Input
                label="Password"
                name="password"
                type="password"
                value={form.password}
                onChange={handleChange}
                placeholder="Minimum 8 characters"
                autoComplete="new-password"
                minLength={8}
                maxLength={20}
                required
              />

              <Input
                label="Confirm password"
                name="confirmPassword"
                type="password"
                value={form.confirmPassword}
                onChange={handleChange}
                placeholder="Repeat your password"
                autoComplete="new-password"
                minLength={8}
                maxLength={20}
                required
              />

              <Input
                label="Admin signup code"
                name="signupCode"
                type="password"
                value={form.signupCode}
                onChange={handleChange}
                autoComplete="off"
                required
              />

              <Button
                type="submit"
                loading={loading}
                className="auth-submit"
              >
                Create admin account
              </Button>
            </form>

            <p className="auth-switch">
              Need a user account? <Link to="/register">Create Account</Link>
            </p>
            <p className="auth-switch admin-signup-signin">
              <Link to="/signin">Back to sign in</Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
