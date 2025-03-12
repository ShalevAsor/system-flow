import { useState } from "react";
import { useAuth } from "../../hooks/useAuth";
import LoadingButton from "../ui/LoadingButton";
import FormAlert from "../common/FormAlert";

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
  const { resendVerificationEmail } = useAuth();
  const [resendingEmail, setResendingEmail] = useState(false);
  const [resendSuccess, setResendSuccess] = useState(false);
  const [resendError, setResendError] = useState<string | null>(null);

  // Handle resend verification email
  const handleResendVerification = async () => {
    if (!email) return;

    setResendingEmail(true);
    setResendError(null);

    try {
      await resendVerificationEmail(email);
      setResendSuccess(true);
    } catch (err) {
      console.error("Failed to resend verification email:", err);
      setResendError(
        "Failed to send verification email. Please try again later."
      );
    } finally {
      setResendingEmail(false);
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
        isLoading={resendingEmail}
        variant="secondary"
        label="Resend Verification Email"
        loadingText="Sending..."
        onClick={handleResendVerification}
        disabled={resendingEmail}
        type="button"
      />
    </div>
  );
};

export default EmailVerificationResend;
