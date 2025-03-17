// src/components/test/ErrorThrower.tsx
import { useEffect, useState } from "react";

interface ErrorThrowerProps {
  shouldThrow?: boolean;
}

const ErrorThrower = ({ shouldThrow = true }: ErrorThrowerProps) => {
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    if (shouldThrow && !hasError) {
      setHasError(true);
    }
  }, [shouldThrow, hasError]);

  if (hasError) {
    throw new Error("Test error thrown from ErrorThrower component");
  }

  return <div>This component will throw an error!</div>;
};

export default ErrorThrower;
