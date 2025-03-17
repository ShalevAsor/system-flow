// src/components/profile/ProfileUpdateForm.tsx
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import LoadingButton from "../ui/LoadingButton";
import FormAlert from "../common/FormAlert";
import FormField from "../common/FormField";
import { useEffect } from "react";
import { ensureAppError } from "../../types/errors";
import { useFormError } from "../../hooks/useFormError";
import { profileSchema } from "../../schemas/profileSchemas";
import { useUser } from "../../hooks/useUser";
import profileService from "../../services/api/profileService";
import { toastSuccess } from "../../utils/toast";

// Infer TypeScript type from the schema
type ProfileFormValues = z.infer<typeof profileSchema>;

/**
 * Profile update form component
 */
const ProfileUpdateForm = () => {
  console.log("ProfileUpdateForm rendered");

  const { data: user } = useUser();
  const queryClient = useQueryClient();

  const { formError, handleFormError, clearFormError } =
    useFormError<ProfileFormValues>();

  // Create the update profile mutation
  const updateProfileMutation = useMutation({
    mutationFn: profileService.updateProfile,
    onSuccess: (updatedUser) => {
      queryClient.setQueryData(["user"], updatedUser);
      toastSuccess("Profile updated successfully!");
    },
  });

  // Initialize React Hook Form with Zod resolver
  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting, isDirty },
  } = useForm<ProfileFormValues>({
    resolver: zodResolver(profileSchema),
    defaultValues: {
      firstName: user?.firstName || "",
      lastName: user?.lastName || "",
    },
  });

  // Reset form when user data changes
  useEffect(() => {
    if (user) {
      reset({
        firstName: user.firstName,
        lastName: user.lastName,
      });
    }
  }, [user, reset]);

  const onSubmit = async (data: ProfileFormValues) => {
    // Clear previous errors
    clearFormError();

    try {
      await updateProfileMutation.mutateAsync({
        firstName: data.firstName,
        lastName: data.lastName,
      });
    } catch (error) {
      const appError = ensureAppError(error);
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

      {/* First Name field */}
      <FormField
        id="firstName"
        label="First Name"
        type="text"
        register={register("firstName")}
        error={errors.firstName?.message}
      />

      {/* Last Name field */}
      <FormField
        id="lastName"
        label="Last Name"
        type="text"
        register={register("lastName")}
        error={errors.lastName?.message}
      />

      {/* Submit button */}
      <LoadingButton
        isLoading={updateProfileMutation.isPending}
        variant="primary"
        label="Update Profile"
        loadingText="Updating..."
        disabled={isSubmitting || !isDirty}
        type="submit"
      />
    </form>
  );
};

export default ProfileUpdateForm;
