// src/components/canvas/edge/UDPEdge.tsx
import { FC, useMemo } from "react";
import {
  BaseEdge,
  EdgeLabelRenderer,
  EdgeProps,
  getBezierPath,
} from "@xyflow/react";
import { UDPEdgeData } from "../../../types/flow/edgeTypes";
import { RequestVisualizer } from "../simulation/common/RequestVisualizer";
import { useEdgeRequests } from "../../../hooks/useEdgeRequests";

const UDPEdge: FC<EdgeProps> = ({
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
  // Extract UDP-specific data
  const udpData = data as UDPEdgeData;

  // Determine the edge styles based on properties
  const edgeStyles = useMemo(() => {
    const customStyles: React.CSSProperties = {
      ...style,
      strokeWidth: selected ? 3 : 2,
      // UDP connections are typically light blue/cyan
      stroke: "#00BCD4",
    };

    if (data) {
      // Always use dotted line for UDP to indicate it's connectionless
      customStyles.strokeDasharray = "2,4";

      // Broadcast has a special style (thicker, more widely spaced dots)
      if (udpData?.broadcast) {
        customStyles.strokeDasharray = "4,6";
        customStyles.strokeWidth = selected ? 4 : 3;
      }

      // Multicast has a different color
      if (udpData?.multicast) {
        customStyles.stroke = "#7E57C2"; // Purple
      }

      // Use dashed line if explicitly specified (overrides default dotted line)
      if (udpData?.dashed) {
        customStyles.strokeDasharray = "5,5";
      }

      // Line width based on packet size
      if (udpData?.packetSizeBytes) {
        // Adjust thickness based on packet size (logarithmic scale)
        const width = Math.min(
          Math.max(1, Math.log10(udpData.packetSizeBytes / 100)),
          4
        );
        customStyles.strokeWidth = selected ? width + 1 : width;
      }

      // Packet loss visualization
      if (udpData?.packetLossRate && udpData?.packetLossRate > 0.05) {
        // Higher packet loss gets more faded
        customStyles.opacity = Math.max(0.3, 1 - udpData.packetLossRate * 3);
      }
    }

    return customStyles;
  }, [style, selected, data, udpData]);

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
                <span>UDP</span>
                {udpData?.port && (
                  <span className="ml-1 text-blue-600">:{udpData.port}</span>
                )}
                {udpData?.multicast && (
                  <span className="ml-1 text-purple-600">Multicast</span>
                )}
                {udpData?.broadcast && (
                  <span className="ml-1 text-orange-600">Broadcast</span>
                )}
              </div>
            </div>
          ) : (
            "UDP"
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
};

export default UDPEdge;
