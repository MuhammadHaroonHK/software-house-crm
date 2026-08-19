"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { quotationService } from "../services/quotation.service";

import type {
  CreateQuotationPayload,
  QuotationQueryParams,
  UpdateQuotationPayload,
} from "../types/quotation.types";

export const QUOTATIONS_QUERY_KEY = [
  "quotations",
] as const;

export function useQuotations(
  params?: QuotationQueryParams
) {
  return useQuery({
    queryKey: [
      ...QUOTATIONS_QUERY_KEY,
      params,
    ],

    queryFn: () =>
      quotationService.getAll(params),

    placeholderData:
      keepPreviousData,

    staleTime: 30 * 1000,

    refetchOnWindowFocus: false,
  });
}

export function useQuotation(
  id?: string
) {
  return useQuery({
    queryKey: [
      ...QUOTATIONS_QUERY_KEY,
      "detail",
      id,
    ],

    queryFn: () =>
      quotationService.getById(
        id as string
      ),

    enabled: Boolean(id),

    staleTime: 30 * 1000,

    refetchOnWindowFocus: false,
  });
}

export function useCreateQuotation() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (
      data: CreateQuotationPayload
    ) =>
      quotationService.create(
        data
      ),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey:
          QUOTATIONS_QUERY_KEY,
      });
    },
  });
}

export function useUpdateQuotation() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateQuotationPayload;
    }) =>
      quotationService.update(
        id,
        data
      ),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey:
          QUOTATIONS_QUERY_KEY,
      });

      queryClient.invalidateQueries({
        queryKey: [
          ...QUOTATIONS_QUERY_KEY,
          "detail",
          variables.id,
        ],
      });
    },
  });
}

export function useSendQuotation() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (
      id: string
    ) =>
      quotationService.send(id),

    onSuccess: (_, id) => {
      queryClient.invalidateQueries({
        queryKey:
          QUOTATIONS_QUERY_KEY,
      });

      queryClient.invalidateQueries({
        queryKey: [
          ...QUOTATIONS_QUERY_KEY,
          "detail",
          id,
        ],
      });
    },
  });
}

export function useAcceptQuotation() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (
      id: string
    ) =>
      quotationService.accept(id),

    onSuccess: (_, id) => {
      queryClient.invalidateQueries({
        queryKey:
          QUOTATIONS_QUERY_KEY,
      });

      queryClient.invalidateQueries({
        queryKey: [
          ...QUOTATIONS_QUERY_KEY,
          "detail",
          id,
        ],
      });
    },
  });
}

export function useRejectQuotation() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (
      id: string
    ) =>
      quotationService.reject(id),

    onSuccess: (_, id) => {
      queryClient.invalidateQueries({
        queryKey:
          QUOTATIONS_QUERY_KEY,
      });

      queryClient.invalidateQueries({
        queryKey: [
          ...QUOTATIONS_QUERY_KEY,
          "detail",
          id,
        ],
      });
    },
  });
}

export function useExpireQuotation() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (
      id: string
    ) =>
      quotationService.expire(id),

    onSuccess: (_, id) => {
      queryClient.invalidateQueries({
        queryKey:
          QUOTATIONS_QUERY_KEY,
      });

      queryClient.invalidateQueries({
        queryKey: [
          ...QUOTATIONS_QUERY_KEY,
          "detail",
          id,
        ],
      });
    },
  });
}

export function useDeleteQuotation() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (
      id: string
    ) =>
      quotationService.delete(id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey:
          QUOTATIONS_QUERY_KEY,
      });
    },
  });
}