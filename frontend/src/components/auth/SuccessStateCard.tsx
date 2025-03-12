import { ReactNode } from "react";
import { Link } from "react-router-dom";
import LoadingButton from "../ui/LoadingButton";
import {
  CheckCircle,
  XCircle,
  AlertCircle,
  Mail,
  Info,
  LucideIcon,
} from "lucide-react";

export interface SuccessStateCardProps {
  /**
   * Title of the success message
   */
  title: string;
  /**
   * Primary success message to display
   */
  message: string;
  /**
   * Optional additional details to display below the main message
   */
  details?: string;
  /**
   * Optional call-to-action button configuration
   */
  cta?: {
    label: string;
    to: string;
  };
  /**
   * Optional email address to highlight in the message
   * (will replace {email} in the message string if present)
   */
  email?: string;
  /**
   * Icon options - either a predefined type or custom icon component
   */
  icon?: "success" | "error" | "warning" | "mail" | "info" | LucideIcon;
  /**
   * Icon color - default is based on the icon type
   */
  iconColor?: string;
  /**
   * Icon background color - default is based on the icon type
   */
  iconBgColor?: string;
  /**
   * Optional additional content to render below the message
   */
  children?: ReactNode;
}

/**
 * A reusable component for displaying success states after form submissions
 * Particularly useful for auth flows like password reset, email verification, etc.
 */
const SuccessStateCard = ({
  title,
  message,
  details,
  cta,
  email,
  icon = "success",
  iconColor,
  iconBgColor,
  children,
}: SuccessStateCardProps) => {
  // Format the message to include the email if provided
  const formattedMessage = email
    ? message.replace("{email}", `<strong>${email}</strong>`)
    : message;

  // Determine icon and colors based on the icon prop
  const getIconConfig = () => {
    // Default configurations based on icon type
    const configs = {
      success: {
        icon: CheckCircle,
        color: "text-green-600",
        bgColor: "bg-green-100",
      },
      error: {
        icon: XCircle,
        color: "text-red-600",
        bgColor: "bg-red-100",
      },
      warning: {
        icon: AlertCircle,
        color: "text-yellow-600",
        bgColor: "bg-yellow-100",
      },
      mail: {
        icon: Mail,
        color: "text-blue-600",
        bgColor: "bg-blue-100",
      },
      info: {
        icon: Info,
        color: "text-blue-600",
        bgColor: "bg-blue-100",
      },
    };

    // If it's a string (predefined type), use from configs
    if (typeof icon === "string") {
      return configs[icon as keyof typeof configs];
    }

    // If it's a custom icon component
    const IconComponent = icon;
    return {
      icon: IconComponent,
      color: iconColor || "text-blue-600",
      bgColor: iconBgColor || "bg-blue-100",
    };
  };

  const { icon: IconComponent, color, bgColor } = getIconConfig();

  return (
    <div className="text-center py-8">
      {/* Icon */}
      <div
        className={`rounded-full h-12 w-12 ${
          iconBgColor || bgColor
        } flex items-center justify-center mx-auto mb-4`}
      >
        <IconComponent
          className={`h-8 w-8 ${iconColor || color}`}
          strokeWidth={2}
        />
      </div>

      {/* Title  */}
      {title && (
        <h3 className="text-lg font-semibold text-gray-800 mb-3">{title}</h3>
      )}

      {/* Main Message */}
      <p
        className="text-gray-600 mb-4"
        dangerouslySetInnerHTML={{ __html: formattedMessage }}
      />

      {/* Optional Details */}
      {details && <p className="text-gray-600 mb-6">{details}</p>}

      {/* Optional Custom Content */}
      {children && <div className="mb-6">{children}</div>}

      {/* Call to Action Button */}
      {cta && (
        <Link to={cta.to}>
          <LoadingButton
            isLoading={false}
            variant="primary"
            label={cta.label}
            type="button"
          />
        </Link>
      )}
    </div>
  );
};

export default SuccessStateCard;
