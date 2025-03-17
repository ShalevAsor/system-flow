import React from "react";
import { Link } from "react-router-dom";

type AuthFooterProps = {
  showLogin?: boolean;
  showRegister?: boolean;
  showForgotPassword?: boolean;
  showResendVerification?: boolean;
  customText?: {
    loginText?: string;
    registerText?: string;
    resendVerificationText?: string;
    forgotPasswordText?: string;
  };
};

/**
 * Reusable footer component for auth pages with configurable links
 */
const AuthFooter: React.FC<AuthFooterProps> = ({
  showLogin = false,
  showRegister = false,
  showForgotPassword = false,
  showResendVerification = false,
  customText = {},
}) => {
  // Default text with ability to override
  const {
    loginText = "Sign in",
    registerText = "Create an account",
    resendVerificationText = "Resend verification email",
    forgotPasswordText = "Reset password",
  } = customText;

  return (
    <div className="space-y-2">
      {showLogin && (
        <p className="text-gray-600">
          Already have an account?{" "}
          <Link
            to="/login"
            className="text-blue-600 hover:text-blue-500 font-medium"
          >
            {loginText}
          </Link>
        </p>
      )}

      {showRegister && (
        <p className="text-gray-600">
          Don't have an account?{" "}
          <Link
            to="/register"
            className="text-blue-600 hover:text-blue-500 font-medium"
          >
            {registerText}
          </Link>
        </p>
      )}

      {(showForgotPassword || showResendVerification) && (
        <p className="text-gray-600 text-sm">
          {showResendVerification && (
            <Link
              to="/resend-verification"
              className="text-blue-600 hover:text-blue-500"
            >
              {resendVerificationText}
            </Link>
          )}
          {showResendVerification && showForgotPassword && " • "}
          {showForgotPassword && (
            <Link
              to="/forgot-password"
              className="text-blue-600 hover:text-blue-500"
            >
              {forgotPasswordText}
            </Link>
          )}
        </p>
      )}
    </div>
  );
};

export default AuthFooter;
