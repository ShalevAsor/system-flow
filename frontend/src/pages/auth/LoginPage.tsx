import { useEffect, useState } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import LoginForm from "../../components/auth/LoginForm";
import UnverifiedEmailAlert from "../../components/auth/UnverifiedEmailAlert";
import AuthCard from "../../components/auth/AuthCard";
import AuthFooter from "../../components/auth/AuthFooter";
import { useAuthStore } from "../../store/authStore";

/**
 * Login page component - Manages authentication flow states and navigation
 */
const LoginPage = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const navigate = useNavigate();
  const location = useLocation();

  // Login flow state management
  const [unverifiedEmail, setUnverifiedEmail] = useState("");
  // Get redirect path from location state or default to dashboard
  const from =
    (location.state as { from?: { pathname: string } })?.from?.pathname ||
    "/flow-library";

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, navigate, from]);

  // Handle unverified email detection
  const handleUnverifiedEmail = (email: string) => {
    setUnverifiedEmail(email);
  };

  const handleBackToLogin = () => {
    setUnverifiedEmail("");
  };

  // Render content based on current state
  const renderContent = () => {
    if (unverifiedEmail) {
      return (
        <UnverifiedEmailAlert
          email={unverifiedEmail}
          onBackToLogin={handleBackToLogin}
        />
      );
    }
    return <LoginForm onUnverifiedEmail={handleUnverifiedEmail} />;
  };

  return (
    <AuthCard
      title="Welcome Back"
      subtitle="Sign in to your account"
      footer={
        <AuthFooter showRegister showForgotPassword showResendVerification />
      }
    >
      {renderContent()}
    </AuthCard>
  );
};

export default LoginPage;
