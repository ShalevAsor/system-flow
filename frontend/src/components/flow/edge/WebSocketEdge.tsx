// src/components/canvas/edge/WebSocketEdge.tsx
import { FC, useMemo } from "react";
import {
  BaseEdge,
  EdgeLabelRenderer,
  EdgeProps,
  getBezierPath,
} from "@xyflow/react";
import { WebSocketEdgeData } from "../../../types/flow/edgeTypes";
import { useEdgeRequests } from "../../../hooks/useEdgeRequests";
import { RequestVisualizer } from "../simulation/common/RequestVisualizer";

const WebSocketEdge: FC<EdgeProps> = ({
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
  // Extract WebSocket-specific data
  const wsData = data as WebSocketEdgeData;

  // Determine the edge styles based on properties
  const edgeStyles = useMemo(() => {
    const customStyles: React.CSSProperties = {
      ...style,
      strokeWidth: selected ? 3 : 2,
      // WebSocket connections are typically blue
      stroke: "#3F51B5",
    };

    if (data) {
      // Persistent connections are solid, non-persistent are dashed
      if (!wsData?.persistent) {
        customStyles.strokeDasharray = "5,5";
      }

      // Use dashed line if explicitly specified
      if (wsData?.dashed) {
        customStyles.strokeDasharray = "5,5";
      }

      // Heartbeat enabled connections have a different color
      if (wsData?.heartbeatEnabled) {
        customStyles.stroke = "#00BCD4"; // Cyan for connections with heartbeat
      }

      // High message rate makes the line thicker
      if (wsData?.messageRatePerSecond && wsData?.messageRatePerSecond > 50) {
        customStyles.stroke = "#673AB7"; // Purple for high-throughput connections
        customStyles.strokeWidth = selected ? 4 : 3;
      }

      // Line width based on bandwidth if specified
      if (wsData?.bandwidthMbps) {
        const width = Math.min(Math.max(1, wsData?.bandwidthMbps / 50), 5);
        customStyles.strokeWidth = selected ? width + 1 : width;
      }

      // Add animation for auto-reconnect connections
      if (wsData?.autoReconnect) {
        customStyles.animation = "dash 1s linear infinite";
        customStyles.animationDirection = "reverse";
      }
    }

    return customStyles;
  }, [style, selected, data, wsData]);

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
                <span>WebSocket</span>
                {wsData?.persistent && (
                  <span className="ml-1 text-green-600">●</span>
                )}
              </div>
            </div>
          ) : (
            "WebSocket"
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
};

export default WebSocketEdge;
