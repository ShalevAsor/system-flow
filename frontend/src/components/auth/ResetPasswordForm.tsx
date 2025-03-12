// src/components/auth/ResetPasswordForm.tsx
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "../../hooks/useAuth";
import LoadingButton from "../ui/LoadingButton";
import FormAlert from "../common/FormAlert";
import FormField from "../common/FormField";
import { useCallback, useEffect } from "react";
import { ensureAppError, ErrorType } from "../../types/errors";
import { useFormError } from "../../hooks/useFormError";
import { toastSuccess, toastError } from "../../utils/toast";
import { resetPasswordSchema } from "../../schemas/authSchemas";

// Infer TypeScript type from the schema
type ResetPasswordValues = z.infer<typeof resetPasswordSchema>;

interface ResetPasswordFormProps {
  token: string;
  onSuccess: () => void;
  onInvalidToken: () => void;
}

/**
 * Reset password form component with validation
 */
const ResetPasswordForm = ({
  token,
  onSuccess,
  onInvalidToken,
}: ResetPasswordFormProps) => {
  const { resetPassword, loading, clearAuthError } = useAuth();
  const { formError, handleFormError, clearFormError } =
    useFormError<ResetPasswordValues>();

  // Initialize React Hook Form with Zod resolver
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  const handleCleanup = useCallback(() => {
    clearAuthError();
  }, [clearAuthError]);

  useEffect(() => {
    return handleCleanup;
  }, [handleCleanup]);

  // Handle form submission
  const onSubmit = async (data: ResetPasswordValues) => {
    // Clear previous errors
    clearFormError();
    clearAuthError();

    try {
      const message = await resetPassword(token, data.password);
      toastSuccess(message || "Password has been reset successfully!");
      onSuccess();
    } catch (err) {
      // Convert unknown error to AppError
      const appError = ensureAppError(err);
      // Handle different error types
      const errorType = handleFormError(appError, setError);
      if (errorType === ErrorType.AUTH_INVALID_RESET_TOKEN) {
        onInvalidToken();
      }
      toastError(
        appError.message || "Failed to reset password. Please try again."
      );
    }
  };

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

      {/* Password field */}
      <FormField
        id="password"
        label="New Password"
        type="password"
        autoComplete="new-password"
        register={register("password")}
        error={errors.password?.message}
      />

      {/* Confirm Password field */}
      <FormField
        id="confirmPassword"
        label="Confirm New Password"
        type="password"
        autoComplete="new-password"
        register={register("confirmPassword")}
        error={errors.confirmPassword?.message}
      />

      {/* Submit button */}
      <LoadingButton
        isLoading={loading}
        variant="primary"
        label="Reset Password"
        loadingText="Resetting password..."
        disabled={isSubmitting}
        type="submit"
      />
    </form>
  );
};

export default ResetPasswordForm;
