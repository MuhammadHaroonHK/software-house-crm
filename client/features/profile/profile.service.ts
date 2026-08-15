import api from "@/lib/api";

import type {
  UserProfile,
  UpdateProfilePayload,
  ChangePasswordPayload,
  ProfileApiResponse,
} from "./profile.types";

export const profileService = {
  async getProfile() {
    const response =
      await api.get<ProfileApiResponse<UserProfile>>(
        "/users/profile"
      );

    return response.data;
  },

  async updateProfile(
    data: UpdateProfilePayload
  ) {
    const response =
      await api.patch<ProfileApiResponse<UserProfile>>(
        "/users/profile",
        data
      );

    return response.data;
  },

  async changePassword(
    data: ChangePasswordPayload
  ) {
    const response =
      await api.patch<ProfileApiResponse<null>>(
        "/users/change-password",
        data
      );

    return response.data;
  },
};