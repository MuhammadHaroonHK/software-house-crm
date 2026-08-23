"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { invoiceService } from "../services/invoice.service";

import type {
  CreateInvoicePayload,
  InvoiceQueryParams,
  UpdateInvoicePayload,
} from "../types/invoice.types";

export const INVOICES_QUERY_KEY = ["invoices"] as const;

/* -------------------------------------------------------------------------- */
/* List                                                                       */
/* -------------------------------------------------------------------------- */

export function useInvoices(params?: InvoiceQueryParams) {
  return useQuery({
    queryKey: [...INVOICES_QUERY_KEY, params],

    queryFn: () => invoiceService.getAll(params),

    placeholderData: keepPreviousData,

    staleTime: 30 * 1000,

    refetchOnWindowFocus: false,
  });
}

/* -------------------------------------------------------------------------- */
/* Single invoice                                                             */
/* -------------------------------------------------------------------------- */

export function useInvoice(id?: string) {
  return useQuery({
    queryKey: [...INVOICES_QUERY_KEY, "detail", id],

    queryFn: () => invoiceService.getById(id as string),

    enabled: Boolean(id),

    staleTime: 30 * 1000,

    refetchOnWindowFocus: false,
  });
}

/* -------------------------------------------------------------------------- */
/* Create                                                                     */
/* -------------------------------------------------------------------------- */

export function useCreateInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateInvoicePayload) => invoiceService.create(data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: INVOICES_QUERY_KEY,
      });
    },
  });
}

/* -------------------------------------------------------------------------- */
/* Update                                                                     */
/* -------------------------------------------------------------------------- */

export function useUpdateInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateInvoicePayload }) =>
      invoiceService.update(id, data),

    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({
        queryKey: INVOICES_QUERY_KEY,
      });

      queryClient.invalidateQueries({
        queryKey: [...INVOICES_QUERY_KEY, "detail", variables.id],
      });
    },
  });
}

/* -------------------------------------------------------------------------- */
/* Send                                                                       */
/* -------------------------------------------------------------------------- */

export function useSendInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => invoiceService.send(id),

    onSuccess: (response, id) => {
      queryClient.invalidateQueries({
        queryKey: INVOICES_QUERY_KEY,
      });

      queryClient.invalidateQueries({
        queryKey: [...INVOICES_QUERY_KEY, "detail", id],
      });
    },
  });
}

/* -------------------------------------------------------------------------- */
/* Delete                                                                     */
/* -------------------------------------------------------------------------- */

export function useDeleteInvoice() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => invoiceService.delete(id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: INVOICES_QUERY_KEY,
      });
    },
  });
}
