"use client";

import { useMutation } from "@tanstack/react-query";
import { authService } from "../services/auth.service";
import { authStorage } from "../services/auth-storage";
import type { LoginPayload } from "../types/auth.types";

export function useLogin() {
  return useMutation({
    mutationFn: (payload: LoginPayload) => authService.login(payload),

    onSuccess: (response) => {
      authStorage.setToken(response.data.accessToken);
    },
  });
}