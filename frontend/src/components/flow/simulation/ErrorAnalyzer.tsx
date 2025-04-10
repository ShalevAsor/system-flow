import React, { useMemo } from "react";
import { useSimulationStore } from "../../../store/simulationStore";
import { useShallow } from "zustand/react/shallow";
import { useFlowStore } from "../../../store/flowStore";
import { SimulationRequestType } from "../../../types/flow/simulationTypes";

export const ErrorAnalyzer: React.FC = () => {
  const { failedRequestsHistory } = useSimulationStore(
    useShallow((state) => ({
      failedRequestsHistory: state.failedRequestsHistory,
    }))
  );

  const { nodes } = useFlowStore(
    useShallow((state) => ({
      nodes: state.nodes,
    }))
  );

  const errorStats = useMemo(() => {
    if (failedRequestsHistory.length === 0) {
      return {
        totalErrors: 0,
        errorReasons: [],
        errorsByNode: [],
        errorsByRequestType: [],
        recentErrors: [],
      };
    }

    // Count errors by reason
    const reasonsMap = new Map<string, number>();
    failedRequestsHistory.forEach((request) => {
      const reason = request.failureReason || "Unknown Error";
      reasonsMap.set(reason, (reasonsMap.get(reason) || 0) + 1);
    });

    // Sort and format error reasons
    const errorReasons = Array.from(reasonsMap.entries())
      .map(([reason, count]) => ({ reason, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5); // Top 5 reasons

    // Count errors by node
    const nodeMap = new Map<string, number>();
    failedRequestsHistory.forEach((request) => {
      const nodeId = request.currentNodeId;
      nodeMap.set(nodeId, (nodeMap.get(nodeId) || 0) + 1);
    });

    // Get node names and sort by error count
    const errorsByNode = Array.from(nodeMap.entries())
      .map(([nodeId, count]) => ({
        nodeId,
        nodeName: nodes.find((n) => n.id === nodeId)?.data?.label || nodeId,
        count,
      }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 3); // Top 3 nodes

    // Count errors by request type
    const typeMap = new Map<SimulationRequestType, number>();
    failedRequestsHistory.forEach((request) => {
      typeMap.set(request.type, (typeMap.get(request.type) || 0) + 1);
    });

    // Format request types
    const errorsByRequestType = Array.from(typeMap.entries())
      .map(([type, count]) => ({
        type,
        formattedType: formatRequestType(type),
        count,
      }))
      .sort((a, b) => b.count - a.count);

    // Get most recent errors
    const recentErrors = [...failedRequestsHistory]
      .sort((a, b) => (b.failedAt || 0) - (a.failedAt || 0))
      .slice(0, 5)
      .map((request) => ({
        id: request.id,
        failureReason: request.failureReason || "Unknown Error",
        time: request.failedAt || 0,
        source:
          nodes.find((n) => n.id === request.sourceNodeId)?.data?.label ||
          request.sourceNodeId,
        destination:
          nodes.find((n) => n.id === request.destinationNodeId)?.data?.label ||
          request.destinationNodeId,
        type: request.type,
      }));

    return {
      totalErrors: failedRequestsHistory.length,
      errorReasons,
      errorsByNode,
      errorsByRequestType,
      recentErrors,
    };
  }, [failedRequestsHistory, nodes]);

  // If no errors, show a placeholder
  if (errorStats.totalErrors === 0) {
    return (
      <div className="p-4 flex flex-col items-center justify-center h-32 text-gray-500">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          className="h-10 w-10 mb-2 text-gray-300"
          fill="none"
          viewBox="0 0 24 24"
          stroke="currentColor"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={1.5}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <div className="text-center">
          <p className="font-medium">No errors detected</p>
          <p className="text-sm">All requests are processing successfully</p>
        </div>
      </div>
    );
  }

  // Get color for error severity
  const getErrorSeverityColor = (count: number, total: number) => {
    const percentage = (count / total) * 100;
    if (percentage >= 25) return "bg-red-500";
    if (percentage >= 10) return "bg-amber-500";
    if (percentage >= 5) return "bg-yellow-400";
    return "bg-blue-500";
  };

  // Format time
  const formatTime = (timestamp: number) => {
    const seconds = Math.floor(timestamp / 1000);
    if (seconds < 60) return `${seconds}s`;
    return `${Math.floor(seconds / 60)}m ${seconds % 60}s`;
  };

  // Format a request type for display
  function formatRequestType(type: SimulationRequestType): string {
    // Convert camelCase to Title Case with spaces
    return type
      .replace(/([A-Z])/g, " $1")
      .replace(/^./, (str) => str.toUpperCase())
      .trim();
  }

  return (
    <div className="p-4 space-y-4">
      {/* Error Summary */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200 flex items-center">
        <div className="h-12 w-12 rounded-full bg-red-100 flex items-center justify-center mr-4 flex-shrink-0">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            className="h-6 w-6 text-red-600"
            fill="none"
            viewBox="0 0 24 24"
            stroke="currentColor"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        </div>
        <div>
          <h3 className="text-sm font-medium text-gray-700">Error Summary</h3>
          <div className="text-2xl font-bold text-red-600">
            {errorStats.totalErrors} Errors
          </div>
        </div>
      </div>

      {/* Top Error Reasons */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
        <h3 className="text-sm font-medium text-gray-700 mb-3">
          Top Error Reasons
        </h3>
        <div className="space-y-3">
          {errorStats.errorReasons.map(({ reason, count }) => (
            <div key={reason} className="flex items-center">
              <div
                className={`w-3 h-3 rounded-full mr-3 ${getErrorSeverityColor(
                  count,
                  errorStats.totalErrors
                )}`}
              />
              <div className="flex-1 text-sm truncate" title={reason}>
                {reason}
              </div>
              <div className="text-sm font-medium ml-2 min-w-[70px] text-right">
                {count} ({Math.round((count / errorStats.totalErrors) * 100)}%)
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Errors by Request Type */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
        <h3 className="text-sm font-medium text-gray-700 mb-3">
          Errors by Request Type
        </h3>
        <div className="space-y-3">
          {errorStats.errorsByRequestType.map(
            ({ type, formattedType, count }) => (
              <div key={type} className="flex items-center">
                <div
                  className={`w-3 h-3 rounded-full mr-3 ${getErrorSeverityColor(
                    count,
                    errorStats.totalErrors
                  )}`}
                />
                <div className="flex-1 text-sm truncate" title={formattedType}>
                  {formattedType}
                </div>
                <div className="text-sm font-medium ml-2 min-w-[70px] text-right">
                  {count} ({Math.round((count / errorStats.totalErrors) * 100)}
                  %)
                </div>
              </div>
            )
          )}
        </div>
      </div>

      {/* Problem Areas (Nodes) */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
        <h3 className="text-sm font-medium text-gray-700 mb-3">
          Problem Components
        </h3>
        <div className="space-y-3">
          {errorStats.errorsByNode.map(({ nodeId, nodeName, count }) => (
            <div
              key={nodeId}
              className="flex items-center bg-gray-50 p-3 rounded-lg"
            >
              <div
                className={`w-3 h-3 rounded-full mr-3 ${getErrorSeverityColor(
                  count,
                  errorStats.totalErrors
                )}`}
              />
              <div
                className="flex-1 font-medium text-sm truncate"
                title={nodeName}
              >
                {nodeName}
              </div>
              <div className="text-sm font-medium ml-2">{count} errors</div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Errors List */}
      <div className="bg-white rounded-lg p-4 shadow-sm border border-gray-200">
        <h3 className="text-sm font-medium text-gray-700 mb-3">
          Recent Errors
        </h3>
        <div className="space-y-3">
          {errorStats.recentErrors.map((error) => (
            <div
              key={error.id}
              className="bg-gray-50 rounded-lg p-3 border border-gray-200"
            >
              <div className="flex justify-between text-gray-500 mb-2">
                <span className="flex items-center">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                    />
                  </svg>
                  {formatTime(error.time)}
                </span>
                <span className="flex items-center text-xs">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className="h-4 w-4 mr-1"
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={2}
                      d="M9 5l7 7-7 7"
                    />
                  </svg>
                  {error.source} → {error.destination}
                </span>
              </div>
              <div className="flex items-center">
                <span className="inline-block py-1 px-2 rounded-full text-xs bg-red-100 text-red-800 mr-2">
                  {formatRequestType(error.type)}
                </span>
                <div className="text-red-600 font-medium text-sm">
                  {error.failureReason}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
