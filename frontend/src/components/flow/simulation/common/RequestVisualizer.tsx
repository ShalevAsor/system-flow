import { FC, useMemo } from "react";
import { SimulationRequest } from "../../../../types/flow/simulationTypes";

interface RequestVisualizerProps {
  edgePath: string;
  request: SimulationRequest;
  // Removed unused parameters from interface
}

const getRequestColor = (retryCount: number): string => {
  if (retryCount === 0) {
    return "#2196F3"; // Blue
  } else if (retryCount === 1) {
    return "#8707ff"; // Purple
  } else if (retryCount === 2) {
    return "#FFC107"; // Amber
  } else {
    return "#F44336"; // Red
  }
};

export const RequestVisualizer: FC<RequestVisualizerProps> = ({
  edgePath,
  request,
  // Removed unused parameters
}) => {
  // Move useMemo hook before any conditional returns
  const stableOffset = useMemo(() => {
    if (!request) return 0;

    const hash = Array.from(request.id).reduce(
      (acc, char) => acc + char.charCodeAt(0),
      0
    );
    return (hash % 10) / 10;
  }, [request]);

  if (!request) return null;

  const color = getRequestColor(request.processingData.retryCount);
  console.log(
    "RetryCount:",
    request.processingData.retryCount,
    "maxRetires:",
    request.maxRetries
  );
  const animationKey = `${request.id}-${edgePath.length}`;

  return (
    <g key={animationKey}>
      <circle r="5" fill={color}>
        <animateMotion
          id={animationKey}
          dur="1.5s"
          repeatCount="indefinite"
          path={edgePath}
          begin={`${stableOffset}s`}
        />
      </circle>
    </g>
  );
};
