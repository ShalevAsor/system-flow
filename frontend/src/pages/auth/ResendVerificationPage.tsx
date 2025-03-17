import { useState } from "react";
import AuthCard from "../../components/auth/AuthCard";
import AuthFooter from "../../components/auth/AuthFooter";
import ResendVerificationForm from "../../components/auth/ResendVerificationForm";
import SuccessStateCard from "../../components/auth/SuccessStateCard";
import { toastInfo } from "../../utils/toast";

/**
 * Resend verification email page component
 */
const ResendVerificationPage = () => {
  console.log("ResendVerificationPage rendered");

  // Simplified state - just track the current state and email
  const [verificationState, setVerificationState] = useState<
    "form" | "email_sent" | "already_verified"
  >("form");

  const [email, setEmail] = useState("");

  // Handle successful form submission - email sent
  const handleEmailSent = (email: string) => {
    setEmail(email);
    setVerificationState("email_sent");
    toastInfo("Verification email sent successfully!");
  };

  // Handle case where email is already verified
  const handleAlreadyVerified = (email: string) => {
    setEmail(email);
    setVerificationState("already_verified");
    toastInfo("Your email is already verified. You can log in now.");
  };

  // Render the appropriate content based on verification state
  const renderContent = () => {
    switch (verificationState) {
      case "email_sent":
        return (
          <SuccessStateCard
            title="Verification Email Sent"
            message="We've sent a verification email to {email}."
            email={email}
            details="Please check your inbox and click the verification link to activate your account. If you don't see the email, check your spam folder."
            icon="mail"
          />
        );

      case "already_verified":
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

      case "form":
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
      case "email_sent":
        return {
          title: "Verification Email Sent",
          subtitle: "Check your inbox for the verification link",
        };
      case "already_verified":
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
    <AuthCard
      title={title}
      subtitle={subtitle}
      footer={
        <AuthFooter
          showLogin
          showRegister
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

export default ResendVerificationPage;
