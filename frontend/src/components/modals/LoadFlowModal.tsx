// src/components/flow/LoadFlowModal.tsx
import { useState } from "react";
import { useFlows } from "../../hooks/useFlows";
import { useFlowStore } from "../../store/flowStore";
import Button from "../ui/Button";
import Loading from "../ui/Loading";
import flowService from "../../services/api/flowService";
import { toastError, toastSuccess } from "../../utils/toast";
import { FlowItemComponent } from "../flow/FlowItemComponent";

interface LoadFlowModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const LoadFlowModal = ({ isOpen, onClose }: LoadFlowModalProps) => {
  const { data: flows, isLoading: isLoadingFlows, error } = useFlows();
  const [loadingFlowId, setLoadingFlowId] = useState<string | null>(null);
  const loadFlow = useFlowStore((state) => state.loadFlow);

  const handleLoadFlow = async (flowId: string) => {
    try {
      setLoadingFlowId(flowId);
      // Fetch the complete flow data by ID
      const flowData = await flowService.getFlowById(flowId);

      // Load the flow into the store
      loadFlow({
        nodes: flowData.nodes,
        edges: flowData.edges,
      });

      // Show success message
      toastSuccess("Flow loaded successfully");

      // Close the modal
      onClose();
    } catch (error) {
      console.error("Error loading flow:", error);
      toastError("Failed to load flow");
    } finally {
      setLoadingFlowId(null);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white p-6 rounded-lg shadow-lg w-full max-w-2xl">
        <h2 className="text-xl font-bold mb-4">Load Flow</h2>

        {isLoadingFlows ? (
          <div className="flex justify-center items-center h-32">
            <Loading />
          </div>
        ) : error ? (
          <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
            Error loading your flows. Please try again later.
          </div>
        ) : flows?.length === 0 ? (
          <div className="bg-gray-50 rounded-lg p-6 text-center">
            <h2 className="text-lg font-medium text-gray-600 mb-2">
              No flows yet
            </h2>
            <p className="text-gray-500">You haven't saved any flows yet.</p>
          </div>
        ) : (
          <div className="max-h-80 overflow-y-auto">
            <div className="grid gap-3">
              {flows?.map((flow) => (
                <div
                  key={flow.id}
                  className="bg-white border border-gray-200 rounded-lg p-4 hover:bg-gray-50 transition-colors"
                >
                  <FlowItemComponent
                    item={flow}
                    isCompact={true}
                    showLoadButton={true}
                    showRemoveButton={false} // Explicitly set to false to ensure no remove button
                    onLoad={handleLoadFlow}
                    isLoadLoading={loadingFlowId === flow.id}
                  />
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-end mt-6">
          <Button label="Close" variant="secondary" onClick={onClose} />
        </div>
      </div>
    </div>
  );
};

export default LoadFlowModal;
