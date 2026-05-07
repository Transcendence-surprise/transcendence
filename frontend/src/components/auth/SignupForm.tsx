import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import Alert from "../shared/Alert";
import { RxCross2 } from "react-icons/rx";

interface SignupFormProps {
  onClose: () => void;
  onSwitchToLogin: () => void;
}

export default function SignupForm({
  onClose,
  onSwitchToLogin,
}: SignupFormProps) {
  const [formData, setFormData] = useState({
    username: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
  });
  const [guestNickname, setGuestNickname] = useState("");
  const [authError, setAuthError] = useState<string | null>(null);
  const [notice, setNotice] = useState<{
    title: string;
    message: string;
    variant: "info" | "success" | "warning" | "error";
  } | null>(null);

  const { signup, continueAsGuest } = useAuth();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError(null);

    if (formData.password !== formData.confirmPassword) {
      setAuthError("Passwords do not match");
      return;
    }

    if (!formData.agreeToTerms) {
      setAuthError("Please agree to the Terms of Service and Privacy Policy");
      return;
    }

    try {
      const data = await signup(
        formData.username,
        formData.email,
        formData.password,
      );
      setNotice({
        title: "Account created",
        message: `Welcome, ${data.username}!`,
        variant: "success",
      });
    } catch (err: any) {
      if (err?.name === "AbortError") {
        return;
      }
      console.error("Signup error:", err.message);
      setAuthError(err?.message || "Signup failed");
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (authError) {
      setAuthError(null);
    }

    const value =
      e.target.type === "checkbox" ? e.target.checked : e.target.value;
    setFormData({
      ...formData,
      [e.target.name]: value,
    });
  };

  const handleGoogleSignUp = () => {
    window.location.href = "/api/auth/google";
  };

  const handle42SignUp = () => {
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

  return (
    <div className="fixed inset-0 bg-gradient-to-br from-purple-900/50 via-black/90 to-black/90 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      {notice && (
        <Alert
          open
          title={notice.title}
          message={notice.message}
          variant={notice.variant}
          onClose={() => {
            setNotice(null);
            if (notice?.variant === "success") {
              onClose();
            }
          }}
        />
      )}
      <div className="relative bg-gradient-to-br from-gray-900 via-gray-900 to-gray-800 border border-cyan-500/30 rounded-3xl p-10 w-full max-w-md shadow-2xl shadow-cyan-500/20 max-h-[90vh] overflow-y-auto">
        <button
          onClick={onClose}
          className="absolute right-4 top-4 text-gray-400 hover:text-white text-2xl z-10"
        >
          <RxCross2 />
        </button>

        <div className="text-center mb-6">
          <h1 className="text-4xl font-bold text-white mb-3">Create Account</h1>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3">
          {authError && (
            <div className="rounded-xl border border-red-500/40 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {authError}
            </div>
          )}

          <div>
            <label
              htmlFor="signup-username"
              className="block text-sm font-medium text-white mb-1.5"
            >
              Username
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
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  />
                </svg>
              </span>
              <input
                id="signup-username"
                type="text"
                name="username"
                value={formData.username}
                onChange={handleChange}
                required
                className="w-full pl-12 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                placeholder="Choose your username"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="signup-email"
              className="block text-sm font-medium text-white mb-1.5"
            >
              Email
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
                id="signup-email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                className="w-full pl-12 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                placeholder="you@email.com"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="signup-password"
              className="block text-sm font-medium text-white mb-1.5"
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
                id="signup-password"
                type="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                className="w-full pl-12 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                placeholder="Create a strong password"
              />
            </div>
          </div>

          <div>
            <label
              htmlFor="signup-confirm-password"
              className="block text-sm font-medium text-white mb-1.5"
            >
              Confirm Password
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
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
                  />
                </svg>
              </span>
              <input
                id="signup-confirm-password"
                type="password"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                required
                className="w-full pl-12 pr-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder-gray-500 focus:outline-none focus:border-cyan-500 focus:ring-1 focus:ring-cyan-500 transition-all"
                placeholder="Re-enter your password"
              />
            </div>
          </div>

          <div className="flex items-start">
            <input
              type="checkbox"
              id="terms"
              name="agreeToTerms"
              checked={formData.agreeToTerms}
              onChange={handleChange}
              className="w-4 h-4 mt-1 rounded border-gray-600 bg-gray-800 text-cyan-500 focus:ring-cyan-500 focus:ring-offset-0"
            />
            <label
              htmlFor="terms"
              className="ml-2 text-sm text-gray-300 leading-relaxed"
            >
              I agree to the Terms of Service and Privacy Policy. I understand
              this platform is GDPR compliant and not for collecting PII.
            </label>
          </div>

          <button
            type="submit"
            className="w-full bg-gradient-to-r from-cyan-500 to-blue-500 hover:from-cyan-400 hover:to-blue-400 text-white font-bold py-3 rounded-xl transition-all shadow-lg shadow-cyan-500/30 hover:shadow-cyan-500/50"
          >
            Continue
          </button>
        </form>

        <div className="mt-4">
          <div className="relative">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-700"></div>
            </div>
            <div className="relative flex justify-center text-sm">
              <span className="px-4 bg-gray-900 text-gray-400">
                Or sign up with
              </span>
            </div>
          </div>

          <div className="mt-4 grid grid-cols-2 gap-2">
            <button
              type="button"
              onClick={handleGoogleSignUp}
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
              onClick={handle42SignUp}
              className="w-full flex items-center justify-center gap-2 bg-gray-800 hover:bg-gray-750 text-white text-sm font-medium py-2 rounded-xl border border-gray-700 transition-all"
            >
              <span className="font-bold text-cyan-400">42</span>
              Intra
            </button>
          </div>
        </div>

        <div className="mt-4">
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

        <p className="mt-4 text-center text-gray-400">
          Already have an account?{" "}
          <button
            type="button"
            onClick={onSwitchToLogin}
            className="text-cyan-400 hover:text-cyan-300 font-medium transition-colors"
          >
            Sign in
          </button>
        </p>
      </div>
    </div>
  );
}
