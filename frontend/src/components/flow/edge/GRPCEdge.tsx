// src/components/canvas/edge/GRPCEdge.tsx
import { FC, useMemo } from "react";
import {
  BaseEdge,
  EdgeLabelRenderer,
  EdgeProps,
  getBezierPath,
} from "@xyflow/react";
import { GRPCEdgeData } from "../../../types/flow/edgeTypes";
import { useEdgeRequests } from "../../../hooks/useEdgeRequests";
import { RequestVisualizer } from "../simulation/common/RequestVisualizer";

const GRPCEdge: FC<EdgeProps> = ({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  sourcePosition,
  targetPosition,
  style = {},
  markerEnd,
  data,
  selected,
  animated,
}) => {
  // Calculate the path for the edge
  const [edgePath, labelX, labelY] = getBezierPath({
    sourceX,
    sourceY,
    sourcePosition,
    targetX,
    targetY,
    targetPosition,
  });
  // Get requests currently on this edge from simulation store
  const requestsOnEdge = useEdgeRequests(id);
  // Extract gRPC-specific data
  const grpcData = data as GRPCEdgeData;

  // Determine the edge styles based on properties
  const edgeStyles = useMemo(() => {
    const customStyles: React.CSSProperties = {
      ...style,
      strokeWidth: selected ? 3 : 2,
      // gRPC connections are typically purple/violet
      stroke: "#9C27B0",
    };

    if (data) {
      // Different styles based on streaming type
      if (grpcData?.streaming) {
        switch (grpcData.streaming) {
          case "Client":
            // Client streaming: dash-dot pattern
            customStyles.strokeDasharray = "5, 2, 1, 2";
            break;
          case "Server":
            // Server streaming: longer dashes
            customStyles.strokeDasharray = "7, 3";
            break;
          case "Bidirectional":
            // Bidirectional: thick line
            customStyles.strokeWidth = selected ? 4 : 3;
            customStyles.stroke = "#673AB7"; // Deeper purple
            break;
          default:
            // No streaming (unary): solid line
            break;
        }
      }

      // Use dashed line if explicitly specified
      if (grpcData?.dashed) {
        customStyles.strokeDasharray = "5,5";
      }

      // Line width based on bandwidth if specified
      if (grpcData?.bandwidthMbps) {
        const width = Math.min(Math.max(1, grpcData?.bandwidthMbps / 50), 5);
        customStyles.strokeWidth = selected ? width + 1 : width;
      }

      // Keep alive connections have a pulsing effect (can be added with CSS animation)
      if (grpcData?.keepAliveEnabled) {
        customStyles.opacity = 0.9;
      }
    }

    return customStyles;
  }, [style, selected, data, grpcData]);

  // Get streaming icon
  const getStreamingIcon = () => {
    switch (grpcData?.streaming) {
      case "Client":
        return "→→";
      case "Server":
        return "←←";
      case "Bidirectional":
        return "↔";
      default:
        return "⟷";
    }
  };

  return (
    <>
      <BaseEdge
        id={id}
        path={edgePath}
        style={edgeStyles}
        markerEnd={markerEnd}
      />
      {/* Requests animation  */}
      {animated &&
        requestsOnEdge.map((request) => (
          <RequestVisualizer
            key={request.id}
            request={request}
            edgePath={edgePath}
          />
        ))}
      {/* Edge Label */}
      <EdgeLabelRenderer>
        <div
          style={{
            position: "absolute",
            transform: `translate(-50%, -50%) translate(${labelX}px,${labelY}px)`,
            fontSize: 12,
            pointerEvents: "all", // Make the label interactive
            backgroundColor: selected
              ? "rgba(240, 240, 240, 0.9)"
              : "rgba(240, 240, 240, 0.75)",
            padding: "2px 5px",
            borderRadius: 4,
            border: selected ? "1px solid #1a192b" : "none",
            cursor: "pointer",
          }}
          className="nodrag nopan" // Prevent dragging and panning when interacting with the label
        >
          {data ? (
            <div className="flex flex-col text-xs">
              <div className="font-bold flex items-center">
                <span>gRPC</span>
                <span className="ml-1 text-purple-600">
                  {getStreamingIcon()}
                </span>
              </div>
            </div>
          ) : (
            "gRPC"
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
};

export default GRPCEdge;
