// src/components/canvas/edge/DatabaseEdge.tsx
import { FC, useMemo } from "react";
import {
  BaseEdge,
  EdgeLabelRenderer,
  EdgeProps,
  getBezierPath,
} from "@xyflow/react";
import { DatabaseEdgeData } from "../../../types/flow/edgeTypes";
import { useEdgeRequests } from "../../../hooks/useEdgeRequests";
import { RequestVisualizer } from "../simulation/common/RequestVisualizer";

const DatabaseEdge: FC<EdgeProps> = ({
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

  // Extract Database-specific data
  const dbData = data as DatabaseEdgeData;
  const requestsOnEdge = useEdgeRequests(id);
  // Determine the edge styles based on properties
  const edgeStyles = useMemo(() => {
    const customStyles: React.CSSProperties = {
      ...style,
      strokeWidth: selected ? 3 : 2,
      // Database connections are typically green/teal
      stroke: "#009688",
    };

    if (data) {
      // Different styles based on connection type
      if (dbData?.connectionType) {
        switch (dbData.connectionType) {
          case "Read":
            // Read connections: lighter green, dashed
            customStyles.stroke = "#4DB6AC";
            customStyles.strokeDasharray = "5,5";
            break;
          case "Write":
            // Write connections: darker green, solid
            customStyles.stroke = "#00796B";
            break;
          case "Read-Write":
            // Read-Write connections: normal green, solid but thicker
            customStyles.strokeWidth = selected ? 4 : 3;
            break;
          case "Admin":
            // Admin connections: orange/amber for caution
            customStyles.stroke = "#FFA000";
            break;
          default:
            break;
        }
      }

      // Transactional connections have a special style
      if (dbData?.transactional) {
        // Double line effect with a lighter stroke width
        customStyles.strokeWidth = selected ? 5 : 4;
        customStyles.stroke = "#26A69A";
      }

      // Use dashed line if explicitly specified
      if (dbData?.dashed) {
        customStyles.strokeDasharray = "5,5";
      }

      // Read-only connections might have a different pattern
      if (dbData?.readOnly) {
        customStyles.strokeDasharray = "10,2";
      }

      // Line width based on bandwidth if specified
      if (dbData?.bandwidthMbps) {
        const width = Math.min(Math.max(1, dbData?.bandwidthMbps / 50), 5);
        customStyles.strokeWidth = selected ? width + 1 : width;
      }
    }

    return customStyles;
  }, [style, selected, data, dbData]);

  // Get a short description of the connection type
  const getConnectionTypeDescription = () => {
    if (!dbData?.connectionType) return "";

    switch (dbData.connectionType) {
      case "Read":
        return "(R)";
      case "Write":
        return "(W)";
      case "Read-Write":
        return "(R/W)";
      case "Admin":
        return "(Admin)";
      default:
        return "";
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
              <div className="font-bold flex items-center">
                <span>DB</span>
                <span className="ml-1 text-teal-600">
                  {getConnectionTypeDescription()}
                </span>
                {dbData?.transactional && (
                  <span className="ml-1 text-blue-600">🔄</span>
                )}
              </div>
            </div>
          ) : (
            "Database"
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
};

export default DatabaseEdge;
