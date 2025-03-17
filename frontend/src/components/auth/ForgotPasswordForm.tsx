import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import LoadingButton from "../ui/LoadingButton";
import FormField from "../common/FormField";
import FormAlert from "../common/FormAlert";
import { useFormError } from "../../hooks/useFormError";
import { ensureAppError } from "../../types/errors";
import { toastSuccess } from "../../utils/toast";
import { useAuthStore } from "../../store/authStore";
import authService from "../../services/api/authService";

// Schema for the forgot password form
const forgotPasswordSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>;

interface ForgotPasswordFormProps {
  onSuccess: (email: string) => void;
}

/**
 * Forgot password form component
 */
const ForgotPasswordForm = ({ onSuccess }: ForgotPasswordFormProps) => {
  console.log("ForgotPasswordForm rendered");

  // Get auth store actions
  const clearError = useAuthStore((state) => state.clearError);
  const setError = useAuthStore((state) => state.setError);

  // Form error handling
  const { formError, handleFormError, clearFormError } =
    useFormError<ForgotPasswordFormValues>();

  // Password reset request mutation
  const resetMutation = useMutation({
    mutationFn: authService.requestPasswordReset,
    onSuccess: (_, variables) => {
      onSuccess(variables.email);
      toastSuccess("Password reset email sent successfully");
    },
    onError: (err) => {
      const appError = ensureAppError(err);
      setError(appError);
    },
  });

  // Initialize React Hook Form with Zod resolver
  const {
    register,
    handleSubmit,
    setError: setFormError,
    formState: { errors, isSubmitting },
  } = useForm<ForgotPasswordFormValues>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      email: "",
    },
  });

  // Handle form submission
  const onSubmit = async (data: ForgotPasswordFormValues) => {
    // Clear any previous form errors
    clearFormError();
    clearError();

    try {
      await resetMutation.mutateAsync({ email: data.email });
    } catch (err: unknown) {
      // Convert unknown error to AppError
      const appError = ensureAppError(err);
      // Handle different error types
      handleFormError(appError, setFormError);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6 w-full"
      noValidate
    >
      {/* Global error message */}
      {formError && <FormAlert message={formError} variant="error" />}

      {/* Email field */}
      <FormField
        id="email"
        label="Email"
        type="email"
        autoComplete="email"
        register={register("email")}
        error={errors.email?.message}
      />

      {/* Submit button */}
      <LoadingButton
        isLoading={resetMutation.isPending}
        variant="primary"
        label="Send Reset Link"
        loadingText="Sending..."
        disabled={isSubmitting}
        type="submit"
      />
    </form>
  );
};

export default ForgotPasswordForm;
