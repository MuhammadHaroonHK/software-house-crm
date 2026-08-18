import api from "@/lib/api";

import type {
  CreateTaskPayload,
  TaskListResponse,
  TaskMutationResponse,
  TaskQueryParams,
  TaskResponse,
  UpdateTaskPayload,
  UpdateTaskStatusPayload,
} from "../types/task.types";

export const taskService = {
  async getAll(
    params?: TaskQueryParams
  ): Promise<TaskListResponse> {
    const response =
      await api.get<TaskListResponse>(
        "/tasks",
        {
          params,
        }
      );

    return response.data;
  },

  async getById(
    id: string
  ): Promise<TaskResponse> {
    const response =
      await api.get<TaskResponse>(
        `/tasks/${id}`
      );

    return response.data;
  },

  async create(
    data: CreateTaskPayload
  ): Promise<TaskMutationResponse> {
    const response =
      await api.post<TaskMutationResponse>(
        "/tasks",
        data
      );

    return response.data;
  },

  async update(
    id: string,
    data: UpdateTaskPayload
  ): Promise<TaskMutationResponse> {
    const response =
      await api.patch<TaskMutationResponse>(
        `/tasks/${id}`,
        data
      );

    return response.data;
  },

  async updateStatus(
    id: string,
    data: UpdateTaskStatusPayload
  ): Promise<TaskMutationResponse> {
    const response =
      await api.patch<TaskMutationResponse>(
        `/tasks/${id}/status`,
        data
      );

    return response.data;
  },

  async delete(
    id: string
  ): Promise<TaskMutationResponse> {
    const response =
      await api.delete<TaskMutationResponse>(
        `/tasks/${id}`
      );

    return response.data;
  },
};