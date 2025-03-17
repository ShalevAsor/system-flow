import { Loader } from "lucide-react";

type LoadingSize = "sm" | "md" | "lg";
type LoadingVariant = "inline" | "fullPage" | "content";

interface LoadingProps {
  /**
   * Size of the loading spinner
   * @default "md"
   */
  size?: LoadingSize;

  /**
   * Loading message to display
   * @default "Loading..."
   */
  message?: string;

  /**
   * Display variant of the loading spinner
   * @default "inline"
   */
  variant?: LoadingVariant;

  /**
   * Additional CSS classes
   */
  className?: string;
}

const Loading = ({
  size = "md",
  message = "Loading...",
  variant = "inline",
  className = "",
}: LoadingProps) => {
  // Size mapping for the spinner
  const sizeMap = {
    sm: "h-4 w-4",
    md: "h-8 w-8",
    lg: "h-12 w-12",
  };

  // Text size mapping
  const textSizeMap = {
    sm: "text-xs",
    md: "text-sm",
    lg: "text-base",
  };

  // Get the spinner and text size classes
  const spinnerSize = sizeMap[size];
  const textSize = textSizeMap[size];

  // Handle the inline variant (just spinner and text)
  if (variant === "inline") {
    return (
      <div className={`flex items-center ${className}`}>
        <Loader className={`${spinnerSize} text-blue-600 animate-spin`} />
        {message && (
          <span className={`ml-2 ${textSize} text-gray-600`}>{message}</span>
        )}
      </div>
    );
  }

  // Handle the full page variant (centered in viewport)
  if (variant === "fullPage") {
    return (
      <div className="fixed inset-0 flex items-center justify-center bg-white bg-opacity-80 z-50">
        <div className="text-center">
          <Loader
            className={`${spinnerSize} text-blue-600 animate-spin mx-auto`}
          />
          {message && (
            <p className={`mt-2 ${textSize} text-gray-600`}>{message}</p>
          )}
        </div>
      </div>
    );
  }

  // Handle the content area variant (centered in parent with minimum height)
  return (
    <div
      className={`flex items-center justify-center min-h-[200px] w-full ${className}`}
    >
      <div className="text-center">
        <Loader
          className={`${spinnerSize} text-blue-600 animate-spin mx-auto`}
        />
        {message && (
          <p className={`mt-2 ${textSize} text-gray-600`}>{message}</p>
        )}
      </div>
    </div>
  );
};

export default Loading;
