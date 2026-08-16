import api from "@/lib/api";

import type {
  ApiResponse,
  CreateUserPayload,
  Department,
  UpdateUserPayload,
  UpdateUserStatusPayload,
  User,
  UserFilters,
} from "../types/user.types";

export const userService = {
  async getUsers(
    filters: UserFilters = {}
  ): Promise<ApiResponse<User[]>> {
    const response = await api.get<ApiResponse<User[]>>(
      "/users",
      {
        params: {
          page: filters.page ?? 1,
          limit: filters.limit ?? 10,
          search: filters.search || undefined,
          role: filters.role || undefined,
          status: filters.status || undefined,
          departmentId:
            filters.departmentId || undefined,
          sortBy:
            filters.sortBy ?? "createdAt",
          sortOrder:
            filters.sortOrder ?? "desc",
        },
      }
    );

    return response.data;
  },

  async getUser(
    id: string
  ): Promise<ApiResponse<User>> {
    const response = await api.get<ApiResponse<User>>(
      `/users/${id}`
    );

    return response.data;
  },

  async createUser(
    payload: CreateUserPayload
  ): Promise<ApiResponse<User>> {
    const response =
      await api.post<ApiResponse<User>>(
        "/users",
        payload
      );

    return response.data;
  },

  async updateUser(
    id: string,
    payload: UpdateUserPayload
  ): Promise<ApiResponse<User>> {
    const response =
      await api.patch<ApiResponse<User>>(
        `/users/${id}`,
        payload
      );

    return response.data;
  },

  async updateUserStatus(
    id: string,
    payload: UpdateUserStatusPayload
  ): Promise<ApiResponse<User>> {
    const response =
      await api.patch<ApiResponse<User>>(
        `/users/${id}/status`,
        payload
      );

    return response.data;
  },

  async deleteUser(
    id: string
  ): Promise<ApiResponse<null>> {
    const response =
      await api.delete<ApiResponse<null>>(
        `/users/${id}`
      );

    return response.data;
  },

  async getDepartments(): Promise<
    ApiResponse<Department[]>
  > {
    const response =
      await api.get<ApiResponse<Department[]>>(
        "/departments",
        {
          params: {
            page: 1,
            limit: 100,
            sortBy: "name",
            sortOrder: "asc",
          },
        }
      );

    return response.data;
  },
};