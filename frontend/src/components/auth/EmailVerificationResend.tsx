import { useState } from "react";
import { useMutation } from "@tanstack/react-query";
import LoadingButton from "../ui/LoadingButton";
import FormAlert from "../common/FormAlert";
import authService from "../../services/api/authService";
import { useAuthStore } from "../../store/authStore";
import { ensureAppError } from "../../types/errors";

interface EmailVerificationResendProps {
  email: string;
  successMessage?: string;
  instructionMessage?: string;
}

/**
 * Reusable component for handling email verification resend functionality
 */
const EmailVerificationResend = ({
  email,
  successMessage = "We've sent a new verification email to your address. Please check your inbox.",
  instructionMessage = "Didn't receive the email? Check your spam folder or click below to resend.",
}: EmailVerificationResendProps) => {
  console.log("EmailVerificationResend rendered");

  // Get auth store error handling
  const setError = useAuthStore((state) => state.setError);

  // Local state for component-specific UI
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendError, setResendError] = useState<string | null>(null);

  // Resend verification email mutation
  const resendMutation = useMutation({
    mutationFn: authService.resendVerificationEmail,
    onSuccess: () => {
      setResendSuccess(true);
      setResendError(null);
    },
    onError: (err) => {
      const appError = ensureAppError(err);
      setError(appError);
      setResendError(
        "Failed to send verification email. Please try again later."
      );
    },
  });

  // Handle resend verification email
  const handleResendVerification = async () => {
    if (!email) return;

    setResendError(null);

    try {
      await resendMutation.mutateAsync({ email });
    } catch (err) {
      // Error is already handled in onError callback
      console.error("Failed to resend verification email:", err);
    }
  };

  // Handle close of error alert
  const handleCloseError = () => {
    setResendError(null);
  };

  if (resendSuccess) {
    return <FormAlert message={successMessage} variant="info" />;
  }

  return (
    <div className="text-center">
      {resendError && (
        <FormAlert
          message={resendError}
          variant="error"
          onClose={handleCloseError}
          showCloseButton={true}
        />
      )}
      <p className="text-sm text-gray-600 mb-4">{instructionMessage}</p>
      <LoadingButton
        isLoading={resendMutation.isPending}
        variant="secondary"
        label="Resend Verification Email"
        loadingText="Sending..."
        onClick={handleResendVerification}
        disabled={resendMutation.isPending}
        type="button"
      />
    </div>
  );
};

export default EmailVerificationResend;
