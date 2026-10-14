import { useState } from "react";
import { Link } from "react-router-dom";

import { forgotPassword } from "../../services/authService";

function ForgotPassword() {
  const [email, setEmail] = useState("");

  const [token, setToken] = useState("");

  const [error, setError] = useState("");

  const [success, setSuccess] = useState("");

  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSuccess("");
    setToken("");
    setLoading(true);

    try {
      const data = await forgotPassword(email);

      setSuccess(data.message);

      setToken(data.token);
    } catch (error) {
      setError(
        error.message ||
          "Failed to generate reset token"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">

        <div className="auth-header">
          <h1>Forgot Password?</h1>

          <p>
            Enter your registered email to reset
            your password.
          </p>
        </div>

        {error && (
          <div className="auth-error">
            {error}
          </div>
        )}

        {success && (
          <div className="auth-success">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit}>

          <div className="auth-field">
            <label htmlFor="email">
              Email
            </label>

            <input
              id="email"
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
              placeholder="Enter your email"
              required
            />
          </div>

          <button
            type="submit"
            className="auth-submit"
            disabled={loading}
          >
            {loading
              ? "Generating..."
              : "Generate Reset Token"}
          </button>

        </form>

        {token && (
          <div className="reset-token-box">
            <p>
              Reset token generated:
            </p>

            <code>
              {token}
            </code>

            <Link
              to={`/reset-password?token=${encodeURIComponent(
                token
              )}`}
              className="auth-reset-link"
            >
              Continue to Reset Password
            </Link>
          </div>
        )}

        <div className="auth-footer">
          <Link to="/login">
            Back to Login
          </Link>
        </div>

      </div>
    </div>
  );
}

export default ForgotPassword;