import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import LoadingButton from "../ui/LoadingButton";
import FormAlert from "../common/FormAlert";
import FormField from "../common/FormField";
import { useFormError } from "../../hooks/useFormError";
import { toastError } from "../../utils/toast";
import { ensureAppError } from "../../types/errors";
import { useAuthStore } from "../../store/authStore";
import authService from "../../services/api/authService";

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
  console.log("ResendVerificationForm rendered");

  // Get auth store actions
  const clearError = useAuthStore((state) => state.clearError);
  const setError = useAuthStore((state) => state.setError);

  // Form error handling
  const { formError, handleFormError, clearFormError } =
    useFormError<ResendFormValues>();

  // Resend email mutation with React Query
  const resendMutation = useMutation({
    mutationFn: authService.resendVerificationEmail,
    onSuccess: (response, variables) => {
      console.log("response in resendMutation", response);
      // Check if response indicates email is already verified
      if (response && response.toLowerCase().includes("already verified")) {
        onAlreadyVerified(variables.email);
        console.log("visited in already verified");
      } else {
        onSuccess(variables.email);
      }
    },
    onError: (err) => {
      const appError = ensureAppError(err);
      setError(appError);
      toastError(appError.message || "Failed to send verification email");
    },
  });

  // Initialize React Hook Form with Zod resolver
  const {
    register,
    handleSubmit,
    setError: setFormError,
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
    clearError();

    try {
      await resendMutation.mutateAsync({ email: data.email });
    } catch (err) {
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
        isLoading={resendMutation.isPending}
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
