import { useEffect, useState } from "react";
import { useNavigate, useLocation, Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import LoginForm from "../../components/auth/LoginForm";
import UnverifiedEmailAlert from "../../components/auth/UnverifiedEmailAlert";
import AuthCard from "../../components/auth/AuthCard";

/**
 * Enum representing different states of the login flow
 */
enum LoginState {
  FORM = "form",
  UNVERIFIED_EMAIL = "unverified_email",
}

/**
 * Login page component - Manages authentication flow states and navigation
 */
const LoginPage = () => {
  const { user, clearAuthError } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  // Login flow state management
  const [loginState, setLoginState] = useState<LoginState>(LoginState.FORM);
  const [unverifiedEmail, setUnverifiedEmail] = useState("");

  // Get redirect path from location state or default to dashboard
  const from =
    (location.state as { from?: { pathname: string } })?.from?.pathname ||
    "/dashboard";

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate(from, { replace: true });
    }
  }, [user, navigate, from]);

  // Clean up errors when component unmounts
  useEffect(() => {
    return () => {
      clearAuthError();
    };
  }, [clearAuthError]);

  // Handle unverified email detection
  const handleUnverifiedEmail = (email: string) => {
    setUnverifiedEmail(email);
    setLoginState(LoginState.UNVERIFIED_EMAIL);
    // Clear any errors when changing states
    clearAuthError();
  };

  // Return to login form
  const handleBackToLogin = () => {
    setLoginState(LoginState.FORM);
    // Clear any errors when changing states
    clearAuthError();
  };

  // Footer content for auth card
  const footerContent = (
    <div className="space-y-2">
      <p className="text-gray-600">
        Don't have an account?{" "}
        <Link
          to="/register"
          className="text-blue-600 hover:text-blue-500 font-medium"
        >
          Create an account
        </Link>
      </p>
      <p className="text-gray-600 text-sm">
        <Link
          to="/resend-verification"
          className="text-blue-600 hover:text-blue-500"
        >
          Resend verification email
        </Link>
        {" • "}
        <Link
          to="/forgot-password"
          className="text-blue-600 hover:text-blue-500"
        >
          Reset password
        </Link>
      </p>
    </div>
  );

  // Render the appropriate component based on login state
  const renderContent = () => {
    switch (loginState) {
      case LoginState.UNVERIFIED_EMAIL:
        return (
          <UnverifiedEmailAlert
            email={unverifiedEmail}
            onBackToLogin={handleBackToLogin}
          />
        );
      case LoginState.FORM:
      default:
        return <LoginForm onUnverifiedEmail={handleUnverifiedEmail} />;
    }
  };

  return (
    <AuthCard
      title="Welcome Back"
      subtitle="Sign in to your account"
      footer={footerContent}
    >
      {renderContent()}
    </AuthCard>
  );
};

export default LoginPage;
