// src/hooks/useUser.ts
import { useQuery } from "@tanstack/react-query";
import profileService from "../services/api/profileService";
import { useAuthStore } from "../store/authStore";
import { AppError } from "../types/errors";
import { User } from "../services/api/authService";

/**
 * Hook to fetch and access user data
 * Only fetches when the user is authenticated
 */
export const useUser = () => {
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  return useQuery<User, AppError>({
    queryKey: ["user"],
    queryFn: profileService.getProfile,
    enabled: isAuthenticated,
    staleTime: 5 * 60 * 1000, // 5 minutes
    refetchOnWindowFocus: false,
  });
};
