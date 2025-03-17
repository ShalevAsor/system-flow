import { User } from "./userTypes";
import { ApiResponse } from "./apiTypes";

export type ProfileResponse = ApiResponse<User>;
export type PasswordChangeResponse = ApiResponse<null>;

export interface ProfileRequest {
  firstName?: string;
  lastName?: string;
}

export interface PasswordChangeRequest {
  currentPassword: string;
  newPassword: string;
}
