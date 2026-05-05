import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import Alert from "../shared/Alert";

interface LoginFormProps {
  onClose: () => void;
  onSwitchToSignup: () => void;
}

export default function LoginForm({
  onClose,
  onSwitchToSignup,
}: LoginFormProps) {
  const [formData, setFormData] = useState({
    identifier: "",
    password: "",
    code: "",
    rememberMe: false,
  });
  const [guestNickname, setGuestNickname] = useState("");
  const [isTwoFactorStep, setIsTwoFactorStep] = useState(false);
  const [twoFactorEmail, setTwoFactorEmail] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [notice, setNotice] = useState<{
    title: string;
    message: string;
    variant: "info" | "success" | "warning" | "error";
  } | null>(null);

  const { login, loginWith2FA, continueAsGuest, loading } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    try {
      if (isTwoFactorStep) {
        if (!twoFactorEmail) {
          throw new Error("Missing verification email");
        }

        await loginWith2FA(twoFactorEmail, formData.code.trim());
        setNotice({
          title: "Login successful",
          message: "You are now signed in.",
          variant: "success",
        });
        return;
      }

      const result = await login(formData.identifier, formData.password);
      if ("twoFactorRequired" in result) {
        setIsTwoFactorStep(true);
        setTwoFactorEmail(result.email);
        setAuthError(result.message);
        setFormData((currentForm) => ({ ...currentForm, code: "" }));
        return;
      }

      setNotice({
        title: "Login successful",
        message: `Welcome, ${result.username}!`,
        variant: "success",
      });
    } catch (err: any) {
      if (err?.name === "AbortError") {
        return;
      }
      console.error("Login error:", err.message);
      setAuthError(err.message || "Login failed");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value,
    });
  };

  const handleGoogleLogin = () => {
    window.location.href = "/api/auth/google";
  };

  const handle42Login = () => {
    window.location.href = "/api/auth/intra42";
  };

  const handleContinueAsGuest = async () => {
    if (!guestNickname.trim()) {
      setNotice({
        title: "Guest sign-in",
        message: "Please enter a nickname.",
        variant: "warning",
      });
      return;
    }

    try {
      const guestUser = await continueAsGuest(guestNickname.trim());
      setNotice({
        title: "Guest sign-in successful",
        message: `Welcome, ${guestUser.username}!`,
        variant: "success",
      });
    } catch (err) {
      setNotice({
        title: "Guest sign-in failed",
        message:
          err instanceof Error ? err.message : "Failed to continue as guest",
        variant: "error",
      });
    }
  };

  const handleBackToPassword = () => {
    setIsTwoFactorStep(false);
    setTwoFactorEmail("");
    setAuthError(null);
    setFormData((currentForm) => ({ ...currentForm, code: "" }));
  };

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-purple-900/50 via-black/90 to-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      {notice && (
        <Alert
          open
          title={notice.title}
          message={notice.message}
          variant={notice.variant}
          onClose={() => setNotice(null)}
        />
      )}
      <div className="relative bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 border border-cyan-500/30 rounded-3xl p-10 w-full max-w-md shadow-2xl shadow-cyan-500/20 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white text-2xl"
        >
          ×
        </button>

        <div className="text-center mb-8">
          <h1 className="text-5xl font-bold text-white mb-3">Welcome Back</h1>
          <p className="text-gray-400 text-lg">Sign in to your account</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {authError && (
            <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {authError}
            </div>
          )}

          <div>
            <label
              htmlFor="login-email"
              className="block text-sm font-medium text-white mb-2"
            >
              Username or Email
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"
                  />
                </svg>
              </span>
              <input
                type="text"
                name="identifier"
                className="w-full pl-12 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                onChange={handleChange}
                required
                placeholder="username or email"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="login-password"
              className="block text-sm font-medium text-white mb-2"
            >
              Password
            </label>
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                <svg
                  className="w-5 h-5"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"
                  />
                </svg>
              </span>
              <input
                id="login-password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full pl-12 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                placeholder="Enter your password"
              />
            </div>
          </div>

          {isTwoFactorStep && (
            <div>
              <label
                htmlFor="login-code"
                className="block text-sm font-medium text-white mb-2"
              >
                Verification code
              </label>
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400">
                  <svg
                    className="w-5 h-5"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m5-3a8 8 0 11-16 0 8 8 0 0116 0z"
                    />
                  </svg>
                </span>
                <input
                  id="login-code"
                  type="text"
                  name="code"
                  inputMode="numeric"
                  autoComplete="one-time-code"
                  value={formData.code}
                  onChange={handleChange}
                  required={isTwoFactorStep}
                  maxLength={6}
                  className="w-full pl-12 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all tracking-[0.35em] text-center"
                  placeholder="123456"
                />
              </div>
              <p className="mt-2 text-xs text-gray-400">
                Enter the 6-digit code sent to {twoFactorEmail}.
              </p>
            </div>
          )}

          <div className="flex items-center justify-between text-sm">
            <label className="flex items-center cursor-pointer">
              <input
                type="checkbox"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
                className="w-4 h-4 rounded border-gray-600 bg-gray-800 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-0"
              />
              <span className="ml-2 text-gray-300">Remember me</span>
            </label>
            <button
              type="button"
              className="text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              Forgot password?
            </button>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 disabled:opacity-50 disabled:cursor-not-allowed text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50"
          >
            {loading
              ? "Please wait..."
              : isTwoFactorStep
                ? "Verify code"
                : "Login"}
          </button>

          {isTwoFactorStep && (
            <button
              type="button"
              onClick={handleBackToPassword}
              className="w-full text-sm text-cyan-400 hover:text-cyan-300 transition-colors"
            >
              Back to password
            </button>
          )}
        </form>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-gray-900 text-gray-400">
                Or continue with
              </span>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-750 text-white text-sm font-medium py-2 rounded-xl border border-gray-700 transition-all"
            >
              <svg className="w-4 h-4" viewBox="0 0 24 24">
                <path
                  fill="currentColor"
                  d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                />
                <path
                  fill="currentColor"
                  d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                />
                <path
                  fill="currentColor"
                  d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                />
                <path
                  fill="currentColor"
                  d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                />
              </svg>
              Google
            </button>
            <button
              type="button"
              onClick={handle42Login}
              className="w-full flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-750 text-white text-sm font-medium py-2 rounded-xl border border-gray-700 transition-all"
            >
              <span className="font-bold text-cyan-400">42</span>
              Intra
            </button>
          </div>
        </div>

        <div className="mt-6">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-gray-900 text-gray-400">
                Or continue as guest
              </span>
            </div>
          </div>

          <input
            type="text"
            value={guestNickname}
            onChange={(e) => setGuestNickname(e.target.value)}
            placeholder="Enter your nickname"
            className="mt-4 w-full px-4 py-2.5 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
          />

          <button
            type="button"
            onClick={handleContinueAsGuest}
            className="mt-3 w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-bold py-2.5 rounded-xl transition-all shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50"
          >
            Continue as Guest
          </button>
        </div>

        <p className="mt-6 text-center text-gray-400">
          Don't have an account?{" "}
          <button
            type="button"
            onClick={onSwitchToSignup}
            className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
          >
            Sign up
          </button>
        </p>
      </div>
    </div>
  );
}
