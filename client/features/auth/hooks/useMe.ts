"use client";

import { useQuery } from "@tanstack/react-query";
import { authService } from "../services/auth.service";
import { authStorage } from "../services/auth-storage";

export function useMe() {
  const token = authStorage.getToken();

  return useQuery({
    queryKey: ["auth", "me"],
    queryFn: async () => {
      const response = await authService.me();
      return response.data;
    },
    enabled: !!token,
    retry: false,
  });
}