import { useEffect, useState, useCallback, useRef } from "react";
import { useSearchParams, Link, useNavigate } from "react-router-dom";
import { useAuth } from "../../hooks/useAuth";
import AuthCard from "../../components/auth/AuthCard";
import SuccessStateCard from "../../components/auth/SuccessStateCard";
import { Loader } from "lucide-react";
import { ensureAppError } from "../../types/errors";

/**
 * Email verification page component
 * Handles verifying user's email with the token from URL
 */
const VerifyEmailPage = () => {
  const [searchParams] = useSearchParams();
  const { verifyEmail, user } = useAuth();
  const navigate = useNavigate();
  const hasAttemptedVerification = useRef(false);
  const [verificationState, setVerificationState] = useState<
    "loading" | "success" | "error" | "idle"
  >("idle");
  const [errorMessage, setErrorMessage] = useState<string>("");
  const [tokenValue, setTokenValue] = useState<string>("");

  // If user is already logged in and verified, redirect to dashboard
  useEffect(() => {
    if (user?.isEmailVerified) {
      navigate("/dashboard", { replace: true });
    }
  }, [user, navigate]);

  // Handle email verification - wrapped in useCallback to prevent recreating on each render
  const handleVerification = useCallback(
    async (token: string) => {
      // Don't try to verify if we're already loading or succeeded
      if (verificationState === "loading" || verificationState === "success") {
        return;
      }

      setVerificationState("loading");

      try {
        console.log("Verifying email with token:", token);
        await verifyEmail(token);
        setVerificationState("success");
      } catch (error) {
        setVerificationState("error");
        const appError = ensureAppError(error);
        setErrorMessage(appError.message);
      }
    },
    [verifyEmail, verificationState]
  );

  // Automatically verify email if token is present
  useEffect(() => {
    const token = searchParams.get("token");

    if (
      token &&
      verificationState === "idle" &&
      !hasAttemptedVerification.current
    ) {
      hasAttemptedVerification.current = true;
      setTokenValue(token);
      handleVerification(token);
    }
  }, [searchParams, handleVerification, verificationState]);

  // Manual verification (for retry)
  const retryVerification = () => {
    if (tokenValue) {
      // Reset state to allow retrying
      setVerificationState("idle");
      handleVerification(tokenValue);
    }
  };

  // Footer links
  const footerContent = (
    <div className="text-center space-y-2">
      <p className="text-gray-600">
        <Link
          to="/login"
          className="text-blue-600 hover:text-blue-500 font-medium"
        >
          Back to Login
        </Link>
      </p>
      <p className="text-gray-600 text-sm">
        Need help?{" "}
        <a href="#" className="text-blue-600 hover:text-blue-500">
          Contact Support
        </a>
      </p>
    </div>
  );

  // Render the appropriate content based on verification state
  const renderContent = () => {
    switch (verificationState) {
      case "loading":
        return (
          <div className="text-center py-8">
            <div className="rounded-full h-12 w-12 bg-blue-100 flex items-center justify-center mx-auto mb-4">
              <Loader className="h-8 w-8 text-blue-600 animate-spin" />
            </div>
            <p className="text-gray-600">Verifying your email address...</p>
          </div>
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
            title="Verification Failed"
            message={
              errorMessage ||
              "The verification link may have expired or is invalid."
            }
            icon="error"
          >
            <div className="space-y-4 mt-4">
              <button
                onClick={retryVerification}
                className="text-blue-600 hover:text-blue-800 font-medium"
              >
                Try Again
              </button>

              <div className="pt-2">
                <Link to="/resend-verification" className="inline-block w-full">
                  <button
                    className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded transition-colors"
                    type="button"
                  >
                    Request New Verification Link
                  </button>
                </Link>
              </div>
            </div>
          </SuccessStateCard>
        );

      default:
        return (
          <SuccessStateCard
            title="Email Verification Required"
            message="No verification token found. Please check your email for the verification link or request a new one."
            icon="info"
            iconColor="text-blue-600"
            iconBgColor="bg-blue-100"
            cta={{
              label: "Request Verification Link",
              to: "/resend-verification",
            }}
          />
        );
    }
  };

  return (
    <AuthCard
      title="Email Verification"
      subtitle="Verify your email address to activate your account"
      footer={footerContent}
    >
      {renderContent()}
    </AuthCard>
  );
};

export default VerifyEmailPage;
