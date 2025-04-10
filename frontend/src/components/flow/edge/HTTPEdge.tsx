// src/components/canvas/edge/HTTPEdge.tsx
import { FC, useMemo } from "react";
import {
  BaseEdge,
  EdgeLabelRenderer,
  EdgeProps,
  getBezierPath,
} from "@xyflow/react";
import { HTTPEdgeData, type HTTPEdge } from "../../../types/flow/edgeTypes";
import { RequestVisualizer } from "../simulation/common/RequestVisualizer";
import { useEdgeRequests } from "../../../hooks/useEdgeRequests";

const HTTPEdge: FC<EdgeProps<HTTPEdge>> = ({
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
  // Extract HTTP-specific data if available
  const httpData = data as HTTPEdgeData;

  // console.log("Amount of requests on edge", requestsOnEdge.length);
  // Determine the edge styles based on properties
  const edgeStyles = useMemo(() => {
    const customStyles: React.CSSProperties = {
      ...style,
      strokeWidth: selected ? 3 : 2,
    };

    if (data) {
      // HTTP-specific styling
      if (httpData?.useTLS) {
        customStyles.stroke = "#4CAF50"; // Green for secure connections
      } else {
        customStyles.stroke = "#FF9800"; // Orange for non-secure connections
      }

      // Dash the line if specified
      if (httpData?.dashed) {
        customStyles.strokeDasharray = "5,5";
      }

      // High latency connection
      if (httpData?.latencyMs && httpData?.latencyMs > 300) {
        customStyles.stroke = "#F44336"; // Red for high latency
      }

      // Line width based on bandwidth if specified
      if (httpData?.bandwidthMbps) {
        const width = Math.min(Math.max(1, httpData?.bandwidthMbps / 50), 5);
        customStyles.strokeWidth = selected ? width + 1 : width;
      }
    }

    return customStyles;
  }, [style, selected, data, httpData]);

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
        requestsOnEdge.map((request, index) => (
          <RequestVisualizer
            key={request.id}
            request={request}
            edgePath={edgePath}
            index={index}
            requestsCount={requestsOnEdge.length}
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
              <div className="font-bold">
                {httpData?.method || "GET"}
                {httpData?.useTLS ? " (TLS)" : ""}
              </div>
            </div>
          ) : (
            "HTTP"
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
};

export default HTTPEdge;
