import React, { useMemo } from "react";
import { useSimulationStore } from "../../../store/simulationStore";
import { useFlowStore } from "../../../store/flowStore";
import { useShallow } from "zustand/react/shallow";

export const BottleneckAnalyzer: React.FC = () => {
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

  const bottlenecks = useMemo(() => {
    // Get node utilizations
    const nodeUtils = Object.entries(componentUtilization.nodeUtilization)
      .map(([id, utilization]) => ({
        id,
        utilization,
        type: "node",
        name: nodes.find((n) => n.id === id)?.data?.label || id,
      }))
      .filter((item) => item.utilization > 0.5);

    // Get edge utilizations
    const edgeUtils = Object.entries(componentUtilization.edgeUtilization)
      .map(([id, utilization]) => {
        const edge = edges.find((e) => e.id === id);
        if (!edge) return null;

        const srcNodeLabel = nodes.find((n) => n.id === edge.source)?.data
          ?.label;
        const targetNodeLabel = nodes.find((n) => n.id === edge.target)?.data
          ?.label;

        if (!srcNodeLabel || !targetNodeLabel) return null;

        return {
          id,
          utilization,
          type: "edge",
          name: `${srcNodeLabel} → ${targetNodeLabel}`,
        };
      })
      .filter(
        (
          item
        ): item is {
          id: string;
          utilization: number;
          type: string;
          name: string;
        } => item !== null && item.utilization > 0.5
      );

    // Combine and sort by utilization (highest first)
    return [...nodeUtils, ...edgeUtils]
      .sort((a, b) => b.utilization - a.utilization)
      .slice(0, 5);
  }, [componentUtilization, nodes, edges]);

  if (bottlenecks.length === 0) {
    return (
      <div className="p-4 text-center text-sm text-gray-500">
        No significant bottlenecks detected
      </div>
    );
  }

  // Function to get color based on utilization
  const getUtilizationColor = (utilization: number) => {
    if (utilization >= 0.9) return "bg-red-500";
    if (utilization >= 0.7) return "bg-amber-700";
    if (utilization >= 0.5) return "bg-orange-400";
    return "bg-green-400";
  };

  return (
    <div className="p-4">
      <div className="mb-3 text-sm font-medium text-gray-700">
        Top Potential Bottlenecks
      </div>

      <div className="space-y-3">
        {bottlenecks.map((item) => {
          const utilizationPercent = Math.round(item.utilization * 100);
          const colorClass = getUtilizationColor(item.utilization);

          return (
            <div
              key={item.id}
              className="flex items-center bg-gray-50 rounded-lg p-3 shadow-sm"
            >
              <div
                className={`w-3 h-3 rounded-full mr-2 ${
                  item.type === "node" ? "bg-blue-500" : "bg-purple-500"
                }`}
              />

              <div
                className="flex-1 text-sm font-medium truncate"
                title={item.name}
              >
                {item.name}
              </div>

              <div
                className={`flex items-center justify-center rounded-full w-10 h-10 ml-2 ${colorClass} text-white font-bold text-sm`}
              >
                {utilizationPercent}%
              </div>
            </div>
          );
        })}
      </div>

      <div className="mt-3 flex text-xs text-gray-500">
        <div className="mr-4 flex items-center">
          <span className="w-2 h-2 rounded-full bg-blue-500 mr-1"></span>
          <span>Node</span>
        </div>
        <div className="flex items-center">
          <span className="w-2 h-2 rounded-full bg-purple-500 mr-1"></span>
          <span>Connection</span>
        </div>
      </div>
    </div>
  );
};
