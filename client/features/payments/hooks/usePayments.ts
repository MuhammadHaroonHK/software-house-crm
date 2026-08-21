"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { paymentService } from "../services/payment.service";

import type {
  CreatePaymentPayload,
  PaymentQueryParams,
} from "../types/payment.types";

export const PAYMENTS_QUERY_KEY = [
  "payments",
] as const;

/* -------------------------------------------------------------------------- */
/* List                                                                       */
/* -------------------------------------------------------------------------- */

export function usePayments(
  params?: PaymentQueryParams,
) {
  return useQuery({
    queryKey: [
      ...PAYMENTS_QUERY_KEY,
      params,
    ],

    queryFn: () =>
      paymentService.getAll(params),

    placeholderData: keepPreviousData,

    staleTime: 30 * 1000,

    refetchOnWindowFocus: false,
  });
}

/* -------------------------------------------------------------------------- */
/* Single                                                                     */
/* -------------------------------------------------------------------------- */

export function usePayment(
  id?: string,
) {
  return useQuery({
    queryKey: [
      ...PAYMENTS_QUERY_KEY,
      "detail",
      id,
    ],

    queryFn: () =>
      paymentService.getById(id as string),

    enabled: Boolean(id),

    staleTime: 30 * 1000,

    refetchOnWindowFocus: false,
  });
}

/* -------------------------------------------------------------------------- */
/* Receiver details                                                           */
/* -------------------------------------------------------------------------- */

export function usePaymentReceiverDetails() {
  return useQuery({
    queryKey: [
      ...PAYMENTS_QUERY_KEY,
      "receiver-details",
    ],

    queryFn: () =>
      paymentService.getReceiverDetails(),

    staleTime: 5 * 60 * 1000,

    refetchOnWindowFocus: false,
  });
}

/* -------------------------------------------------------------------------- */
/* Create                                                                     */
/* -------------------------------------------------------------------------- */

export function useCreatePayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (
      data: CreatePaymentPayload,
    ) =>
      paymentService.create(data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: PAYMENTS_QUERY_KEY,
      });
    },
  });
}

/* -------------------------------------------------------------------------- */
/* Verify                                                                     */
/* -------------------------------------------------------------------------- */

export function useVerifyPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      paymentService.verify(id),

    onSuccess: (
      _response,
      id,
    ) => {
      queryClient.invalidateQueries({
        queryKey: PAYMENTS_QUERY_KEY,
      });

      queryClient.invalidateQueries({
        queryKey: [
          ...PAYMENTS_QUERY_KEY,
          "detail",
          id,
        ],
      });

      queryClient.invalidateQueries({
        queryKey: ["invoices"],
      });
    },
  });
}

/* -------------------------------------------------------------------------- */
/* Reject                                                                     */
/* -------------------------------------------------------------------------- */

export function useRejectPayment() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      paymentService.reject(id),

    onSuccess: (
      _response,
      id,
    ) => {
      queryClient.invalidateQueries({
        queryKey: PAYMENTS_QUERY_KEY,
      });

      queryClient.invalidateQueries({
        queryKey: [
          ...PAYMENTS_QUERY_KEY,
          "detail",
          id,
        ],
      });
    },
  });
}