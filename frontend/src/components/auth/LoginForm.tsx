// frontend/src/components/auth/LoginForm.tsx
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "../../hooks/useAuth";
import { loginSchema } from "../../schemas/authSchemas";
import LoadingButton from "../ui/LoadingButton";
import FormAlert from "../common/FormAlert";
import FormField from "../common/FormField";
import { Link } from "react-router-dom";
import { useCallback, useEffect } from "react";
import { ErrorType, ensureAppError } from "../../types/errors";
import { useFormError } from "../../hooks/useFormError";
import { toastSuccess } from "../../utils/toast";

// Infer TypeScript type from the schema
type LoginFormValues = z.infer<typeof loginSchema>;

interface LoginFormProps {
  onUnverifiedEmail: (email: string) => void;
}

/**
 * Login form component with validation
 * Focused only on handling the login form submission and validation
 */
const LoginForm = ({ onUnverifiedEmail }: LoginFormProps) => {
  const { login, loading, clearAuthError } = useAuth();
  const { formError, handleFormError, clearFormError } =
    useFormError<LoginFormValues>();

  // Initialize React Hook Form with Zod resolver
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const handleCleanup = useCallback(() => {
    clearAuthError();
  }, [clearAuthError]);

  useEffect(() => {
    return handleCleanup;
  }, [handleCleanup]);
  // Handle form submission
  const onSubmit = async (data: LoginFormValues) => {
    // Clear previous errors
    clearFormError();
    clearAuthError();

    try {
      await login(data.email, data.password);
      // Navigation is handled in the login page component
      toastSuccess("Logged in successfully!");
    } catch (err) {
      // Convert unknown error to AppError
      const appError = ensureAppError(err);
      // Handle different error types
      const errorType = handleFormError(appError, setError);
      // Special case: unverified email
      if (errorType === ErrorType.AUTH_EMAIL_UNVERIFIED) {
        onUnverifiedEmail(data.email);
      }
    }
  };

  // Forgot password link for password field
  const forgotPasswordLink = (
    <Link
      to="/forgot-password"
      className="text-sm font-medium text-blue-600 hover:text-blue-500"
    >
      Forgot password?
    </Link>
  );

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6 w-full max-w-md"
      noValidate
    >
      {/* Form-level error message with close button */}
      {formError && (
        <FormAlert
          message={formError}
          variant="error"
          onClose={clearFormError}
          showCloseButton={true}
        />
      )}

      {/* Email field */}
      <FormField
        id="email"
        label="Email"
        type="email"
        autoComplete="email"
        register={register("email")}
        error={errors.email?.message}
      />

      {/* Password field */}
      <FormField
        id="password"
        label="Password"
        type="password"
        autoComplete="current-password"
        register={register("password")}
        error={errors.password?.message}
        renderRight={forgotPasswordLink}
      />

      {/* Submit button */}
      <LoadingButton
        isLoading={loading}
        variant="primary"
        label="Sign in"
        loadingText="Logging in..."
        disabled={isSubmitting}
        type="submit"
      />
    </form>
  );
};

export default LoginForm;
