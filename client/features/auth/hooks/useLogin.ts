"use client";

import {
  useMutation,
  useQueryClient,
} from "@tanstack/react-query";

import { authService } from "../services/auth.service";
import { authStorage } from "../services/auth-storage";

import { AUTH_QUERY_KEY } from "./useAuth";

import type { LoginPayload } from "../types/auth.types";

export function useLogin() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: LoginPayload) =>
      authService.login(payload),

    onSuccess: async (response) => {
      /*
       * Store the NEW user's token first.
       */
      authStorage.setToken(
        response.data.accessToken
      );

      /*
       * Remove any cached profile belonging
       * to the previous user.
       */
      queryClient.removeQueries({
        queryKey: AUTH_QUERY_KEY,
      });

      /*
       * Fetch the current user's profile using
       * the NEW access token.
       */
      await queryClient.fetchQuery({
        queryKey: AUTH_QUERY_KEY,

        queryFn: async () => {
          const response = await authService.me();

          return response.data;
        },

        staleTime: 0,
      });
    },
  });
}