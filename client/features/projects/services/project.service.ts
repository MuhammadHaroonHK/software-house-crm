import api from "@/lib/api";

import type {
  ChangeProjectManagerPayload,
  ChangeProjectStatusPayload,
  CreateProjectPayload,
  ProjectListResponse,
  ProjectMutationResponse,
  ProjectQueryParams,
  ProjectResponse,
  UpdateProjectPayload,
} from "../types/project.types";

export const projectService = {
  async getAll(
    params?: ProjectQueryParams
  ): Promise<ProjectListResponse> {
    const response =
      await api.get<ProjectListResponse>(
        "/projects",
        {
          params,
        }
      );

    return response.data;
  },

  async getById(
    id: string
  ): Promise<ProjectResponse> {
    const response =
      await api.get<ProjectResponse>(
        `/projects/${id}`
      );

    return response.data;
  },

  async create(
    data: CreateProjectPayload
  ): Promise<ProjectMutationResponse> {
    const response =
      await api.post<ProjectMutationResponse>(
        "/projects",
        data
      );

    return response.data;
  },

  async update(
    id: string,
    data: UpdateProjectPayload
  ): Promise<ProjectMutationResponse> {
    const response =
      await api.patch<ProjectMutationResponse>(
        `/projects/${id}`,
        data
      );

    return response.data;
  },

  async changeManager(
    id: string,
    data: ChangeProjectManagerPayload
  ): Promise<ProjectMutationResponse> {
    const response =
      await api.patch<ProjectMutationResponse>(
        `/projects/${id}/manager`,
        data
      );

    return response.data;
  },

  async changeStatus(
    id: string,
    data: ChangeProjectStatusPayload
  ): Promise<ProjectMutationResponse> {
    const response =
      await api.patch<ProjectMutationResponse>(
        `/projects/${id}/status`,
        data
      );

    return response.data;
  },

  async delete(
    id: string
  ): Promise<ProjectMutationResponse> {
    const response =
      await api.delete<ProjectMutationResponse>(
        `/projects/${id}`
      );

    return response.data;
  },
};