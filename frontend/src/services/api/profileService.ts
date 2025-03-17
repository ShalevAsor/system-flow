import apiClient from "./apiClient";
import { User } from "../../types/userTypes";
import {
  ProfileResponse,
  ProfileRequest,
  PasswordChangeRequest,
  PasswordChangeResponse,
} from "../../types/profileTypes";

const profileService = {
  getProfile: async (): Promise<User> => {
    const response = await apiClient.get<ProfileResponse>("/profile");
    return response.data.data;
  },
  updateProfile: async (profileData: ProfileRequest): Promise<User> => {
    const response = await apiClient.put<ProfileResponse>(
      "/profile",
      profileData
    );
    return response.data.data;
  },
  changePassword: async (
    passwordData: PasswordChangeRequest
  ): Promise<string> => {
    const response = await apiClient.put<PasswordChangeResponse>(
      "/profile/change-password",
      passwordData
    );
    return response.data.message;
  },
};

export default profileService;
