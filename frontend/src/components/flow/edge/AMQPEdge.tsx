// src/components/canvas/edge/AMQPEdge.tsx
import { FC, useMemo } from "react";
import {
  BaseEdge,
  EdgeLabelRenderer,
  EdgeProps,
  getBezierPath,
} from "@xyflow/react";
import { MessageQueueEdgeData } from "../../../types/flow/edgeTypes";
import { useEdgeRequests } from "../../../hooks/useEdgeRequests";
import { RequestVisualizer } from "../simulation/common/RequestVisualizer";

const AMQPEdge: FC<EdgeProps> = ({
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

  // Extract AMQP-specific data
  const amqpData = data as MessageQueueEdgeData;

  // Determine the edge styles based on properties
  const edgeStyles = useMemo(() => {
    const customStyles: React.CSSProperties = {
      ...style,
      strokeWidth: selected ? 3 : 2,
      // AMQP connections are typically indigo/blue
      stroke: "#5C6BC0",
    };

    if (data) {
      // Delivery guarantee affects the line style
      if (amqpData?.deliveryGuarantee) {
        switch (amqpData.deliveryGuarantee) {
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
      if (amqpData?.persistent) {
        customStyles.stroke = "#3949AB"; // Darker indigo for persistent messages
      }

      // Use dashed line if explicitly specified
      if (amqpData?.dashed) {
        customStyles.strokeDasharray = "5 5";
      }

      // Message priority affects color
      if (amqpData?.messagePriority) {
        switch (amqpData.messagePriority) {
          case "Low":
            customStyles.stroke = "#9FA8DA"; // Light indigo
            break;
          case "Normal":
            // Keep default
            break;
          case "High":
            customStyles.stroke = "#3F51B5"; // Medium-dark indigo
            break;
          case "Critical":
            customStyles.stroke = "#283593"; // Very dark indigo
            customStyles.strokeWidth = selected ? 5 : 4;
            break;
          default:
            break;
        }
      }

      // Mandatory flag (retryEnabled serves as AMQP mandatory flag)
      if (amqpData?.retryEnabled) {
        // More prominent line for mandatory messages
        customStyles.strokeWidth = Math.min(
          (customStyles.strokeWidth as number) + 1,
          5
        );
      }

      // Immediate flag (circuitBreakerEnabled serves as AMQP immediate flag)
      if (amqpData?.circuitBreakerEnabled) {
        // Special dash pattern for immediate messages
        customStyles.strokeDasharray = "8 2";
      }
    }

    return customStyles;
  }, [style, selected, data, amqpData]);

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
                <span className="text-indigo-600">AMQP</span>
                {amqpData?.retryEnabled && (
                  <span className="ml-1 text-indigo-600">M</span> // Mandatory flag
                )}
                {amqpData?.circuitBreakerEnabled && (
                  <span className="ml-1 text-blue-600">I</span> // Immediate flag
                )}
                {amqpData?.messagePriority === "Critical" && (
                  <span className="ml-1 text-red-600">⚠</span>
                )}
              </div>
            </div>
          ) : (
            "AMQP"
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
};

export default AMQPEdge;
