"use client";

import { useQueryClient } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { authStorage } from "../services/auth-storage";
import { CURRENT_USER_QUERY_KEY } from "./useCurrentUser";

export function useLogout() {
  const router = useRouter();
  const queryClient = useQueryClient();

  const logout = () => {
    authStorage.removeToken();

    queryClient.removeQueries({
      queryKey: CURRENT_USER_QUERY_KEY,
    });

    queryClient.clear();

    router.replace("/login");
  };

  return {
    logout,
  };
}