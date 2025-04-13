// src/components/flow/SaveFlowModal.tsx
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation } from "@tanstack/react-query";
import FormField from "../common/FormField";
import Button from "../ui/Button";
import LoadingButton from "../ui/LoadingButton";
import FormAlert from "../common/FormAlert";
import { useFormError } from "../../hooks/useFormError";
import { ensureAppError } from "../../types/errors";
import { useFlowStore } from "../../store/flowStore";
import flowService from "../../services/api/flowService";
import { toastSuccess } from "../../utils/toast";
import { queryClient } from "../../lib/reactQuery";

// Form validation schema
const saveFlowSchema = z.object({
  name: z.string().min(3, "Name must be at least 3 characters"),
  description: z.string().min(6, "Description must be at least 6 characters"),
});

type SaveFlowFormValues = z.infer<typeof saveFlowSchema>;

interface SaveFlowModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const SaveFlowModal = ({ isOpen, onClose }: SaveFlowModalProps) => {
  const { nodes, edges } = useFlowStore();
  const { formError, handleFormError, clearFormError } =
    useFormError<SaveFlowFormValues>();

  // Setup form
  const {
    register,
    handleSubmit,
    setError,
    reset,
    formState: { errors, isSubmitting },
  } = useForm<SaveFlowFormValues>({
    resolver: zodResolver(saveFlowSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  });

  // Save flow mutation
  const saveFlowMutation = useMutation({
    mutationFn: (formData: SaveFlowFormValues) =>
      flowService.saveFlow({
        ...formData,
        nodes,
        edges,
      }),
    onSuccess: () => {
      reset();
      toastSuccess("Flow saved successfully!");
      queryClient.invalidateQueries({ queryKey: ["flows"] });
      onClose();
    },
  });

  // Form submission handler
  const onSubmit = async (data: SaveFlowFormValues) => {
    clearFormError();

    try {
      await saveFlowMutation.mutateAsync(data);
    } catch (error) {
      const appError = ensureAppError(error);
      handleFormError(appError, setError);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-md">
        <h2 className="text-xl font-bold mb-4">Save Flow</h2>

        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4">
          {formError && (
            <FormAlert
              message={formError}
              variant="error"
              onClose={clearFormError}
              showCloseButton={true}
            />
          )}

          <FormField
            id="name"
            label="Flow Name"
            type="text"
            register={register("name")}
            error={errors.name?.message}
          />

          <FormField
            id="description"
            label="Description"
            type="textarea"
            register={register("description")}
            error={errors.description?.message}
          />

          <div className="flex justify-end gap-2 mt-6">
            <Button label="Cancel" variant="secondary" onClick={onClose} />
            <LoadingButton
              isLoading={saveFlowMutation.isPending}
              variant="primary"
              label="Save"
              loadingText="Saving..."
              disabled={isSubmitting}
              type="submit"
            />
          </div>
        </form>
      </div>
    </div>
  );
};

export default SaveFlowModal;
