// src/pages/auth/ResetPasswordPage.tsx
import { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import ResetPasswordForm from "../../components/auth/ResetPasswordForm";
import AuthCard from "../../components/auth/AuthCard";
import FormAlert from "../../components/common/FormAlert";

/**
 * Enum representing different states of the password reset flow
 */
enum ResetPasswordState {
  FORM = "form",
  SUCCESS = "success",
  INVALID_TOKEN = "invalid_token",
}

/**
 * Reset Password page component
 */
const ResetPasswordPage = () => {
  const { clearAuthError } = useAuth();
  const location = useLocation();

  // Extract token from URL query parameters
  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get("token") || "";

  // Reset password flow state management
  const [resetState, setResetState] = useState<ResetPasswordState>(
    token ? ResetPasswordState.FORM : ResetPasswordState.INVALID_TOKEN
  );

  // Clean up errors when component unmounts
  useEffect(() => {
    return () => {
      clearAuthError();
    };
  }, [clearAuthError]);

  // Handle successful password reset
  const handleResetSuccess = () => {
    setResetState(ResetPasswordState.SUCCESS);
  };

  const handleInvalidToken = () => {
    setResetState(ResetPasswordState.INVALID_TOKEN);
  };

  // Footer content for auth card
  const footerContent = (
    <div className="text-center">
      <p className="text-gray-600">
        Remember your password?{" "}
        <Link
          to="/login"
          className="text-blue-600 hover:text-blue-500 font-medium"
        >
          Sign in
        </Link>
      </p>
    </div>
  );

  // Render the appropriate content based on reset state
  const renderContent = () => {
    switch (resetState) {
      case ResetPasswordState.SUCCESS:
        return (
          <div className="text-center">
            <FormAlert
              message="Your password has been reset successfully!"
              variant="success"
              showCloseButton={false}
            />
            <p className="mt-4 text-gray-600">
              You can now{" "}
              <Link
                to="/login"
                className="text-blue-600 hover:text-blue-500 font-medium"
              >
                login
              </Link>{" "}
              with your new password.
            </p>
          </div>
        );

      case ResetPasswordState.INVALID_TOKEN:
        return (
          <div className="text-center">
            <FormAlert
              message="Invalid or expired password reset token."
              variant="error"
              showCloseButton={false}
            />
            <p className="mt-4 text-gray-600">
              Please{" "}
              <Link
                to="/forgot-password"
                className="text-blue-600 hover:text-blue-500 font-medium"
              >
                request a new password reset link
              </Link>
              .
            </p>
          </div>
        );

      case ResetPasswordState.FORM:
      default:
        return (
          <ResetPasswordForm
            token={token}
            onSuccess={handleResetSuccess}
            onInvalidToken={handleInvalidToken}
          />
        );
    }
  };

  return (
    <AuthCard
      title="Reset Your Password"
      subtitle="Enter a new password for your account"
      footer={footerContent}
    >
      {renderContent()}
    </AuthCard>
  );
};

export default ResetPasswordPage;
