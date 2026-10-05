import { useState } from "react";
import { Link } from "react-router-dom";
import { MailCheck } from "lucide-react";

import Button from "../components/Button";
import Input from "../components/Input";

export default function VerifyOtp() {
  const [code, setCode] = useState("");
  const [notice, setNotice] = useState("");

  function handleSubmit(event) {
    event.preventDefault();
    setNotice(
      "OTP verification is not connected yet. Email delivery and password recovery must be configured to continue."
    );
  }

  function handleResend() {
    setNotice(
      "Resending codes is not available until email delivery is configured."
    );
  }

  return (
    <main className="auth-page signin-page otp-page">
      <div className="signin-layout">
        <section className="signin-form-panel" aria-labelledby="otp-title">
          <div className="auth-card signin-form-card">
            <Link className="auth-brand" to="/" aria-label="ComplaintsHQ home">
              <span className="brand-mark" aria-hidden="true">
                <MailCheck size={20} />
              </span>
              <span>ComplaintsHQ</span>
            </Link>

            <div className="auth-header">
              <h2 id="otp-title">Verify your email</h2>
              <p>
                Enter the 6-digit verification code sent to your email address
                to continue resetting your password.
              </p>
            </div>

            {notice && (
              <div className="form-alert" role="status">
                {notice}
              </div>
            )}

            <form onSubmit={handleSubmit}>
              <Input
                label="Verification code"
                name="otp"
                type="text"
                value={code}
                onChange={(event) => {
                  setCode(event.target.value.replace(/\D/g, "").slice(0, 6));
                  setNotice("");
                }}
                placeholder="Enter 6-digit code"
                autoComplete="one-time-code"
                inputMode="numeric"
                pattern="[0-9]{6}"
                maxLength={6}
                required
                className="otp-code-input"
              />

              <Button type="submit" className="auth-submit">
                Verify code
              </Button>
            </form>

            <p className="otp-resend">
              Didn&apos;t receive a code?{" "}
              <button type="button" onClick={handleResend}>
                Resend code
              </button>
            </p>

            <p className="auth-switch">
              <Link to="/signin">Back to sign in</Link>
            </p>
          </div>
        </section>
      </div>
    </main>
  );
}
