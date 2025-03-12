import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "../../hooks/useAuth";
import LoadingButton from "../ui/LoadingButton";
import FormAlert from "../common/FormAlert";
import FormField from "../common/FormField";
import { useFormError } from "../../hooks/useFormError";
import { toastError } from "../../utils/toast";
import { ensureAppError } from "../../types/errors";

// Schema for the resend form
const resendSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
});

type ResendFormValues = z.infer<typeof resendSchema>;

interface ResendVerificationFormProps {
  onSuccess: (email: string) => void;
  onAlreadyVerified: (email: string) => void;
}

/**
 * Resend verification email form component
 */
const ResendVerificationForm = ({
  onSuccess,
  onAlreadyVerified,
}: ResendVerificationFormProps) => {
  const { resendVerificationEmail, loading, clearAuthError } = useAuth();
  const { formError, handleFormError, clearFormError } =
    useFormError<ResendFormValues>();

  // Initialize React Hook Form with Zod resolver
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<ResendFormValues>({
    resolver: zodResolver(resendSchema),
    defaultValues: {
      email: "",
    },
  });

  // Handle form submission
  const onSubmit = async (data: ResendFormValues) => {
    // Clear previous errors
    clearFormError();
    clearAuthError();

    try {
      const message = await resendVerificationEmail(data.email);

      // Check if response indicates email is already verified
      if (message && message.toLowerCase().includes("already verified")) {
        onAlreadyVerified(data.email);
      } else {
        onSuccess(data.email);
      }
    } catch (err) {
      // Convert unknown error to AppError
      const appError = ensureAppError(err);
      // Handle different error types
      handleFormError(appError, setError);
      toastError(appError.message || "Failed to send verification email");
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6 w-full"
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

      {/* Submit button */}
      <LoadingButton
        isLoading={loading}
        variant="primary"
        label="Send Verification Email"
        loadingText="Sending..."
        disabled={isSubmitting}
        type="submit"
      />
    </form>
  );
};

export default ResendVerificationForm;
