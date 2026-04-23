import { useState } from "react";
import { Outlet, useLocation } from "react-router-dom";
import LoginForm from "./auth/LoginForm";
import SignupForm from "./auth/SignupForm";
import Header from "./UI/Header";
import Footer from "./UI/Footer";
import { useIsViewportLockedPage } from "../hooks/useIsViewportLockedPage";

export default function Layout() {
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
  const location = useLocation();
  const isViewportLockedPage = useIsViewportLockedPage();

  const handleSwitchToSignup = () => {
    setShowLogin(false);
    setShowSignup(true);
  };

  const handleSwitchToLogin = () => {
    setShowSignup(false);
    setShowLogin(true);
  };

  return (
    <div
      className={
        isViewportLockedPage
          ? "flex h-dvh flex-col overflow-hidden bg-bg-dark font-sans text-white"
          : "flex min-h-dvh flex-col bg-bg-dark font-sans text-white"
      }
    >
      {/* Header */}
      <Header
        onLoginClick={() => setShowLogin(true)}
        onSignupClick={() => setShowSignup(true)}
      />
      {/* Login Modal */}
      {showLogin && (
        <LoginForm
          onClose={() => setShowLogin(false)}
          onSwitchToSignup={handleSwitchToSignup}
        />
      )}

      {/* Signup Modal */}
      {showSignup && (
        <SignupForm
          onClose={() => setShowSignup(false)}
          onSwitchToLogin={handleSwitchToLogin}
        />
      )}
      {/* Main content - this is where child routes will render */}
      <main
        className={
          isViewportLockedPage
            ? "flex-1 min-h-0 overflow-y-auto overflow-x-hidden"
            : "flex flex-1 flex-col min-h-0"
        }
      >
        <Outlet />
      </main>

      {/* Footer: only visible on home page */}
      {location.pathname === "/" ? <Footer /> : null}
    </div>
  );
}
