"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { clientService } from "../services/client.service";

import type {
  ClientQueryParams,
  CreateClientPayload,
  UpdateClientPayload,
} from "../types/client.types";

export const CLIENTS_QUERY_KEY = [
  "clients",
] as const;

export function useClients(
  params?: ClientQueryParams
) {
  return useQuery({
    queryKey: [
      ...CLIENTS_QUERY_KEY,
      params,
    ],

    queryFn: () =>
      clientService.getAll(params),

    placeholderData: keepPreviousData,

    staleTime: 30 * 1000,

    refetchOnWindowFocus: false,
  });
}

export function useCreateClient() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (
      data: CreateClientPayload
    ) =>
      clientService.create(data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: CLIENTS_QUERY_KEY,
      });
    },
  });
}

export function useUpdateClient() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateClientPayload;
    }) =>
      clientService.update(
        id,
        data
      ),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: CLIENTS_QUERY_KEY,
      });
    },
  });
}

export function useDeleteClient() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      clientService.delete(id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: CLIENTS_QUERY_KEY,
      });
    },
  });
}