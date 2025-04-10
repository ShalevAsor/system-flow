// src/components/canvas/edge/MQTTEdge.tsx
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

const MQTTEdge: FC<EdgeProps> = ({
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
  // Extract MQTT-specific data
  const mqttData = data as MessageQueueEdgeData;

  // Determine the edge styles based on properties
  const edgeStyles = useMemo(() => {
    const customStyles: React.CSSProperties = {
      ...style,
      strokeWidth: selected ? 3 : 2,
      // MQTT connections are typically green
      stroke: "#7CB342",
    };

    if (data) {
      // Delivery guarantee affects the line style
      if (mqttData?.deliveryGuarantee) {
        switch (mqttData.deliveryGuarantee) {
          case "At-Most-Once":
            // QoS 0 - Dotted line
            customStyles.strokeDasharray = "2 3";
            break;
          case "At-Least-Once":
            // QoS 1 - Dashed line
            customStyles.strokeDasharray = "6 3";
            break;
          case "Exactly-Once":
            // QoS 2 - Solid, thicker line
            customStyles.strokeWidth = selected ? 4 : 3;
            break;
          default:
            break;
        }
      }

      // Persistent storage (retained messages)
      if (mqttData?.persistent) {
        customStyles.stroke = "#558B2F"; // Darker green for retained messages
      }

      // Use dashed line if explicitly specified
      if (mqttData?.dashed) {
        customStyles.strokeDasharray = "5 5";
      }

      // Message priority affects color
      if (mqttData?.messagePriority) {
        switch (mqttData.messagePriority) {
          case "Low":
            customStyles.stroke = "#AED581"; // Light green
            break;
          case "Normal":
            // Keep default
            break;
          case "High":
            customStyles.stroke = "#689F38"; // Medium-dark green
            break;
          case "Critical":
            customStyles.stroke = "#33691E"; // Very dark green
            customStyles.strokeWidth = selected ? 5 : 4;
            break;
          default:
            break;
        }
      }

      // Clean session vs durable subscription
      if (mqttData?.durableSubscription) {
        // Darker, more solid line for durable subscriptions
        customStyles.stroke = "#558B2F";
        if (customStyles.strokeDasharray) {
          // Make dashes more prominent
          customStyles.strokeDasharray = customStyles.strokeDasharray
            .toString()
            .split(" ")
            .map((v) => parseInt(v) + 1)
            .join(" ");
        }
      }
    }

    return customStyles;
  }, [style, selected, data, mqttData]);

  // Get the appropriate icon for the delivery guarantee (QoS level)
  const getQoSIcon = () => {
    if (!mqttData?.deliveryGuarantee) return "";

    switch (mqttData.deliveryGuarantee) {
      case "At-Most-Once":
        return "QoS 0";
      case "At-Least-Once":
        return "QoS 1";
      case "Exactly-Once":
        return "QoS 2";
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
                <span className="text-green-600">MQTT</span>
                <span className="ml-1 text-gray-600">{getQoSIcon()}</span>
                {mqttData?.messagePriority === "Critical" && (
                  <span className="ml-1 text-red-600">⚠</span>
                )}
                {mqttData?.persistent && (
                  <span className="ml-1 text-green-600">📌</span> // Pin icon for retained messages
                )}
              </div>
              <div className="text-gray-600 flex flex-col">
                {mqttData?.topicPattern && (
                  <span className="text-xs">{mqttData.topicPattern}</span>
                )}
                {mqttData?.durableSubscription && (
                  <span className="text-xs">Durable</span>
                )}
              </div>
            </div>
          ) : (
            "MQTT"
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
};

export default MQTTEdge;
