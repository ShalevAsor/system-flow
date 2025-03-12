import { useState } from "react";
import { Link } from "react-router-dom";
import AuthCard from "../../components/auth/AuthCard";
import ForgotPasswordForm from "../../components/auth/ForgotPasswordForm";
import SuccessStateCard from "../../components/auth/SuccessStateCard";

/**
 * Forgot password page component
 */
const ForgotPasswordPage = () => {
  const [isSuccess, setIsSuccess] = useState(false);
  const [sentToEmail, setSentToEmail] = useState("");

  // Handle successful form submission
  const handleSuccess = (email: string) => {
    setIsSuccess(true);
    setSentToEmail(email);
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

  // Success state - show after reset email is sent
  if (isSuccess) {
    return (
      <AuthCard
        title="Reset Link Sent"
        subtitle="Check your inbox for the password reset link"
        footer={footerContent}
      >
        <SuccessStateCard
          title="Reset Link Sent"
          message="We've sent a password reset link to {email}."
          email={sentToEmail}
          details="Please check your inbox and click the link to reset your password. The link will expire in 1 hour for security reasons."
          icon="mail"
        >
          <p className="text-sm text-gray-500">
            If you don't receive an email, check your spam folder or verify that
            you entered the correct email address.
          </p>
        </SuccessStateCard>
      </AuthCard>
    );
  }

  // Form state - show the form to request password reset
  return (
    <AuthCard
      title="Forgot Password"
      subtitle="Enter your email to receive a password reset link"
      footer={footerContent}
    >
      <ForgotPasswordForm onSuccess={handleSuccess} />
    </AuthCard>
  );
};

export default ForgotPasswordPage;
