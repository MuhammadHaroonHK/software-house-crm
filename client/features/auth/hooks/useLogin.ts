"use client";

import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import { authService } from "../services/auth.service";
import { authStorage } from "../services/auth-storage";
import { ME_QUERY_KEY } from "./useMe";

import type { LoginPayload } from "../types/auth.types";

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: LoginPayload) =>
      authService.login(payload),

    onSuccess: async (response) => {
      // Store the NEW user's token first.
      authStorage.setToken(
        response.data.accessToken
      );

      // Remove any previous user's cached profile.
      queryClient.removeQueries({
        queryKey: ME_QUERY_KEY,
      });

      // Fetch the profile using the NEW token.
      await queryClient.fetchQuery({
        queryKey: ME_QUERY_KEY,

        queryFn: async () => {
          const response = await authService.me();

          return response.data;
        },
      });
    },
  });
}