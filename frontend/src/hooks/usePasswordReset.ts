import { useState } from "react";
import * as authApi from "../api/authentification";

type UsePasswordResetOptions = {
  onSuccess?: () => void;
  successDelay?: number;
};

export function usePasswordReset(options: UsePasswordResetOptions = {}) {
  const { onSuccess, successDelay = 2000 } = options;
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const requestReset = async (email: string) => {
    setError(null);
    setSuccess(false);

    if (!email.trim()) {
      setError("Please enter a valid email address");
      return;
    }

    setLoading(true);

    try {
      await authApi.requestPasswordReset(email.trim());
      setSuccess(true);

      setTimeout(() => {
        onSuccess?.();
      }, successDelay);
    } catch (err: any) {
      setError(err.message || "Failed to request password reset");
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setError(null);
    setSuccess(false);
  };

  return {
    loading,
    error,
    success,
    requestReset,
    reset,
  };
}
