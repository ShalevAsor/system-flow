import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "../../hooks/useAuth";
import { registerSchema } from "../../schemas/authSchemas";
import LoadingButton from "../ui/LoadingButton";
import FormAlert from "../common/FormAlert";
import FormField from "../common/FormField";
import { useCallback, useEffect } from "react";
import { useFormError } from "../../hooks/useFormError";
import { toastSuccess } from "../../utils/toast";
import { ensureAppError } from "../../types/errors";

// Infer type from the schema
type RegisterFormValues = z.infer<typeof registerSchema>;

interface RegisterFormProps {
  onRegistrationSuccess: (email: string) => void;
}

/**
 * Register form component with validation
 * Focused only on handling the registration form submission and validation
 */
const RegisterForm = ({ onRegistrationSuccess }: RegisterFormProps) => {
  const { register: registerUser, loading, clearAuthError } = useAuth();
  const { formError, handleFormError, clearFormError } =
    useFormError<RegisterFormValues>();
  // Initialize React Hook Form with Zod resolver
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<RegisterFormValues>({
    resolver: zodResolver(registerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      confirmPassword: "",
    },
  });

  // Clean up errors when component unmounts
  const handleCleanup = useCallback(() => {
    clearAuthError();
  }, [clearAuthError]);
  useEffect(() => {
    return handleCleanup;
  }, [handleCleanup]);

  // Handle form submission
  const onSubmit = async (data: RegisterFormValues) => {
    // Clear previous errors
    clearFormError();
    clearAuthError();

    try {
      await registerUser(
        data.email,
        data.password,
        data.firstName,
        data.lastName
      );
      // Notify parent component of success
      onRegistrationSuccess(data.email);
      toastSuccess("Registration successful , please check your email");
    } catch (err: unknown) {
      // Convert unknown error to AppError
      const appError = ensureAppError(err);
      // Handle different error types
      const errorType = handleFormError(appError, setError);
      console.log("Error type in register form:", errorType);
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

      {/* First and Last Name (side by side on larger screens) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* First Name field */}
        <FormField
          id="firstName"
          label="First Name"
          autoComplete="given-name"
          error={errors.firstName?.message}
          register={register("firstName")}
        />

        {/* Last Name field */}
        <FormField
          id="lastName"
          label="Last Name"
          autoComplete="family-name"
          error={errors.lastName?.message}
          register={register("lastName")}
        />
      </div>

      {/* Email field */}
      <FormField
        id="email"
        label="Email"
        type="email"
        autoComplete="email"
        error={errors.email?.message}
        register={register("email")}
      />

      {/* Password field */}
      <div className="space-y-2">
        <FormField
          id="password"
          label="Password"
          type="password"
          autoComplete="new-password"
          error={errors.password?.message}
          register={register("password")}
        />
        <p className="text-xs text-gray-500">
          Password must be at least 8 characters and include uppercase,
          lowercase, and numbers.
        </p>
      </div>

      {/* Confirm Password field */}
      <FormField
        id="confirmPassword"
        label="Confirm Password"
        type="password"
        autoComplete="new-password"
        error={errors.confirmPassword?.message}
        register={register("confirmPassword")}
      />

      {/* Submit button */}
      <LoadingButton
        isLoading={loading}
        variant="primary"
        label="Create Account"
        loadingText="Creating Account..."
        disabled={isSubmitting}
        type="submit"
      />

      <p className="text-xs text-gray-500 text-center">
        By registering, you'll need to verify your email address before logging
        in.
      </p>
    </form>
  );
};

export default RegisterForm;
