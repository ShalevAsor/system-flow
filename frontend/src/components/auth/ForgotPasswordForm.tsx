// frontend/src/components/auth/ForgotPasswordForm.tsx
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "../../hooks/useAuth";
import LoadingButton from "../ui/LoadingButton";
import FormField from "../common/FormField";
import FormAlert from "../common/FormAlert";
import { useFormError } from "../../hooks/useFormError";
import { ensureAppError } from "../../types/errors";
import { toastSuccess } from "../../utils/toast";

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
  const { requestPasswordReset, loading, clearAuthError } = useAuth();
  const { formError, handleFormError, clearFormError } =
    useFormError<ForgotPasswordFormValues>();
  // Initialize React Hook Form with Zod resolver
  const {
    register,
    handleSubmit,
    setError,
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
    clearAuthError();
    try {
      await requestPasswordReset(data.email);
      onSuccess(data.email);
      toastSuccess("Password reset email sent successfully");
    } catch (err: unknown) {
      // Convert unknown error to AppError
      const appError = ensureAppError(err);
      // Handle different error types
      handleFormError(appError, setError);
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6 w-full"
      noValidate
    >
      {/* Global error message */}
      <FormAlert message={formError} />

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
        isLoading={loading}
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
