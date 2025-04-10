// src/components/canvas/edge/TCPEdge.tsx
import { FC, useMemo } from "react";
import {
  BaseEdge,
  EdgeLabelRenderer,
  EdgeProps,
  getBezierPath,
} from "@xyflow/react";
import { TCPEdgeData } from "../../../types/flow/edgeTypes";
import { useEdgeRequests } from "../../../hooks/useEdgeRequests";
import { RequestVisualizer } from "../simulation/common/RequestVisualizer";

const TCPEdge: FC<EdgeProps> = ({
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
  // Extract TCP-specific data
  const tcpData = data as TCPEdgeData;

  // Determine the edge styles based on properties
  const edgeStyles = useMemo(() => {
    const customStyles: React.CSSProperties = {
      ...style,
      strokeWidth: selected ? 3 : 2,
      // TCP connections are typically blue (more muted than WebSocket)
      stroke: "#1976D2",
    };

    if (data) {
      // Connection pool uses thicker lines
      if (tcpData?.connectionPoolEnabled) {
        customStyles.strokeWidth = selected ? 4 : 3;
      }

      // Keep alive connections have a special pattern
      if (tcpData?.keepAliveEnabled) {
        customStyles.strokeDasharray = "10,2";
      }

      // Use dashed line if explicitly specified
      if (tcpData?.dashed) {
        customStyles.strokeDasharray = "5,5";
      }

      // Line width based on max concurrent connections
      if (tcpData?.maxConcurrentConnections) {
        const width = Math.min(
          Math.max(1, Math.log10(tcpData.maxConcurrentConnections) / 2),
          5
        );
        customStyles.strokeWidth = selected ? width + 1 : width;
      }

      // Nagle's algorithm enabled
      if (tcpData?.nagleAlgorithmEnabled) {
        customStyles.stroke = "#42A5F5"; // Lighter blue
      }
    }

    return customStyles;
  }, [style, selected, data, tcpData]);

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
                <span>TCP</span>
                {tcpData?.port && (
                  <span className="ml-1 text-blue-600">:{tcpData.port}</span>
                )}
              </div>
              <div className="text-gray-600 flex flex-col">
                {tcpData?.connectionPoolEnabled && (
                  <span className="text-xs">
                    Pool: {tcpData.maxConcurrentConnections || "∞"}
                  </span>
                )}
                {tcpData?.socketBufferSizeKB && (
                  <span className="text-xs">
                    Buf: {tcpData.socketBufferSizeKB}KB
                  </span>
                )}
              </div>
            </div>
          ) : (
            "TCP"
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
};

export default TCPEdge;
