import React from "react";

type ButtonVariant =
  | "primary"
  | "secondary"
  | "success"
  | "danger"
  | "warning"
  | "info";
type ButtonSize = "sm" | "md" | "lg";
type ButtonType = "button" | "submit" | "reset";
export type ButtonProps = {
  label: string;
  type?: ButtonType;
  variant?: ButtonVariant;
  size?: ButtonSize;
  disabled?: boolean;
  fullWidth?: boolean;
  className?: string;
  onClick?: () => void;
  ariaAttributes?: Record<string, string>;
  children?: React.ReactNode;
};

const Button: React.FC<ButtonProps> = ({
  label,
  type = "button",
  variant = "primary",
  size = "md",
  disabled = false,
  fullWidth = true,
  className = "",
  onClick,
  ariaAttributes = {},
  children,
}) => {
  // Variant variations
  const variantClasses = {
    primary: "bg-blue-600 hover:bg-blue-700 focus:ring-blue-500",
    secondary: "bg-gray-600 hover:bg-gray-700 focus:ring-gray-500",
    success: "bg-green-600 hover:bg-green-700 focus:ring-green-500",
    danger: "bg-red-600 hover:bg-red-700 focus:ring-red-500",
    warning: "bg-yellow-600 hover:bg-yellow-700 focus:ring-yellow-500",
    info: "bg-indigo-600 hover:bg-indigo-700 focus:ring-indigo-500",
  };

  // Size variations
  const sizeClasses = {
    sm: "py-1 px-3 text-xs",
    md: "py-2 px-4 text-sm",
    lg: "py-3 px-6 text-base",
  };

  const baseClass =
    "flex justify-center border border-transparent rounded-md shadow-sm font-medium text-white focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors cursor-pointer";

  const widthClass = fullWidth ? "w-full" : "";

  return (
    <button
      type={type}
      disabled={disabled}
      className={`${baseClass} ${variantClasses[variant]} ${sizeClasses[size]} ${widthClass} ${className}`}
      onClick={onClick}
      {...ariaAttributes}
    >
      {children || label}
    </button>
  );
};

export default Button;
