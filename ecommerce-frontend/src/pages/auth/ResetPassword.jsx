import { useState } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";

import { resetPassword } from "../../services/authService";

function ResetPassword() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();

  const token = searchParams.get("token") || "";

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");

  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleSubmit(event) {
    event.preventDefault();

    setError("");
    setSuccess("");

    if (!token) {
      setError("Password reset token is missing.");
      return;
    }

    if (newPassword.length < 8) {
      setError(
        "Password must be at least 8 characters."
      );
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    setLoading(true);

    try {
      const data = await resetPassword(
        token,
        newPassword
      );

      setSuccess(data.message);

      setTimeout(() => {
        navigate("/login");
      }, 1500);
    } catch (error) {
      setError(
        error.message ||
          "Password reset failed"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="auth-page">
      <div className="auth-card">

        <div className="auth-header">
          <h1>Reset Password</h1>

          <p>
            Create a new password for your
            ShopSphere account.
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
            <label htmlFor="newPassword">
              New Password
            </label>

            <input
              id="newPassword"
              type="password"
              value={newPassword}
              onChange={(event) =>
                setNewPassword(event.target.value)
              }
              placeholder="Enter new password"
              minLength={8}
              required
            />
          </div>

          <div className="auth-field">
            <label htmlFor="confirmPassword">
              Confirm Password
            </label>

            <input
              id="confirmPassword"
              type="password"
              value={confirmPassword}
              onChange={(event) =>
                setConfirmPassword(event.target.value)
              }
              placeholder="Confirm new password"
              minLength={8}
              required
            />
          </div>

          <button
            type="submit"
            className="auth-submit"
            disabled={loading}
          >
            {loading
              ? "Resetting..."
              : "Reset Password"}
          </button>

        </form>

        <div className="auth-footer">
          <Link to="/login">
            Back to Login
          </Link>
        </div>

      </div>
    </div>
  );
}

export default ResetPassword;