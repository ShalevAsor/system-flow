// src/components/ui/ErrorMessage.tsx
import { ReactNode } from "react";
import { XCircle, AlertTriangle, AlertOctagon } from "lucide-react";

type ErrorSeverity = "error" | "warning" | "info";

interface ErrorMessageProps {
  /**
   * The title of the error message
   */
  title: string;

  /**
   * The error message to display
   */
  message: string | ReactNode;

  /**
   * The severity of the error
   * @default "error"
   */
  severity?: ErrorSeverity;

  /**
   * Callback for retry action
   */
  onRetry?: () => void;

  /**
   * Text for retry button
   * @default "Try Again"
   */
  retryText?: string;

  /**
   * Additional actions to display
   */
  actions?: ReactNode;

  /**
   * Additional CSS classes
   */
  className?: string;
}

const ErrorMessage = ({
  title,
  message,
  severity = "error",
  onRetry,
  retryText = "Try Again",
  actions,
  className = "",
}: ErrorMessageProps) => {
  // Map severity to colors and icons
  const severityMap = {
    error: {
      bgColor: "bg-red-50",
      iconColor: "text-red-500",
      Icon: XCircle,
    },
    warning: {
      bgColor: "bg-yellow-50",
      iconColor: "text-yellow-500",
      Icon: AlertTriangle,
    },
    info: {
      bgColor: "bg-blue-50",
      iconColor: "text-blue-500",
      Icon: AlertOctagon,
    },
  };

  const { bgColor, iconColor, Icon } = severityMap[severity];

  return (
    <div className={`text-center p-6 ${bgColor} rounded-lg ${className}`}>
      <Icon className={`h-12 w-12 ${iconColor} mx-auto mb-4`} />

      <h2 className="text-xl font-semibold text-gray-800 mb-2">{title}</h2>

      <div className="text-gray-600 mb-4">
        {typeof message === "string" ? <p>{message}</p> : message}
      </div>

      <div className="flex flex-col sm:flex-row justify-center gap-2">
        {onRetry && (
          <button
            onClick={onRetry}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
          >
            {retryText}
          </button>
        )}

        {actions}
      </div>
    </div>
  );
};

export default ErrorMessage;
