// frontend/src/components/auth/LoginForm.tsx
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "../../hooks/useAuth";
import { isApiError } from "../../utils/apiUtils";
import { loginSchema } from "../../schemas/authSchemas";
import LoadingButton from "../ui/LoadingButton";
import ErrorAlert from "../ui/ErrorAlert";

// Infer TypeScript type from the schema
type LoginFormValues = z.infer<typeof loginSchema>;

/**
 * Login form component with validation
 */
const LoginForm = () => {
  const { login, loading, error } = useAuth();

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

  // Handle form submission
  const onSubmit = async (data: LoginFormValues) => {
    try {
      await login(data.email, data.password);
      // Navigation is handled in the login page component
    } catch (err: unknown) {
      if (isApiError(err) && err.response?.data.errors) {
        // Map backend errors to form fields
        const backendErrors = err.response.data.errors;

        Object.keys(backendErrors).forEach((key) => {
          if (key === "email" || key === "password") {
            setError(key as keyof LoginFormValues, {
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
      className="space-y-6 w-full max-w-md"
      noValidate
    >
      {/* Global error message */}
      <ErrorAlert message={error} />

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
        <div className="flex items-center justify-between">
          <label
            htmlFor="password"
            className="block text-sm font-medium text-gray-700"
          >
            Password
          </label>
          <a
            href="#"
            className="text-sm font-medium text-blue-600 hover:text-blue-500"
          >
            Forgot password?
          </a>
        </div>
        <div className="mt-1">
          <input
            id="password"
            type="password"
            autoComplete="current-password"
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
      </div>

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
