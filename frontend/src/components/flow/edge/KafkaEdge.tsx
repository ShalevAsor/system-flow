// src/components/canvas/edge/KafkaEdge.tsx
import { FC, useMemo } from "react";
import {
  BaseEdge,
  EdgeLabelRenderer,
  EdgeProps,
  getBezierPath,
} from "@xyflow/react";
import { MessageQueueEdgeData } from "../../../types/flow/edgeTypes";
import { RequestVisualizer } from "../simulation/common/RequestVisualizer";
import { useEdgeRequests } from "../../../hooks/useEdgeRequests";

const KafkaEdge: FC<EdgeProps> = ({
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
  // Extract Kafka-specific data
  const kafkaData = data as MessageQueueEdgeData;

  // Determine the edge styles based on properties
  const edgeStyles = useMemo(() => {
    const customStyles: React.CSSProperties = {
      ...style,
      strokeWidth: selected ? 3 : 2,
      // Kafka connections are typically deep orange/red
      stroke: "#E64A19",
    };

    if (data) {
      // Delivery guarantee affects the line style
      if (kafkaData?.deliveryGuarantee) {
        switch (kafkaData.deliveryGuarantee) {
          case "At-Most-Once":
            // Least reliable: dotted line
            customStyles.strokeDasharray = "2 3";
            break;
          case "At-Least-Once":
            // Medium reliability: dashed line
            customStyles.strokeDasharray = "6 3";
            break;
          case "Exactly-Once":
            // Most reliable: solid, thicker line
            customStyles.strokeWidth = selected ? 4 : 3;
            break;
          default:
            break;
        }
      }

      // Persistent storage
      if (kafkaData?.persistent) {
        customStyles.stroke = "#D84315"; // Darker, more robust color
      }

      // Use dashed line if explicitly specified (overrides delivery guarantee style)
      if (kafkaData?.dashed) {
        customStyles.strokeDasharray = "5 5";
      }

      // Line width based on queue size or message rate
      if (kafkaData?.maxQueueSizeMB) {
        const width = Math.min(
          Math.max(1, Math.log10(kafkaData.maxQueueSizeMB) / 2),
          4
        );
        customStyles.strokeWidth = selected ? width + 1 : width;
      }

      // Message priority affects color
      if (kafkaData?.messagePriority) {
        switch (kafkaData.messagePriority) {
          case "Low":
            customStyles.stroke = "#FF9800"; // Orange
            break;
          case "Normal":
            // Keep default
            break;
          case "High":
            customStyles.stroke = "#F44336"; // Red
            break;
          case "Critical":
            customStyles.stroke = "#D50000"; // Deep red
            customStyles.strokeWidth = selected ? 5 : 4;
            break;
          default:
            break;
        }
      }

      // Partitioning affects the pattern
      if (kafkaData?.partitioning) {
        // For partitioned topics, double line effect
        customStyles.strokeWidth = selected ? 4 : 3;
        // Only modify dash pattern if it exists
        if (
          customStyles.strokeDasharray &&
          typeof customStyles.strokeDasharray === "string"
        ) {
          const dashParts = customStyles.strokeDasharray.split(" ");
          if (dashParts.length === 2) {
            const dash = parseInt(dashParts[0]) * 1.5;
            const gap = parseInt(dashParts[1]);
            customStyles.strokeDasharray = `${dash} ${gap}`;
          }
        }
      }
    }

    return customStyles;
  }, [style, selected, data, kafkaData]);

  // Get the appropriate icon for the delivery guarantee
  const getDeliveryGuaranteeIcon = () => {
    if (!kafkaData?.deliveryGuarantee) return "";

    switch (kafkaData.deliveryGuarantee) {
      case "At-Most-Once":
        return "≤1";
      case "At-Least-Once":
        return "≥1";
      case "Exactly-Once":
        return "=1";
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
                <span className="text-red-600">Kafka</span>
                <span className="ml-1 text-gray-600">
                  {getDeliveryGuaranteeIcon()}
                </span>
                {kafkaData?.messagePriority === "Critical" && (
                  <span className="ml-1 text-red-600">⚠</span>
                )}
              </div>
            </div>
          ) : (
            "Kafka"
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
};

export default KafkaEdge;
