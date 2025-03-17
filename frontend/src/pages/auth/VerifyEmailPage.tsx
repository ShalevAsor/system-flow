import { useEffect, useState, useRef } from "react";
import { useSearchParams, useNavigate } from "react-router-dom";
import { useMutation } from "@tanstack/react-query";
import AuthCard from "../../components/auth/AuthCard";
import AuthFooter from "../../components/auth/AuthFooter";
import SuccessStateCard from "../../components/auth/SuccessStateCard";
import { ensureAppError } from "../../types/errors";
import { useAuthStore } from "../../store/authStore";
import authService from "../../services/api/authService";
import Loading from "../../components/ui/Loading";

interface VerificationState {
  status: "success" | "error" | "pending";
  message: string;
}
const defaultVerificationState: VerificationState = {
  status: "pending",
  message: "Verifying email...",
};

/**
 * Email verification page component
 * Handles verifying user's email with the token from URL
 */
const VerifyEmailPage = () => {
  const [state, setState] = useState<VerificationState>(
    defaultVerificationState
  );
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);
  const verificationAttempted = useRef(false);

  // Email verification mutation
  const verifyMutation = useMutation({
    mutationFn: authService.verifyEmail,
    onSuccess: () => {
      console.log("email verified");
      setState({ status: "success", message: "email verified" });
    },
    onError: (error) => {
      console.log("verification error:", error);
      const appError = ensureAppError(error);
      setState({ status: "error", message: appError.message });
    },
  });

  // Handle user authentication and redirection
  useEffect(() => {
    if (isAuthenticated) {
      navigate("/dashboard", { replace: true });
    }
  }, [isAuthenticated, navigate]);

  // Process the token from URL - only once
  useEffect(() => {
    // Skip if we've already attempted verification
    if (verificationAttempted.current) {
      return;
    }

    const token = searchParams.get("token");
    if (!token) {
      setState({ status: "error", message: "No verification token found" });
      return;
    }

    // Mark that we've attempted verification
    verificationAttempted.current = true;
    verifyMutation.mutate(token);
  }, [searchParams, verifyMutation]); // Removed state from dependencies

  // Render based on current verification status
  const renderContent = () => {
    switch (state.status) {
      case "pending":
        return (
          <Loading
            variant="inline"
            className="items-center justify-center"
            message="Verifying email..."
          />
        );

      case "success":
        return (
          <SuccessStateCard
            title="Email Verified Successfully!"
            message="Your email has been verified and your account is now active."
            icon="success"
            cta={{
              label: "Sign In to Your Account",
              to: "/login",
            }}
          />
        );

      case "error":
        return (
          <SuccessStateCard
            title="Email Verification Failed"
            message={state.message}
            icon="error"
            cta={{
              label: "retry",
              to: "/resend-verification",
            }}
          />
        );

      default:
        return (
          <SuccessStateCard
            title="Email Verification"
            message="Processing your verification request..."
            icon="info"
            iconColor="text-blue-600"
            iconBgColor="bg-blue-100"
          />
        );
    }
  };

  return (
    <AuthCard
      title="Email Verification"
      subtitle="Verify your email address to activate your account"
      footer={
        <AuthFooter
          showLogin
          customText={{
            loginText: "Back to Login",
          }}
        />
      }
    >
      {renderContent()}
    </AuthCard>
  );
};

export default VerifyEmailPage;
