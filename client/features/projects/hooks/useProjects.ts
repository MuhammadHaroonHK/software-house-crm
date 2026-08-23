"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { projectService } from "../services/project.service";

import type {
  ChangeProjectManagerPayload,
  ChangeProjectStatusPayload,
  CreateProjectPayload,
  ProjectQueryParams,
  UpdateProjectPayload,
} from "../types/project.types";

export const PROJECTS_QUERY_KEY = ["projects"] as const;

export function useProjects(
  params?: ProjectQueryParams,
  options?: {
    enabled?: boolean;
  },
) {
  return useQuery({
    queryKey: [...PROJECTS_QUERY_KEY, params],

    queryFn: () => projectService.getAll(params),

    placeholderData: keepPreviousData,

    staleTime: 30 * 1000,

    refetchOnWindowFocus: false,

    enabled: options?.enabled ?? true,
  });
}

export function useCreateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateProjectPayload) => projectService.create(data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: PROJECTS_QUERY_KEY,
      });
    },
  });
}

export function useUpdateProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateProjectPayload }) =>
      projectService.update(id, data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: PROJECTS_QUERY_KEY,
      });
    },
  });
}

export function useChangeProjectManager() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: ChangeProjectManagerPayload;
    }) => projectService.changeManager(id, data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: PROJECTS_QUERY_KEY,
      });
    },
  });
}

export function useChangeProjectStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: ChangeProjectStatusPayload;
    }) => projectService.changeStatus(id, data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: PROJECTS_QUERY_KEY,
      });
    },
  });
}

export function useDeleteProject() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => projectService.delete(id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: PROJECTS_QUERY_KEY,
      });
    },
  });
}
