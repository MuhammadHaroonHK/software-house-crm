"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { userService } from "../services/user.service";

import type {
  CreateUserPayload,
  UpdateUserPayload,
  UpdateUserStatusPayload,
  UserFilters,
} from "../types/user.types";

export const USERS_QUERY_KEY = ["users"] as const;

export const DEPARTMENTS_QUERY_KEY = ["departments"] as const;

export const CLIENTS_QUERY_KEY = ["clients"] as const;

/**
 * Get paginated users.
 */
export function useUsers(filters: UserFilters) {
  return useQuery({
    queryKey: [...USERS_QUERY_KEY, filters],

    queryFn: async () => {
      const response = await userService.getUsers(filters);

      return {
        users: response.data,
        meta: response.meta,
      };
    },

    staleTime: 30_000,

    refetchOnWindowFocus: false,

    retry: false,
  });
}

/**
 * Get a single user.
 */
export function useUser(id: string, enabled = true) {
  return useQuery({
    queryKey: [...USERS_QUERY_KEY, id],

    queryFn: async () => {
      const response = await userService.getUser(id);

      return response.data;
    },

    enabled: enabled && !!id,

    staleTime: 30_000,

    refetchOnWindowFocus: false,

    retry: false,
  });
}

/**
 * Get departments for user assignment.
 */
export function useDepartments() {
  return useQuery({
    queryKey: DEPARTMENTS_QUERY_KEY,

    queryFn: async () => {
      const response = await userService.getDepartments();

      return response.data;
    },

    staleTime: 5 * 60 * 1000,

    refetchOnWindowFocus: false,

    retry: false,
  });
}

/**
 * Get clients for user assignment.
 */
export function useClients() {
  return useQuery({
    queryKey: CLIENTS_QUERY_KEY,

    queryFn: async () => {
      const response = await userService.getClients();

      return response.data;
    },

    staleTime: 5 * 60 * 1000,

    refetchOnWindowFocus: false,

    retry: false,
  });
}

/**
 * Create user.
 */
export function useCreateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateUserPayload) => userService.createUser(data),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: USERS_QUERY_KEY,
      });
    },
  });
}

/**
 * Update user.
 */
export function useUpdateUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserPayload }) =>
      userService.updateUser(id, data),

    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({
        queryKey: USERS_QUERY_KEY,
      });

      await queryClient.invalidateQueries({
        queryKey: [...USERS_QUERY_KEY, variables.id],
      });
    },
  });
}

/**
 * Update user status.
 */
export function useUpdateUserStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateUserStatusPayload }) =>
      userService.updateUserStatus(id, data),

    onSuccess: async (_, variables) => {
      await queryClient.invalidateQueries({
        queryKey: USERS_QUERY_KEY,
      });

      await queryClient.invalidateQueries({
        queryKey: [...USERS_QUERY_KEY, variables.id],
      });
    },
  });
}

/**
 * Delete user.
 */
export function useDeleteUser() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => userService.deleteUser(id),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: USERS_QUERY_KEY,
      });
    },
  });
}
