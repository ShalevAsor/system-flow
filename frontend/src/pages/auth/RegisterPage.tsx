import { useEffect, useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import RegisterForm from "../../components/auth/RegisterForm";
import RegistrationSuccessAlert from "../../components/auth/RegistrationSuccessAlert";
import AuthCard from "../../components/auth/AuthCard";

/**
 * Enum representing different states of the registration flow
 */
enum RegistrationState {
  FORM = "form",
  SUCCESS = "success",
}

/**
 * Register page component - Manages registration flow states and navigation
 */
const RegisterPage = () => {
  const { user, clearAuthError } = useAuth();
  const navigate = useNavigate();

  // Registration flow state management
  const [registrationState, setRegistrationState] = useState<RegistrationState>(
    RegistrationState.FORM
  );
  const [registeredEmail, setRegisteredEmail] = useState("");

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, navigate]);

  // Clean up errors when component unmounts
  useEffect(() => {
    return () => {
      clearAuthError();
    };
  }, [clearAuthError]);

  // Handle successful registration
  const handleRegistrationSuccess = (email: string) => {
    setRegisteredEmail(email);
    setRegistrationState(RegistrationState.SUCCESS);
    // Clear any errors when changing states
    clearAuthError();
  };

  const footerContent = (
    <>
      <p className="text-gray-600 mb-2">
        Already have an account?{" "}
        <Link
          to="/login"
          className="text-blue-600 hover:text-blue-500 font-medium"
        >
          Sign in
        </Link>
      </p>
      <p className="text-gray-600 text-sm">
        Need to verify your email?{" "}
        <Link
          to="/resend-verification"
          className="text-blue-600 hover:text-blue-500 font-medium"
        >
          Resend verification
        </Link>
      </p>
    </>
  );

  // Render the appropriate component based on registration state
  const renderContent = () => {
    switch (registrationState) {
      case RegistrationState.SUCCESS:
        return <RegistrationSuccessAlert email={registeredEmail} />;
      case RegistrationState.FORM:
      default:
        return (
          <RegisterForm onRegistrationSuccess={handleRegistrationSuccess} />
        );
    }
  };

  return (
    <AuthCard
      title="Create Account"
      subtitle="Fill in your details to register"
      footer={footerContent}
    >
      {renderContent()}
    </AuthCard>
  );
};

export default RegisterPage;
