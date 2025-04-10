import { useShallow } from "zustand/react/shallow";
import { useSimulationStore } from "../../../store/simulationStore";
import { useFlowStore } from "../../../store/flowStore";
import { UtilizationIndicator } from "./common/UtilizationIndicator";

export const ComponentUtilizationView: React.FC = () => {
  const { componentUtilization } = useSimulationStore(
    useShallow((state) => ({
      componentUtilization: state.componentUtilization,
    }))
  );
  const { nodes, edges } = useFlowStore(
    useShallow((state) => ({
      nodes: state.nodes,
      edges: state.edges,
    }))
  );
  return (
    <div className="flex flex-col p-3 space-y-2">
      {/* Node Utilization */}
      <div>
        <h3 className="text-sm font-medium mb-2">Node Utilization</h3>
        <div className="grid grid-cols-1 gap-2">
          {nodes.map((node) => {
            const utilization =
              componentUtilization.nodeUtilization[node.id] || 0;
            return (
              <UtilizationIndicator
                key={node.id}
                label={node.data?.label || "Node"}
                value={utilization}
              />
            );
          })}
        </div>
      </div>

      {/* Edge Utilization */}
      <div>
        <h3 className="text-sm font-medium mb-2">Edge Utilization</h3>
        <div className="grid grid-cols-1 gap-2">
          {edges.map((edge) => {
            const utilization =
              componentUtilization.edgeUtilization[edge.id] || 0;
            return (
              <UtilizationIndicator
                key={edge.id}
                label={edge.data?.label || "Edge"}
                value={utilization}
              />
            );
          })}
        </div>
      </div>
    </div>
  );
};
