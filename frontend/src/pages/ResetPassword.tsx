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
    <div className="min-h-screen bg-bg-dark px-4 py-8 sm:py-12 md:py-16 flex items-center justify-center">
      <div className="w-full max-w-md relative bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 border border-cyan-500/30 rounded-3xl p-6 sm:p-8 shadow-2xl shadow-cyan-500/20">
        <div className="pointer-events-none absolute inset-x-8 top-0 h-px bg-gradient-to-r from-transparent via-cyan-300/70 to-transparent" />

        <div className="text-center mb-6 sm:mb-8">
          <p className="text-xs uppercase tracking-[0.28em] text-cyan-300/80 mb-3">
            Account Security
          </p>
          <h1 className="text-3xl sm:text-4xl font-bold text-white mb-2">
            Reset Password
          </h1>
          <p className="text-gray-400">Choose a strong new password below.</p>
        </div>

        {success && (
          <div className="mb-5 p-3.5 rounded-xl bg-green-500/10 border border-green-500/70 text-green-300 text-sm">
            Password updated successfully. Redirecting you to home...
          </div>
        )}

        {error && (
          <div className="mb-5 p-3.5 rounded-xl bg-red-500/10 border border-red-500/70 text-red-300 text-sm">
            {error}
          </div>
        )}

        {!success && (
          <form
            className="space-y-4"
            onSubmit={(e) => {
              e.preventDefault();
              void handleResetPassword();
            }}
          >
            <div>
              <label
                htmlFor="new-password"
                className="block text-sm font-medium text-white mb-2"
              >
                New Password
              </label>
              <input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                disabled={loading}
                className="w-full px-4 py-3 rounded-xl bg-gray-800/50 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all disabled:opacity-50"
                placeholder="Enter new password"
              />
              <p className="text-xs text-gray-500 mt-1.5">
                Minimum 8 characters
              </p>
            </div>

            <div>
              <label
                htmlFor="confirm-password"
                className="block text-sm font-medium text-white mb-2"
              >
                Confirm Password
              </label>
              <input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                disabled={loading}
                className="w-full px-4 py-3 rounded-xl bg-gray-800/50 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all disabled:opacity-50"
                placeholder="Confirm new password"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <button
                type="button"
                onClick={() => navigate("/")}
                disabled={loading}
                className="w-full px-4 py-3 rounded-xl border border-gray-700 text-gray-300 hover:border-gray-500 hover:text-white transition-all disabled:opacity-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={loading || !token}
                className="w-full px-4 py-3 rounded-xl bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-bold transition-all shadow-lg shadow-cyan-500/25 hover:shadow-cyan-500/40 disabled:opacity-50 cursor-pointer"
              >
                {loading ? "Resetting..." : "Reset Password"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
}
