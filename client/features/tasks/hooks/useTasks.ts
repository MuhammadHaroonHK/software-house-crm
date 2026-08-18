"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { taskService } from "../services/task.service";

import type {
  CreateTaskPayload,
  TaskQueryParams,
  UpdateTaskPayload,
  UpdateTaskStatusPayload,
} from "../types/task.types";

export const TASKS_QUERY_KEY = [
  "tasks",
] as const;

export function useTasks(
  params?: TaskQueryParams
) {
  return useQuery({
    queryKey: [
      ...TASKS_QUERY_KEY,
      params,
    ],

    queryFn: () =>
      taskService.getAll(params),

    placeholderData:
      keepPreviousData,

    staleTime: 30 * 1000,

    refetchOnWindowFocus: false,
  });
}

export function useCreateTask() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (
      data: CreateTaskPayload
    ) =>
      taskService.create(data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: TASKS_QUERY_KEY,
      });
    },
  });
}

export function useUpdateTask() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateTaskPayload;
    }) =>
      taskService.update(
        id,
        data
      ),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: TASKS_QUERY_KEY,
      });
    },
  });
}

export function useUpdateTaskStatus() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateTaskStatusPayload;
    }) =>
      taskService.updateStatus(
        id,
        data
      ),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: TASKS_QUERY_KEY,
      });
    },
  });
}

export function useDeleteTask() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      taskService.delete(id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: TASKS_QUERY_KEY,
      });
    },
  });
}