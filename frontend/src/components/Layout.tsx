import { useState } from "react";
import { Outlet } from "react-router-dom";
import LoginForm from "./auth/LoginForm";
import SignupForm from "./auth/SignupForm";
import Header from "./UI/Header";
import Footer from "./UI/Footer";
import { useIsViewportLockedPage } from "../hooks/useIsViewportLockedPage";

export default function Layout() {
  const [showLogin, setShowLogin] = useState(false);
  const [showSignup, setShowSignup] = useState(false);
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
          ? "h-screen overflow-hidden bg-bg-dark text-white font-sans flex flex-col"
          : "min-h-screen bg-bg-dark text-white font-sans"
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
        className={isViewportLockedPage ? "flex-1 min-h-0 overflow-hidden" : ""}
      >
        <Outlet />
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
