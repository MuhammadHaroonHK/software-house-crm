import api from "@/lib/api";

import type {
  CreateDepartmentPayload,
  DepartmentListResponse,
  DepartmentMutationResponse,
  DepartmentQueryParams,
  DepartmentResponse,
  UpdateDepartmentPayload,
} from "../types/department.types";

export const departmentService = {
  async getAll(
    params?: DepartmentQueryParams
  ): Promise<DepartmentListResponse> {
    const response = await api.get<DepartmentListResponse>(
      "/departments",
      {
        params,
      }
    );

    return response.data;
  },

  async getById(
    id: string
  ): Promise<DepartmentResponse> {
    const response =
      await api.get<DepartmentResponse>(
        `/departments/${id}`
      );

    return response.data;
  },

  async create(
    data: CreateDepartmentPayload
  ): Promise<DepartmentMutationResponse> {
    const response =
      await api.post<DepartmentMutationResponse>(
        "/departments",
        data
      );

    return response.data;
  },

  async update(
    id: string,
    data: UpdateDepartmentPayload
  ): Promise<DepartmentMutationResponse> {
    const response =
      await api.patch<DepartmentMutationResponse>(
        `/departments/${id}`,
        data
      );

    return response.data;
  },

  async delete(
    id: string
  ): Promise<DepartmentMutationResponse> {
    const response =
      await api.delete<DepartmentMutationResponse>(
        `/departments/${id}`
      );

    return response.data;
  },
};