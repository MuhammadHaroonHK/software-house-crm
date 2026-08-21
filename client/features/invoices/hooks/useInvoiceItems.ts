"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { invoiceItemService } from "../services/invoiceItem.service";

import {
  INVOICES_QUERY_KEY,
} from "./useInvoices";

import type {
  CreateInvoiceItemPayload,
  UpdateInvoiceItemPayload,
} from "../types/invoiceItem.types";

export const INVOICE_ITEMS_QUERY_KEY = [
  "invoice-items",
] as const;

/* -------------------------------------------------------------------------- */
/* List                                                                       */
/* -------------------------------------------------------------------------- */

export function useInvoiceItems(
  invoiceId?: string,
) {
  return useQuery({
    queryKey: [
      ...INVOICE_ITEMS_QUERY_KEY,
      invoiceId,
    ],

    queryFn: () =>
      invoiceItemService.getAll(
        invoiceId as string,
      ),

    enabled: Boolean(invoiceId),

    staleTime: 30 * 1000,

    refetchOnWindowFocus: false,
  });
}

/* -------------------------------------------------------------------------- */
/* Create                                                                     */
/* -------------------------------------------------------------------------- */

export function useCreateInvoiceItem() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: ({
      invoiceId,
      data,
    }: {
      invoiceId: string;
      data: CreateInvoiceItemPayload;
    }) =>
      invoiceItemService.create(
        invoiceId,
        data,
      ),

    onSuccess: (
      _response,
      variables,
    ) => {
      queryClient.invalidateQueries({
        queryKey:
          INVOICE_ITEMS_QUERY_KEY,
      });

      queryClient.invalidateQueries({
        queryKey:
          INVOICES_QUERY_KEY,
      });

      queryClient.invalidateQueries({
        queryKey: [
          ...INVOICES_QUERY_KEY,
          "detail",
          variables.invoiceId,
        ],
      });
    },
  });
}

/* -------------------------------------------------------------------------- */
/* Update                                                                     */
/* -------------------------------------------------------------------------- */

export function useUpdateInvoiceItem() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: ({
      itemId,
      data,
    }: {
      itemId: string;
      data: UpdateInvoiceItemPayload;
    }) =>
      invoiceItemService.update(
        itemId,
        data,
      ),

    onSuccess: (
      response,
    ) => {
      queryClient.invalidateQueries({
        queryKey:
          INVOICE_ITEMS_QUERY_KEY,
      });

      queryClient.invalidateQueries({
        queryKey:
          INVOICES_QUERY_KEY,
      });

      return response;
    },
  });
}

/* -------------------------------------------------------------------------- */
/* Delete                                                                     */
/* -------------------------------------------------------------------------- */

export function useDeleteInvoiceItem() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (
      itemId: string,
    ) =>
      invoiceItemService.delete(
        itemId,
      ),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey:
          INVOICE_ITEMS_QUERY_KEY,
      });

      queryClient.invalidateQueries({
        queryKey:
          INVOICES_QUERY_KEY,
      });
    },
  });
}