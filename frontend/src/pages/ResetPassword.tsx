import { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import * as authApi from "../api/authentification";

export default function ResetPassword() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");

  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  useEffect(() => {
    if (!token) {
      setError("Invalid or missing reset token");
    }
  }, [token]);

  const handleResetPassword = async () => {
    setError(null);
    setSuccess(false);

    if (!token) {
      setError("Invalid or missing reset token");
      return;
    }

    if (!newPassword || !confirmPassword) {
      setError("Please fill in all fields");
      return;
    }

    if (newPassword !== confirmPassword) {
      setError("Passwords do not match");
      return;
    }

    if (newPassword.length < 8) {
      setError("Password must be at least 8 characters long");
      return;
    }

    setLoading(true);
    try {
      await authApi.confirmPasswordReset(token, newPassword);
      setSuccess(true);
      setNewPassword("");
      setConfirmPassword("");
      setTimeout(() => {
        navigate("/");
      }, 1500);
    } catch (err: any) {
      setError(err.message || "Failed to reset password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[60vh] gap-8 px-4">
      <div className="text-center">
        <h1 className="text-4xl font-bold text-white mb-2">Reset Password</h1>
        <p className="text-lightest-cyan">Enter your new password below</p>
      </div>

      <div className="bg-bg-modal rounded-xl border border-[var(--color-border-subtle)] p-6 max-w-md w-full">
        {success && (
          <div className="mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500 text-green-300 text-sm">
            Password reset requested successfully! Check your email for further instructions.
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500 text-red-300 text-sm">
            {error}
          </div>
        )}

        {!success && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm text-gray-400 mb-2">
                New Password
              </label>
              <input
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={loading}
                className="w-full px-3 py-2 rounded-lg bg-bg-dark-secondary border border-[var(--color-border-subtle)] text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors disabled:opacity-50"
                placeholder="Enter new password"
              />
              <p className="text-xs text-gray-500 mt-1">Minimum 8 characters</p>
            </div>

            <div>
              <label className="block text-sm text-gray-400 mb-2">
                Confirm Password
              </label>
              <input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
                className="w-full px-3 py-2 rounded-lg bg-bg-dark-secondary border border-[var(--color-border-subtle)] text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 transition-colors disabled:opacity-50"
                placeholder="Confirm new password"
              />
            </div>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={() => navigate("/")}
                disabled={loading}
                className="flex-1 px-4 py-2 rounded-lg border border-[var(--color-border-subtle)] text-gray-300 hover:border-gray-400 transition-colors disabled:opacity-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleResetPassword}
                disabled={loading || !token}
                className="flex-1 px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-600 text-white font-semibold transition-colors disabled:opacity-50 cursor-pointer"
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
