import React from "react";

type ErrorAlertProps = {
  message: string | null;
  className?: string;
};

const ErrorAlert: React.FC<ErrorAlertProps> = ({ message, className = "" }) => {
  if (!message) return null;

  return (
    <div
      className={`p-3 rounded-md bg-red-50 border border-red-200 text-red-700 text-sm ${className}`}
    >
      {message}
    </div>
  );
};

export default ErrorAlert;
