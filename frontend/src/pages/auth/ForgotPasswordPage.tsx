import { useState } from "react";
import AuthCard from "../../components/auth/AuthCard";
import AuthFooter from "../../components/auth/AuthFooter";
import ForgotPasswordForm from "../../components/auth/ForgotPasswordForm";
import SuccessStateCard from "../../components/auth/SuccessStateCard";

/**
 * Forgot password page component
 */
const ForgotPasswordPage = () => {
  // We can use a single piece of state - if email exists, we're in success state
  const [sentToEmail, setSentToEmail] = useState("");

  // Handle successful form submission
  const handleSuccess = (email: string) => {
    setSentToEmail(email);
  };

  // Success state - show after reset email is sent
  if (sentToEmail) {
    return (
      <AuthCard
        title="Reset Link Sent"
        subtitle="Check your inbox for the password reset link"
        footer={
          <AuthFooter
            showLogin
            customText={{
              loginText: "Back to Login",
            }}
          />
        }
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
      footer={
        <AuthFooter
          showLogin
          customText={{
            loginText: "Back to Login",
          }}
        />
      }
    >
      <ForgotPasswordForm onSuccess={handleSuccess} />
    </AuthCard>
  );
};

export default ForgotPasswordPage;
