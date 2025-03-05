// frontend/src/components/auth/RegisterForm.tsx
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "../../hooks/useAuth";
import { isApiError } from "../../utils/apiUtils";
import { registerSchema } from "../../schemas/authSchemas";
import LoadingButton from "../ui/LoadingButton";
import ErrorAlert from "../ui/ErrorAlert";

// Infer type from the schema
type RegisterFormValues = z.infer<typeof registerSchema>;

/**
 * Register form component with validation
 */
const RegisterForm = () => {
  const { register: registerUser, loading, error } = useAuth();

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

  // Handle form submission
  const onSubmit = async (data: RegisterFormValues) => {
    try {
      await registerUser(
        data.email,
        data.password,
        data.firstName,
        data.lastName
      );
      // Navigation is handled in the register page component
    } catch (err: unknown) {
      if (isApiError(err) && err.response?.data.errors) {
        // Map backend errors to form fields
        const backendErrors = err.response.data.errors;

        Object.keys(backendErrors).forEach((key) => {
          if (key in data) {
            setError(key as keyof RegisterFormValues, {
              type: "server",
              message: backendErrors[key],
            });
          }
        });
      }
    }
  };

  return (
    <form
      onSubmit={handleSubmit(onSubmit)}
      className="space-y-6 w-full"
      noValidate
    >
      {/* Global error message */}
      <ErrorAlert message={error} />

      {/* First and Last Name (side by side on larger screens) */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* First Name field */}
        <div className="space-y-2">
          <label
            htmlFor="firstName"
            className="block text-sm font-medium text-gray-700"
          >
            First Name
          </label>
          <div className="mt-1">
            <input
              id="firstName"
              type="text"
              autoComplete="given-name"
              className={`w-full px-4 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-offset-0 focus:outline-none ${
                errors.firstName
                  ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                  : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              }`}
              {...register("firstName")}
              aria-invalid={errors.firstName ? "true" : "false"}
            />
            {errors.firstName && (
              <p className="mt-1 text-sm text-red-600" role="alert">
                {errors.firstName.message}
              </p>
            )}
          </div>
        </div>

        {/* Last Name field */}
        <div className="space-y-2">
          <label
            htmlFor="lastName"
            className="block text-sm font-medium text-gray-700"
          >
            Last Name
          </label>
          <div className="mt-1">
            <input
              id="lastName"
              type="text"
              autoComplete="family-name"
              className={`w-full px-4 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-offset-0 focus:outline-none ${
                errors.lastName
                  ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                  : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
              }`}
              {...register("lastName")}
              aria-invalid={errors.lastName ? "true" : "false"}
            />
            {errors.lastName && (
              <p className="mt-1 text-sm text-red-600" role="alert">
                {errors.lastName.message}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* Email field */}
      <div className="space-y-2">
        <label
          htmlFor="email"
          className="block text-sm font-medium text-gray-700"
        >
          Email
        </label>
        <div className="mt-1">
          <input
            id="email"
            type="email"
            autoComplete="email"
            className={`w-full px-4 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-offset-0 focus:outline-none ${
              errors.email
                ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            }`}
            {...register("email")}
            aria-invalid={errors.email ? "true" : "false"}
          />
          {errors.email && (
            <p className="mt-1 text-sm text-red-600" role="alert">
              {errors.email.message}
            </p>
          )}
        </div>
      </div>

      {/* Password field */}
      <div className="space-y-2">
        <label
          htmlFor="password"
          className="block text-sm font-medium text-gray-700"
        >
          Password
        </label>
        <div className="mt-1">
          <input
            id="password"
            type="password"
            autoComplete="new-password"
            className={`w-full px-4 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-offset-0 focus:outline-none ${
              errors.password
                ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            }`}
            {...register("password")}
            aria-invalid={errors.password ? "true" : "false"}
          />
          {errors.password && (
            <p className="mt-1 text-sm text-red-600" role="alert">
              {errors.password.message}
            </p>
          )}
        </div>
        <p className="text-xs text-gray-500">
          Password must be at least 8 characters and include uppercase,
          lowercase, and numbers.
        </p>
      </div>

      {/* Confirm Password field */}
      <div className="space-y-2">
        <label
          htmlFor="confirmPassword"
          className="block text-sm font-medium text-gray-700"
        >
          Confirm Password
        </label>
        <div className="mt-1">
          <input
            id="confirmPassword"
            type="password"
            autoComplete="new-password"
            className={`w-full px-4 py-2 border rounded-md shadow-sm focus:ring-2 focus:ring-offset-0 focus:outline-none ${
              errors.confirmPassword
                ? "border-red-300 focus:ring-red-500 focus:border-red-500"
                : "border-gray-300 focus:ring-blue-500 focus:border-blue-500"
            }`}
            {...register("confirmPassword")}
            aria-invalid={errors.confirmPassword ? "true" : "false"}
          />
          {errors.confirmPassword && (
            <p className="mt-1 text-sm text-red-600" role="alert">
              {errors.confirmPassword.message}
            </p>
          )}
        </div>
      </div>

      {/* Submit button */}
      <LoadingButton
        isLoading={loading}
        variant="primary"
        label="Create Account"
        loadingText="Creating Account..."
        disabled={isSubmitting}
        type="submit"
      />
    </form>
  );
};

export default RegisterForm;
