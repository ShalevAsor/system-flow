import { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import ResetPasswordForm from "../../components/auth/ResetPasswordForm";
import AuthCard from "../../components/auth/AuthCard";
import AuthFooter from "../../components/auth/AuthFooter";
import FormAlert from "../../components/common/FormAlert";
import { useAuthStore } from "../../store/authStore";

// We can use string literals instead of enum for simpler code
type ResetPasswordState = "form" | "success" | "invalid_token";

/**
 * Reset Password page component
 */
const ResetPasswordPage = () => {
  // Get auth store actions
  const clearError = useAuthStore((state) => state.clearError);

  const location = useLocation();

  // Extract token from URL query parameters
  const queryParams = new URLSearchParams(location.search);
  const token = queryParams.get("token") || "";

  // Reset password flow state management - if no token, show invalid state
  const [resetState, setResetState] = useState<ResetPasswordState>(
    token ? "form" : "invalid_token"
  );

  // Clean up errors when component unmounts
  useEffect(() => {
    return () => {
      clearError();
    };
  }, [clearError]);

  // Handle successful password reset
  const handleResetSuccess = () => {
    setResetState("success");
  };

  const handleInvalidToken = () => {
    setResetState("invalid_token");
  };

  // Render the appropriate content based on reset state
  const renderContent = () => {
    switch (resetState) {
      case "success":
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

      case "invalid_token":
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

      case "form":
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
      footer={
        <AuthFooter
          showLogin
          customText={{
            loginText: "Sign in",
          }}
        />
      }
    >
      {renderContent()}
    </AuthCard>
  );
};

export default ResetPasswordPage;
