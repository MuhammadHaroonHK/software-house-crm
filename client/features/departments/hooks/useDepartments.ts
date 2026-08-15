"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { departmentService } from "../services/department.service";

import type {
  CreateDepartmentPayload,
  DepartmentQueryParams,
  UpdateDepartmentPayload,
} from "../types/department.types";

export const DEPARTMENTS_QUERY_KEY = [
  "departments",
] as const;

export function useDepartments(
  params?: DepartmentQueryParams
) {
  return useQuery({
    queryKey: [
      ...DEPARTMENTS_QUERY_KEY,
      params,
    ],

    queryFn: () =>
      departmentService.getAll(params),

    placeholderData: keepPreviousData,

    staleTime: 30 * 1000,

    refetchOnWindowFocus: false,
  });
}

export function useCreateDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      data: CreateDepartmentPayload
    ) => departmentService.create(data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: DEPARTMENTS_QUERY_KEY,
      });
    },
  });
}

export function useUpdateDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateDepartmentPayload;
    }) =>
      departmentService.update(id, data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: DEPARTMENTS_QUERY_KEY,
      });
    },
  });
}

export function useDeleteDepartment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      departmentService.delete(id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: DEPARTMENTS_QUERY_KEY,
      });
    },
  });
}