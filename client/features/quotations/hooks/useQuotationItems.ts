"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  quotationItemService,
} from "../services/quotationItem.service";

import {
  QUOTATIONS_QUERY_KEY,
} from "./useQuotations";

import type {
  CreateQuotationItemPayload,
  UpdateQuotationItemPayload,
} from "../types/quotation.types";

export const QUOTATION_ITEMS_QUERY_KEY = [
  "quotation-items",
] as const;

export function useQuotationItems(
  quotationId?: string
) {
  return useQuery({
    queryKey: [
      ...QUOTATION_ITEMS_QUERY_KEY,
      quotationId,
    ],

    queryFn: () =>
      quotationItemService.getAll(
        quotationId as string
      ),

    enabled: Boolean(
      quotationId
    ),

    staleTime: 30 * 1000,

    refetchOnWindowFocus: false,
  });
}

export function useCreateQuotationItem() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: ({
      quotationId,
      data,
    }: {
      quotationId: string;
      data: CreateQuotationItemPayload;
    }) =>
      quotationItemService.create(
        quotationId,
        data
      ),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey:
          QUOTATION_ITEMS_QUERY_KEY,
      });

      queryClient.invalidateQueries({
        queryKey:
          QUOTATIONS_QUERY_KEY,
      });

      queryClient.invalidateQueries({
        queryKey: [
          ...QUOTATIONS_QUERY_KEY,
          "detail",
          variables.quotationId,
        ],
      });
    },
  });
}

export function useUpdateQuotationItem() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: ({
      itemId,
      quotationId,
      data,
    }: {
      itemId: string;
      quotationId: string;
      data: UpdateQuotationItemPayload;
    }) =>
      quotationItemService.update(
        itemId,
        data
      ),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey:
          QUOTATION_ITEMS_QUERY_KEY,
      });

      queryClient.invalidateQueries({
        queryKey:
          QUOTATIONS_QUERY_KEY,
      });

      queryClient.invalidateQueries({
        queryKey: [
          ...QUOTATIONS_QUERY_KEY,
          "detail",
          variables.quotationId,
        ],
      });
    },
  });
}

export function useDeleteQuotationItem() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: ({
      itemId,
      quotationId,
    }: {
      itemId: string;
      quotationId: string;
    }) =>
      quotationItemService.delete(
        itemId
      ),

    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({
        queryKey:
          QUOTATION_ITEMS_QUERY_KEY,
      });

      queryClient.invalidateQueries({
        queryKey:
          QUOTATIONS_QUERY_KEY,
      });

      queryClient.invalidateQueries({
        queryKey: [
          ...QUOTATIONS_QUERY_KEY,
          "detail",
          variables.quotationId,
        ],
      });
    },
  });
}