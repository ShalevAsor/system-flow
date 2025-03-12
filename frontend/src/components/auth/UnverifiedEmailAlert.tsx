import { Link } from "react-router-dom";
import FormAlert from "../common/FormAlert";
import EmailVerificationResend from "./EmailVerificationResend";

interface UnverifiedEmailAlertProps {
  email: string;
  onBackToLogin?: () => void;
}

/**
 * Component that handles the unverified email flow
 * Shows a warning message and provides option to resend verification email
 */
const UnverifiedEmailAlert = ({
  email,
  onBackToLogin,
}: UnverifiedEmailAlertProps) => {
  return (
    <div className="space-y-6 w-full">
      <FormAlert
        message={`The email address ${email} has not been verified yet. Please check your inbox for the verification email and click the link to verify your account.`}
        variant="warning"
      />

      <EmailVerificationResend email={email} />

      <div className="border-t border-gray-200 pt-4 text-center">
        {onBackToLogin ? (
          <button
            onClick={onBackToLogin}
            className="text-sm font-medium text-blue-600 hover:text-blue-500"
          >
            Back to Login
          </button>
        ) : (
          <Link
            to="/login"
            className="text-sm font-medium text-blue-600 hover:text-blue-500"
          >
            Back to Login
          </Link>
        )}
      </div>
    </div>
  );
};

export default UnverifiedEmailAlert;
