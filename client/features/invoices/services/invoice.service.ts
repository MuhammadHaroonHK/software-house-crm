import api from "@/lib/api";

import type {
  CreateInvoicePayload,
  InvoiceListResponse,
  InvoiceMutationResponse,
  InvoiceQueryParams,
  InvoiceResponse,
  UpdateInvoicePayload,
} from "../types/invoice.types";

export const invoiceService = {
  async getAll(
    params?: InvoiceQueryParams,
  ): Promise<InvoiceListResponse> {
    const response =
      await api.get<InvoiceListResponse>(
        "/invoices",
        {
          params,
        },
      );

    return response.data;
  },

  async getById(
    id: string,
  ): Promise<InvoiceResponse> {
    const response =
      await api.get<InvoiceResponse>(
        `/invoices/${id}`,
      );

    return response.data;
  },

  async create(
    data: CreateInvoicePayload,
  ): Promise<InvoiceMutationResponse> {
    const response =
      await api.post<InvoiceMutationResponse>(
        "/invoices",
        data,
      );

    return response.data;
  },

  async update(
    id: string,
    data: UpdateInvoicePayload,
  ): Promise<InvoiceMutationResponse> {
    const response =
      await api.patch<InvoiceMutationResponse>(
        `/invoices/${id}`,
        data,
      );

    return response.data;
  },

  async send(
    id: string,
  ): Promise<InvoiceMutationResponse> {
    const response =
      await api.patch<InvoiceMutationResponse>(
        `/invoices/${id}/send`,
      );

    return response.data;
  },

  async delete(
    id: string,
  ): Promise<InvoiceMutationResponse> {
    const response =
      await api.delete<InvoiceMutationResponse>(
        `/invoices/${id}`,
      );

    return response.data;
  },
};