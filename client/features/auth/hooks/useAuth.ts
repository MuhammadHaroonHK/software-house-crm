"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useState } from "react";

import { authService } from "../services/auth.service";
import { authStorage } from "../services/auth-storage";

import type { MeResponse } from "../types/auth.types";

export const AUTH_QUERY_KEY = ["auth", "me"] as const;

/**
 * Returns the currently authenticated user.
 *
 * The query is only enabled after the component has mounted
 * in the browser. This prevents localStorage from causing
 * SSR/hydration inconsistencies.
 */
export function useCurrentUser() {
  const [isClient, setIsClient] = useState(false);

  useEffect(() => {
    setIsClient(true);
  }, []);

  return useQuery<MeResponse>({
    queryKey: AUTH_QUERY_KEY,

    queryFn: async () => {
      const response = await authService.me();

      return response.data;
    },

    enabled: isClient && !!authStorage.getToken(),

    staleTime: 0,

    refetchOnMount: true,

    refetchOnWindowFocus: false,

    retry: false,
  });
}

/**
 * Logout the current user and clear all cached data.
 */
export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const logout = () => {
    // Remove current authentication token.
    authStorage.removeToken();

    // Remove authenticated user's cached profile.
    queryClient.removeQueries({
      queryKey: AUTH_QUERY_KEY,
    });

    // Clear all React Query cache.
    // This is important so another user cannot see
    // data belonging to the previous user after login.
    queryClient.clear();

    router.replace("/login");
  };

  return {
    logout,
  };
}
