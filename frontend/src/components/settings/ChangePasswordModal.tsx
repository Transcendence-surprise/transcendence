import { useAuth } from "../../hooks/useAuth";
import { usePasswordReset } from "../../hooks/usePasswordReset";

type ChangePasswordModalProps = {
  isOpen: boolean;
  onClose: () => void;
};

export default function ChangePasswordModal({
  isOpen,
  onClose,
}: ChangePasswordModalProps) {
  const { user } = useAuth();
  const { loading, error, success, requestReset, reset } = usePasswordReset({
    onSuccess: onClose,
    successDelay: 3000,
  });

  if (!isOpen) return null;

  const handleRequestPasswordReset = async () => {
    if (!user?.email) {
      return;
    }
    await requestReset(user.email);
  };

  const handleClose = () => {
    reset();
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 p-4 backdrop-blur-sm">
      <div className="bg-bg-dark rounded-xl border border-[var(--color-border-subtle)] p-6 max-w-md w-full">
        <h3 className="text-2xl font-bold text-white mb-4">Change Password</h3>

        {success && (
          <div className="mb-4 p-3 rounded-lg bg-green-500/10 border border-green-500 text-green-300 text-sm">
            <p className="font-semibold">Reset link sent!</p>
            <p className="text-xs mt-1">
              Check your email for the password reset link and follow it to set
              a new password.
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
              We'll send a one-time password reset link to your email address.
              Click the link to set a new password.
            </p>

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={handleClose}
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