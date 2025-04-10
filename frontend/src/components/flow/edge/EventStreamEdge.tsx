// src/components/canvas/edge/EventStreamEdge.tsx
import { FC, useMemo } from "react";
import {
  BaseEdge,
  EdgeLabelRenderer,
  EdgeProps,
  getBezierPath,
} from "@xyflow/react";
import { EventStreamEdgeData } from "../../../types/flow/edgeTypes";
import { useEdgeRequests } from "../../../hooks/useEdgeRequests";
import { RequestVisualizer } from "../simulation/common/RequestVisualizer";

const EventStreamEdge: FC<EdgeProps> = ({
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
  // Extract EventStream-specific data
  const eventData = data as EventStreamEdgeData;

  // Determine the edge styles based on properties
  const edgeStyles = useMemo(() => {
    const customStyles: React.CSSProperties = {
      ...style,
      strokeWidth: selected ? 3 : 2,
      // Event streams are typically purple/violet to distinguish them
      stroke: "#8E24AA", // Purple color for event streams
    };

    if (data) {
      // Use animated style for event streams
      customStyles.animation = "flowAnimation 30s infinite linear";
      customStyles.strokeDasharray = "10,3";

      // If the stream is ordered, use a different style
      if (eventData?.ordered) {
        customStyles.stroke = "#6A1B9A"; // Darker purple for ordered streams
        customStyles.strokeDasharray = "none"; // Solid line for ordered
      }

      // If explicitly specified as dashed
      if (eventData?.dashed) {
        customStyles.strokeDasharray = "5,5";
      }

      // Line width could be based on the number of event types or throughput
      if (eventData?.eventTypes && eventData.eventTypes.length > 0) {
        // Adjust width based on event type count, but keep it reasonable
        const width = Math.min(Math.max(1, eventData.eventTypes.length / 2), 4);
        customStyles.strokeWidth = selected ? width + 1 : width;
      }

      // We could also adjust visual characteristics based on retention period
      if (eventData?.retentionPeriodHours) {
        // For long retention, use a more vibrant color
        if (eventData.retentionPeriodHours > 72) {
          customStyles.stroke = "#7B1FA2"; // More vibrant purple
        }
      }

      // Sharded streams might have a special style
      if (eventData?.sharding) {
        customStyles.strokeDasharray = "15,2,2,2";
      }
    }

    return customStyles;
  }, [style, selected, data, eventData]);

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
                <span>Event</span>
                {eventData?.streamName && (
                  <span className="ml-1 text-purple-600">
                    ({eventData.streamName})
                  </span>
                )}
                {eventData?.sharding && (
                  <span className="ml-1 text-purple-800">⚡</span>
                )}
                {eventData?.ordered && (
                  <span className="ml-1 text-purple-800">↓</span>
                )}
              </div>
            </div>
          ) : (
            "Event Stream"
          )}
        </div>
      </EdgeLabelRenderer>
    </>
  );
};

export default EventStreamEdge;
