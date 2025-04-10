// src/pages/dashboard/DashboardPage.tsx
import { useState } from "react";
import { useFlows } from "../../hooks/useFlows";
import Loading from "../../components/ui/Loading";
import { FlowItemComponent } from "../../components/flow/FlowItemComponent";
import { useFlowStore } from "../../store/flowStore";
import flowService from "../../services/api/flowService";
import { toastError, toastSuccess } from "../../utils/toast";
import { useNavigate } from "react-router-dom";
import { useMutation, useQueryClient } from "@tanstack/react-query";

/**
 * Dashboard page component (protected route)
 */
const FlowLibraryPage = () => {
  const { data: flows, isLoading, error } = useFlows();
  const loadFlow = useFlowStore((state) => state.loadFlow);
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  // Loading state for each flow
  const [loadingFlowId, setLoadingFlowId] = useState<string | null>(null);

  // Load flow handler
  const handleLoadFlow = async (flowId: string) => {
    try {
      setLoadingFlowId(flowId);
      const flowData = await flowService.getFlowById(flowId);

      loadFlow({
        nodes: flowData.nodes,
        edges: flowData.edges,
      });

      toastSuccess("Flow loaded successfully");
      navigate("/flow-editor");
    } catch (error) {
      console.error("Error loading flow:", error);
      toastError("Failed to load flow");
    } finally {
      setLoadingFlowId(null);
    }
  };

  // Remove flow mutation
  const removeFlowMutation = useMutation({
    mutationFn: (flowId: string) => flowService.removeFlow(flowId),
    onSuccess: (message) => {
      toastSuccess(message || "Flow removed successfully");
      queryClient.invalidateQueries({ queryKey: ["flows"] });
    },
    onError: (error) => {
      console.error("Error removing flow:", error);
      toastError("Failed to remove flow");
    },
  });

  if (isLoading) {
    return (
      <div className="flex justify-center items-center h-64">
        <Loading />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-7xl mx-auto">
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded">
          Error loading your flows. Please try again later.
        </div>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Your System Design Flows</h1>
      </div>

      {flows?.length === 0 ? (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <h2 className="text-xl font-medium text-gray-600 mb-4">
            No flows yet
          </h2>
          <p className="text-gray-500">You haven't saved any flows yet.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {flows?.map((flow) => (
            <div key={flow.id}>
              <FlowItemComponent
                item={flow}
                showLoadButton={true}
                showRemoveButton={true}
                onLoad={handleLoadFlow}
                onRemove={(id) => removeFlowMutation.mutate(id)}
                isLoadLoading={loadingFlowId === flow.id}
                isRemoveLoading={
                  removeFlowMutation.isPending &&
                  removeFlowMutation.variables === flow.id
                }
              />
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FlowLibraryPage;
