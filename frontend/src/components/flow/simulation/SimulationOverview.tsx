import { useShallow } from "zustand/react/shallow";
import { useSimulationStore } from "../../../store/simulationStore";
import { StatsLabel } from "./common/StatsLabel";
import { useMemo } from "react";

export const SimulationOverview: React.FC = () => {
  const {
    elapsedTime,
    averageResponseTime,
    averageRequestSize,
    activeRequests,
    completedRequests,
    failedRequests,
    metricHistory,
  } = useSimulationStore(
    useShallow((state) => ({
      elapsedTime: state.elapsedTime,
      averageResponseTime: state.averageResponseTime,
      averageRequestSize: state.averageRequestSize,
      activeRequests: state.activeRequests,
      completedRequests: state.completedRequests,
      failedRequests: state.failedRequests,
      metricHistory: state.metricHistory,
    }))
  );
  const stats = useMemo(() => {
    // Format elapsed time to seconds (from milliseconds)
    const formattedElapsedTime = (elapsedTime / 1000).toFixed(2);
    // Calculate success rate
    const totalRequests = completedRequests + failedRequests;
    const successRate =
      totalRequests > 0
        ? ((completedRequests / totalRequests) * 100).toFixed(2)
        : 0;
    // Calculate error rate
    const errorRate =
      totalRequests > 0
        ? ((failedRequests / totalRequests) * 100).toFixed(2)
        : 0;
    // Calculate requests per second (RPS)
    // Using the last few data points from metricHistory to calculate rate
    let rps = 0;
    if (metricHistory.length >= 2) {
      const lastIndex = metricHistory.length - 1;
      const timeWindow =
        (metricHistory[lastIndex].timestamp -
          metricHistory[Math.max(0, lastIndex - 10)].timestamp) /
        1000;

      if (timeWindow > 0) {
        const requestsDelta =
          metricHistory[lastIndex].completedRequestCount -
          metricHistory[Math.max(0, lastIndex - 10)].completedRequestCount;
        rps = requestsDelta / timeWindow;
      }
    }

    return {
      elapsedTime: formattedElapsedTime,
      averageResponseTime: averageResponseTime.toFixed(0),
      averageRequestSize: averageRequestSize.toFixed(0),
      activeRequests,
      rps,
      completedRequests,
      failedRequests,
      successRate,
      errorRate,
    };
  }, [
    elapsedTime,
    averageResponseTime,
    activeRequests,
    completedRequests,
    failedRequests,
    metricHistory,
    averageRequestSize,
  ]);

  return (
    <div className="flex flex-col gap-y-1.5 p-4">
      <div className="grid grid-cols-2 gap-x-1.5">
        <StatsLabel
          label="Elapsed Time"
          value={stats.elapsedTime}
          unit="s"
          color="info"
        />
        <StatsLabel
          label="Avg Response Time"
          value={stats.averageResponseTime}
          unit="ms"
          color="default"
        />
      </div>
      <div className="grid grid-cols-2 gap-1.5">
        <StatsLabel
          label="Active Requests"
          value={stats.activeRequests}
          color="info"
        />
        <StatsLabel
          label="RPS"
          value={stats.rps}
          unit="req/s"
          color="default"
        />
        <StatsLabel
          label="Completed Requests"
          value={stats.completedRequests}
          color={"success"}
        />
        <StatsLabel
          label="Failed Requests"
          value={stats.failedRequests}
          color={"error"}
        />
        <StatsLabel
          label="Success Rate"
          value={stats.successRate}
          unit="%"
          color={"success"}
        />
        <StatsLabel
          label="Error Rate"
          value={stats.errorRate}
          unit="%"
          color={"error"}
        />
      </div>
      <StatsLabel
        label="Avg Request Size"
        value={stats.averageRequestSize}
        unit="KB"
        color="info"
      />
    </div>
  );
};
