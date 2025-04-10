// src/hooks/useFlows.ts
import { useQuery } from "@tanstack/react-query";
import flowService from "../services/api/flowService";

export const useFlows = () => {
  return useQuery({
    queryKey: ["flows"],
    queryFn: flowService.getFlows,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });
};
