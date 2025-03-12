// frontend/src/components/auth/RegistrationSuccessAlert.tsx
import SuccessStateCard from "./SuccessStateCard";
import EmailVerificationResend from "./EmailVerificationResend";

interface RegistrationSuccessAlertProps {
  email: string;
}

/**
 * Component to display after successful registration
 * Shows success message and verification email resend option
 */
const RegistrationSuccessAlert = ({ email }: RegistrationSuccessAlertProps) => {
  return (
    <SuccessStateCard
      title="Registration Successful"
      message="We've sent a verification email to {email}. Please check your inbox and click the verification link to activate your account."
      email={email}
      icon="mail"
    >
      <div className="mt-4">
        <EmailVerificationResend
          email={email}
          successMessage="We've sent you another verification email. Please check your inbox."
        />
      </div>
    </SuccessStateCard>
  );
};

export default RegistrationSuccessAlert;
