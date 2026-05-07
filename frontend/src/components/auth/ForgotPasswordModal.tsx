import { useState } from "react";
import { usePasswordReset } from "../../hooks/usePasswordReset";

type ForgotPasswordModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function ForgotPasswordModal({
  isOpen,
  onClose,
}: ForgotPasswordModalProps) {
  const [email, setEmail] = useState("");
  const { loading, error, success, requestReset, reset } = usePasswordReset({
    onSuccess: handleCloseModal,
  });

  if (!isOpen) return null;

  function handleCloseModal() {
    setEmail("");
    reset();
    onClose();
  }

  const handleRequestPasswordReset = async () => {
    await requestReset(email);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="bg-bg-dark rounded-xl border border-[var(--color-border-subtle)] p-6 max-w-md w-full">
        <h3 className="text-2xl font-bold text-white mb-4">Forgot Password?</h3>

        {success && (
          <div className="mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500 text-green-300 text-sm">
            <p className="font-semibold">Reset link sent!</p>
            <p className="text-xs mt-1">
              If an account exists for this email, you will receive a reset link
              shortly.
            </p>
          </div>
        )}

        {error && (
          <div className="mb-4 p-3 rounded-lg bg-red-500/10 border border-red-500 text-red-300 text-sm">
            {error}
          </div>
        )}

        {!success && (
          <>
            <p className="text-gray-400 text-sm mb-4">
              Enter your account email and we'll send you a password reset
              link.
            </p>

            <label className="block text-sm text-gray-300 mb-2" htmlFor="forgot-email">
              Email
            </label>
            <input
              id="forgot-email"
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="w-full px-4 py-2 rounded-lg bg-gray-800/50 border border-gray-700 text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
              placeholder="your@email.com"
            />

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={handleCloseModal}
                disabled={loading}
                className="flex-1 px-4 py-2 rounded-lg border border-[var(--color-border-subtle)] text-gray-300 hover:border-gray-400 transition-colors disabled:opacity-50 cursor-pointer"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleRequestPasswordReset}
                disabled={loading}
                className="flex-1 px-4 py-2 rounded-lg bg-cyan-500 hover:bg-cyan-600 text-white font-semibold transition-colors disabled:opacity-50 cursor-pointer"
              >
                {loading ? "Sending..." : "Send Reset Link"}
              </button>
            </div>
          </>
        )}
      </div>
    </div>
  );
}
