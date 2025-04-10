import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import RegisterForm from "../../components/auth/RegisterForm";
import RegistrationSuccessAlert from "../../components/auth/RegistrationSuccessAlert";
import AuthCard from "../../components/auth/AuthCard";
import AuthFooter from "../../components/auth/AuthFooter";
import { useAuthStore } from "../../store/authStore";

/**
 * Register page component - Manages registration flow states and navigation
 */
const RegisterPage = () => {
  console.log("RegisterPage rendered");

  // Get auth state with selector directly from the store
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const clearError = useAuthStore((state) => state.clearError);

  const navigate = useNavigate();

  const [registeredEmail, setRegisteredEmail] = useState("");

  // Redirect if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/flow-library", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Clean up errors when component unmounts
  useEffect(() => {
    return () => {
      clearError();
    };
  }, [clearError]);

  // Handle successful registration
  const handleRegistrationSuccess = (email: string) => {
    setRegisteredEmail(email);
    clearError();
  };

  // Render based on whether we have a registered email
  const renderContent = () => {
    if (registeredEmail) {
      return <RegistrationSuccessAlert email={registeredEmail} />;
    }
    return <RegisterForm onRegistrationSuccess={handleRegistrationSuccess} />;
  };

  return (
    <AuthCard
      title="Create Account"
      subtitle="Fill in your details to register"
      footer={<AuthFooter showLogin showResendVerification />}
    >
      {renderContent()}
    </AuthCard>
  );
};

export default RegisterPage;
