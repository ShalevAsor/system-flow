import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import { loginSchema } from "../../schemas/authSchemas";
import LoadingButton from "../ui/LoadingButton";
import FormAlert from "../common/FormAlert";
import FormField from "../common/FormField";
import { ErrorType, ensureAppError } from "../../types/errors";
import { useFormError } from "../../hooks/useFormError";
import { toastSuccess } from "../../utils/toast";
import { useAuthStore } from "../../store/authStore";
import authService from "../../services/api/authService";
import { queryClient } from "../../lib/reactQuery";

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
  console.log("LoginForm rendered");

  // Get auth store actions using selectors - this is key for performance
  const login = useAuthStore((state) => state.login);
  const clearError = useAuthStore((state) => state.clearError);
  const setError = useAuthStore((state) => state.setError);

  const { formError, handleFormError, clearFormError } =
    useFormError<LoginFormValues>();

  // Login mutation with React Query
  const loginMutation = useMutation({
    mutationFn: authService.login,
    onSuccess: (user) => {
      if (user.token) {
        login(user.token);
      }
      queryClient.invalidateQueries({ queryKey: ["user"] });
      toastSuccess("Logged in successfully!");
    },
    onError: (err) => {
      const appError = ensureAppError(err);
      // Use the selector instead of getState() to avoid rerenders
      setError(appError);
    },
  });

  // Initialize React Hook Form with Zod resolver
  const {
    register,
    handleSubmit,
    setError: setFormError,
    formState: { errors, isSubmitting },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "demo07730@gmail.com",
      password: "Aa123456",
    },
  });

  // Handle form submission
  const onSubmit = async (data: LoginFormValues) => {
    // Clear previous errors
    clearFormError();
    clearError();

    try {
      await loginMutation.mutateAsync(data);
    } catch (err) {
      // Convert unknown error to AppError
      const appError = ensureAppError(err);
      // Handle different error types
      const errorType = handleFormError(appError, setFormError);
      // Special case: unverified email
      if (errorType === ErrorType.AUTH_EMAIL_UNVERIFIED) {
        onUnverifiedEmail(data.email);
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

      {/* Email field */}
      <FormField
        id="email"
        label="Email"
        type="email"
        autoComplete="email"
        register={register("email")}
        error={errors.email?.message}
        defaultValue="demo07730@gmail.com"
      />

      {/* Password field */}
      <FormField
        id="password"
        label="Password"
        type="password"
        autoComplete="current-password"
        register={register("password")}
        error={errors.password?.message}
        defaultValue="Aa123456"
      />

      {/* Submit button */}
      <LoadingButton
        isLoading={loginMutation.isPending}
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
