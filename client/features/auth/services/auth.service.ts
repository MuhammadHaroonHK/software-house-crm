import api from "@/lib/api";
import type {
  LoginPayload,
  LoginResponse,
  MeResponse,
} from "../types/auth.types";

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export const authService = {
  async login(payload: LoginPayload): Promise<ApiResponse<LoginResponse>> {
    const response = await api.post<ApiResponse<LoginResponse>>(
      "/auth/login",
      payload
    );

    return response.data;
  },

  async me(): Promise<ApiResponse<MeResponse>> {
    const response = await api.get<ApiResponse<MeResponse>>("/auth/me");

    return response.data;
  },
};