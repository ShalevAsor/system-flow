import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import LoadingButton from "../ui/LoadingButton";
import FormAlert from "../common/FormAlert";
import FormField from "../common/FormField";
import { ensureAppError, ErrorType } from "../../types/errors";
import { useFormError } from "../../hooks/useFormError";
import { toastSuccess, toastError } from "../../utils/toast";
import { resetPasswordSchema } from "../../schemas/authSchemas";
import { useAuthStore } from "../../store/authStore";
import authService from "../../services/api/authService";

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
  console.log("ResetPasswordForm rendered");

  // Get auth store actions
  const clearError = useAuthStore((state) => state.clearError);
  const setError = useAuthStore((state) => state.setError);

  const { formError, handleFormError, clearFormError } =
    useFormError<ResetPasswordValues>();

  // Reset password mutation
  const resetMutation = useMutation({
    mutationFn: authService.resetPassword,
    onSuccess: (response) => {
      toastSuccess(response || "Password has been reset successfully!");
      onSuccess();
    },
    onError: (err) => {
      const appError = ensureAppError(err);
      setError(appError);
      toastError(
        appError.message || "Failed to reset password. Please try again."
      );
    },
  });

  // Initialize React Hook Form with Zod resolver
  const {
    register,
    handleSubmit,
    setError: setFormError,
    formState: { errors, isSubmitting },
  } = useForm<ResetPasswordValues>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      password: "",
      confirmPassword: "",
    },
  });

  // Handle form submission
  const onSubmit = async (data: ResetPasswordValues) => {
    // Clear previous errors
    clearFormError();
    clearError();

    try {
      await resetMutation.mutateAsync({
        token,
        newPassword: data.password,
      });
    } catch (err) {
      // Convert unknown error to AppError
      const appError = ensureAppError(err);
      // Handle different error types
      const errorType = handleFormError(appError, setFormError);
      if (errorType === ErrorType.AUTH_INVALID_RESET_TOKEN) {
        onInvalidToken();
      }
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
        isLoading={resetMutation.isPending}
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
