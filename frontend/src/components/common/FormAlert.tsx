import { useEffect, useState } from "react";
import { AlertCircle, AlertTriangle, CheckCircle, Info, X } from "lucide-react";

type AlertVariant = "error" | "warning" | "success" | "info";

interface FormAlertProps {
  message: string | null;
  variant?: AlertVariant;
  onClose?: () => void;
  autoHideDuration?: number;
  showCloseButton?: boolean;
}

/**
 * Multi-purpose alert component with different variants
 * Supports auto-hide and manual dismissal
 * Uses Lucide React icons for a cleaner implementation
 */
const FormAlert = ({
  message,
  variant = "error",
  onClose,
  autoHideDuration = 0, // 0 means no auto-hide
  showCloseButton = false,
}: FormAlertProps) => {
  const [visible, setVisible] = useState(false);
  const [localMessage, setLocalMessage] = useState<string | null>(null);

  // Handle message changes and auto-hide
  useEffect(() => {
    // If we have a new message, show the alert
    if (message) {
      setVisible(true);
      setLocalMessage(message);

      // Set up auto-hide timer if duration is provided
      if (autoHideDuration > 0) {
        const timer = setTimeout(() => {
          setVisible(false);
          if (onClose) onClose();
        }, autoHideDuration);

        return () => clearTimeout(timer);
      }
    } else {
      // If message is cleared, hide the alert
      setVisible(false);
      setLocalMessage(null);
    }
  }, [message, autoHideDuration, onClose]);

  // Handle close button click
  const handleClose = () => {
    setVisible(false);
    if (onClose) onClose();
  };

  if (!visible || !localMessage) {
    return null;
  }

  // Configure variant-specific styles and icons
  const variantStyles = {
    error: {
      container: "bg-red-50",
      icon: "text-red-400",
      title: "text-red-800",
      message: "text-red-700",
      button:
        "bg-red-50 text-red-500 hover:bg-red-100 focus:ring-red-600 focus:ring-offset-red-50",
    },
    warning: {
      container: "bg-yellow-50",
      icon: "text-yellow-400",
      title: "text-yellow-800",
      message: "text-yellow-700",
      button:
        "bg-yellow-50 text-yellow-500 hover:bg-yellow-100 focus:ring-yellow-600 focus:ring-offset-yellow-50",
    },
    success: {
      container: "bg-green-50",
      icon: "text-green-400",
      title: "text-green-800",
      message: "text-green-700",
      button:
        "bg-green-50 text-green-500 hover:bg-green-100 focus:ring-green-600 focus:ring-offset-green-50",
    },
    info: {
      container: "bg-blue-50",
      icon: "text-blue-400",
      title: "text-blue-800",
      message: "text-blue-700",
      button:
        "bg-blue-50 text-blue-500 hover:bg-blue-100 focus:ring-blue-600 focus:ring-offset-blue-50",
    },
  };

  const styles = variantStyles[variant];

  // Lucide icons for each variant
  const icons = {
    error: <AlertCircle className={`h-5 w-5 ${styles.icon}`} />,
    warning: <AlertTriangle className={`h-5 w-5 ${styles.icon}`} />,
    success: <CheckCircle className={`h-5 w-5 ${styles.icon}`} />,
    info: <Info className={`h-5 w-5 ${styles.icon}`} />,
  };

  // Title for each variant
  const titles = {
    error: "Error",
    warning: "Warning",
    success: "Success",
    info: "Information",
  };

  return (
    <div className={`rounded-md ${styles.container} p-4 mb-4`}>
      <div className="flex">
        <div className="flex-shrink-0">{icons[variant]}</div>
        <div className="ml-3">
          <h3 className={`text-sm font-medium ${styles.title}`}>
            {titles[variant]}
          </h3>
          <div className={`mt-2 text-sm ${styles.message}`}>{localMessage}</div>
        </div>
        {showCloseButton && (
          <div className="ml-auto pl-3">
            <div className="-mx-1.5 -my-1.5">
              <button
                type="button"
                className={`inline-flex rounded-md ${styles.button} p-1.5 focus:outline-none focus:ring-2 focus:ring-offset-2`}
                onClick={handleClose}
              >
                <span className="sr-only">Dismiss</span>
                <X className="h-5 w-5" />
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default FormAlert;
