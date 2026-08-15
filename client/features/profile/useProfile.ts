"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { profileService } from "./profile.service";

import type {
  ChangePasswordPayload,
  UpdateProfilePayload,
} from "./profile.types";

export const PROFILE_QUERY_KEY = [
  "profile",
];

export function useProfile() {
  return useQuery({
    queryKey: PROFILE_QUERY_KEY,

    queryFn: async () => {
      const response =
        await profileService.getProfile();

      return response.data;
    },

    staleTime: 0,

    refetchOnMount: true,

    refetchOnWindowFocus: false,

    retry: false,
  });
}

export function useUpdateProfile() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (
      data: UpdateProfilePayload
    ) =>
      profileService.updateProfile(data),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: PROFILE_QUERY_KEY,
      });

      // Keep the authenticated user's
      // cached information synchronized.
      await queryClient.invalidateQueries({
        queryKey: ["auth", "me"],
      });
    },
  });
}

export function useChangePassword() {
  return useMutation({
    mutationFn: (
      data: ChangePasswordPayload
    ) =>
      profileService.changePassword(data),
  });
}