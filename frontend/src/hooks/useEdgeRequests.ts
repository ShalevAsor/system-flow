// import { useMemo } from "react";
// import { useSimulationStore } from "../store/simulationStore";

// // Maximum number of requests to process for visualization on a single edge
// const MAX_REQUESTS_PER_EDGE = 20;

// export const useEdgeRequests = (edgeId: string) => {
//   const requestsInFlight = useSimulationStore(
//     (state) => state.requestsInFlight
//   );
//   const isRunning = useSimulationStore((state) => state.isRunning);

//   // Memoize the filtered result
//   return useMemo(() => {
//     if (!isRunning) return [];

//     // Filter requests for this edge
//     const edgeRequests = requestsInFlight
//       .filter((request) => request.currentEdgeId === edgeId)
//       .sort((a, b) => a.createdAt - b.createdAt);

//     // If there are more requests than our limit, take the most recent ones
//     // You could alternatively take the first ones or a sample across all
//     if (edgeRequests.length > MAX_REQUESTS_PER_EDGE) {
//       return edgeRequests.slice(-MAX_REQUESTS_PER_EDGE);
//     }

//     return edgeRequests;
//   }, [edgeId, isRunning, requestsInFlight]);
// };
import { useEffect, useMemo, useRef, useState } from "react";
import { useSimulationStore } from "../store/simulationStore";
import { SimulationRequest } from "../types/flow/simulationTypes";

// Maximum number of requests to process for visualization on a single edge
const MAX_REQUESTS_PER_EDGE = 20;
// How long to keep a request visible after it leaves the edge (in ms)
const REQUEST_FADE_TIME = 500;

interface TrackedRequest {
  request: SimulationRequest;
  visibleUntil: number; // Timestamp when this request should disappear
  stable: boolean; // Whether this request has a stable position on this edge
}

export const useEdgeRequests = (edgeId: string) => {
  const requestsInFlight = useSimulationStore(
    (state) => state.requestsInFlight
  );
  const isRunning = useSimulationStore((state) => state.isRunning);

  // Keep a reference to tracked requests with their fade times
  const [trackedRequests, setTrackedRequests] = useState<TrackedRequest[]>([]);

  // Reference to last processed requests to detect changes
  const lastRequestsRef = useRef<string[]>([]);

  // Animation frame request ID for cleanup
  const animFrameRef = useRef<number | null>(null);

  // Update tracked requests when simulation state changes
  useEffect(() => {
    if (!isRunning) {
      // Clear all when simulation stops
      setTrackedRequests([]);
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
      return;
    }

    // Get IDs of current requests on this edge
    const currentRequestIds = requestsInFlight
      .filter((req) => req.currentEdgeId === edgeId)
      .map((req) => req.id);

    // Check if the request list has changed
    const requestsChanged =
      currentRequestIds.length !== lastRequestsRef.current.length ||
      currentRequestIds.some((id) => !lastRequestsRef.current.includes(id));

    if (requestsChanged) {
      const now = Date.now();

      // Update the tracked requests
      setTrackedRequests((prev) => {
        // First, update existing requests and mark those no longer on edge for fading
        const updated = prev.map((item) => {
          if (currentRequestIds.includes(item.request.id)) {
            // Find the updated request data
            const updatedRequest = requestsInFlight.find(
              (r) => r.id === item.request.id
            );
            if (updatedRequest) {
              return {
                ...item,
                request: updatedRequest,
                stable: true, // Mark as stable after it's been on this edge
                visibleUntil: now + REQUEST_FADE_TIME,
              };
            }
          }

          // If request was on this edge but is no longer, mark it for fading out
          if (
            item.request.currentEdgeId === edgeId &&
            !currentRequestIds.includes(item.request.id)
          ) {
            return {
              ...item,
              visibleUntil: now + REQUEST_FADE_TIME,
            };
          }

          return item;
        });

        // Add new requests that aren't already being tracked
        const existingIds = updated.map((item) => item.request.id);
        const newRequests = requestsInFlight
          .filter(
            (req) =>
              req.currentEdgeId === edgeId && !existingIds.includes(req.id)
          )
          .map((req) => ({
            request: req,
            visibleUntil: now + REQUEST_FADE_TIME,
            stable: false, // New requests start as unstable
          }));

        // Combine and sort by creation time for consistency
        return [...updated, ...newRequests].sort(
          (a, b) => a.request.createdAt - b.request.createdAt
        );
      });

      // Update reference for next comparison
      lastRequestsRef.current = currentRequestIds;
    }

    // Set up animation frame to handle cleanups
    const cleanup = () => {
      const now = Date.now();

      setTrackedRequests((prev) => {
        // Remove requests that have exceeded their visible-until time
        const filtered = prev.filter((item) => item.visibleUntil > now);

        // If we have too many, prioritize keeping stable ones and newer ones
        if (filtered.length > MAX_REQUESTS_PER_EDGE) {
          // Sort by stability first (stable ones first), then by creation time (newer first)
          return filtered
            .sort((a, b) => {
              if (a.stable !== b.stable) return b.stable ? 1 : -1;
              return b.request.createdAt - a.request.createdAt;
            })
            .slice(0, MAX_REQUESTS_PER_EDGE);
        }

        return filtered;
      });

      animFrameRef.current = requestAnimationFrame(cleanup);
    };

    if (!animFrameRef.current) {
      animFrameRef.current = requestAnimationFrame(cleanup);
    }

    // Cleanup function
    return () => {
      if (animFrameRef.current) {
        cancelAnimationFrame(animFrameRef.current);
        animFrameRef.current = null;
      }
    };
  }, [edgeId, isRunning, requestsInFlight]);

  // Filter and limit the requests for rendering
  return useMemo(() => {
    return trackedRequests.map((item) => item.request);
  }, [trackedRequests]);
};
