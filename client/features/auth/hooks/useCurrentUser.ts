"use client";

import { useQuery } from "@tanstack/react-query";
import { authService } from "../services/auth.service";
import { authStorage } from "../services/auth-storage";

export const CURRENT_USER_QUERY_KEY = ["auth", "me"];

export function useCurrentUser() {
  return useQuery({
    queryKey: CURRENT_USER_QUERY_KEY,

    queryFn: async () => {
      const response = await authService.me();
      return response.data;
    },

    enabled: !!authStorage.getToken(),

    staleTime: 0,

    refetchOnMount: true,

    refetchOnWindowFocus: false,

    retry: false,
  });
}