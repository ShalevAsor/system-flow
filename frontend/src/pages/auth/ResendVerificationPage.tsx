import { useState } from "react";
import { Link } from "react-router-dom";
import AuthCard from "../../components/auth/AuthCard";
import ResendVerificationForm from "../../components/auth/ResendVerificationForm";
import SuccessStateCard from "../../components/auth/SuccessStateCard";
import { toastInfo } from "../../utils/toast";

/**
 * Enum representing different states of the email verification flow
 */
enum VerificationState {
  FORM = "form",
  EMAIL_SENT = "email_sent",
  ALREADY_VERIFIED = "already_verified",
}

/**
 * Resend verification email page component
 */
const ResendVerificationPage = () => {
  const [verificationState, setVerificationState] = useState<VerificationState>(
    VerificationState.FORM
  );
  const [email, setEmail] = useState("");

  // Handle successful form submission - email sent
  const handleEmailSent = (email: string) => {
    setEmail(email);
    setVerificationState(VerificationState.EMAIL_SENT);
    toastInfo("Verification email sent successfully!");
  };

  // Handle case where email is already verified
  const handleAlreadyVerified = (email: string) => {
    setEmail(email);
    setVerificationState(VerificationState.ALREADY_VERIFIED);
    toastInfo("Your email is already verified. You can log in now.");
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
        Don't have an account?{" "}
        <Link to="/register" className="text-blue-600 hover:text-blue-500">
          Register
        </Link>
      </p>
    </div>
  );

  // Render the appropriate content based on verification state
  const renderContent = () => {
    switch (verificationState) {
      case VerificationState.EMAIL_SENT:
        return (
          <SuccessStateCard
            title="Verification Email Sent"
            message="We've sent a verification email to {email}."
            email={email}
            details="Please check your inbox and click the verification link to activate your account. If you don't see the email, check your spam folder."
            icon="mail"
          />
        );

      case VerificationState.ALREADY_VERIFIED:
        return (
          <SuccessStateCard
            title="Email Already Verified"
            message="The email {email} is already verified."
            email={email}
            details="Your account is ready to use."
            icon="success"
            cta={{
              label: "Go to Login",
              to: "/login",
            }}
          />
        );

      case VerificationState.FORM:
      default:
        return (
          <ResendVerificationForm
            onSuccess={handleEmailSent}
            onAlreadyVerified={handleAlreadyVerified}
          />
        );
    }
  };

  // Determine card title and subtitle based on state
  const getCardTitleInfo = () => {
    switch (verificationState) {
      case VerificationState.EMAIL_SENT:
        return {
          title: "Verification Email Sent",
          subtitle: "Check your inbox for the verification link",
        };
      case VerificationState.ALREADY_VERIFIED:
        return {
          title: "Email Already Verified",
          subtitle: "Your account is ready to use",
        };
      default:
        return {
          title: "Resend Verification Email",
          subtitle: "Enter your email to receive a new verification link",
        };
    }
  };

  const { title, subtitle } = getCardTitleInfo();

  return (
    <AuthCard title={title} subtitle={subtitle} footer={footerContent}>
      {renderContent()}
    </AuthCard>
  );
};

export default ResendVerificationPage;
