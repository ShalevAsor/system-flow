// src/components/profile/ChangePasswordForm.tsx
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import LoadingButton from "../ui/LoadingButton";
import FormAlert from "../common/FormAlert";
import FormField from "../common/FormField";
import { ensureAppError } from "../../types/errors";
import { useFormError } from "../../hooks/useFormError";
import { changePasswordSchema } from "../../schemas/profileSchemas";
import profileService from "../../services/api/profileService";
import { toastSuccess } from "../../utils/toast";

// Infer TypeScript type from the schema
type ChangePasswordFormValues = z.infer<typeof changePasswordSchema>;

/**
 * Change password form component
 */
const ChangePasswordForm = () => {
  console.log("ChangePasswordForm rendered");

  const { formError, handleFormError, clearFormError } =
    useFormError<ChangePasswordFormValues>();

  // Create the change password mutation
  const changePasswordMutation = useMutation({
    mutationFn: profileService.changePassword,
    onSuccess: (message) => {
      toastSuccess(message || "Password has been changed successfully");
    },
  });

  // Initialize React Hook Form with Zod resolver
  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<ChangePasswordFormValues>({
    resolver: zodResolver(changePasswordSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Handle form submission
  const onSubmit = async (data: ChangePasswordFormValues) => {
    clearFormError();

    try {
      await changePasswordMutation.mutateAsync({
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });

      // Reset form on success
      reset();
    } catch (err) {
      const appError = ensureAppError(err);
      handleFormError(appError, setError);
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

      {/* Current Password field */}
      <FormField
        id="currentPassword"
        label="Current Password"
        type="password"
        register={register("currentPassword")}
        error={errors.currentPassword?.message}
      />

      {/* New Password field */}
      <FormField
        id="newPassword"
        label="New Password"
        type="password"
        register={register("newPassword")}
        error={errors.newPassword?.message}
      />

      {/* Confirm Password field */}
      <FormField
        id="confirmPassword"
        label="Confirm New Password"
        type="password"
        register={register("confirmPassword")}
        error={errors.confirmPassword?.message}
      />

      {/* Submit button */}
      <LoadingButton
        isLoading={changePasswordMutation.isPending}
        variant="primary"
        label="Change Password"
        loadingText="Changing Password..."
        disabled={isSubmitting}
        type="submit"
      />
    </form>
  );
};

export default ChangePasswordForm;
