import api from "@/lib/api";

import type {
  CreateInvoiceItemPayload,
  InvoiceItemMutationResponse,
  InvoiceItemsResponse,
  UpdateInvoiceItemPayload,
} from "../types/invoiceItem.types";

export const invoiceItemService = {
  async getAll(
    invoiceId: string,
  ): Promise<InvoiceItemsResponse> {
    const response =
      await api.get<InvoiceItemsResponse>(
        `/invoices/${invoiceId}/items`,
      );

    return response.data;
  },

  async create(
    invoiceId: string,
    data: CreateInvoiceItemPayload,
  ): Promise<InvoiceItemMutationResponse> {
    const response =
      await api.post<InvoiceItemMutationResponse>(
        `/invoices/${invoiceId}/items`,
        data,
      );

    return response.data;
  },

  async update(
    itemId: string,
    data: UpdateInvoiceItemPayload,
  ): Promise<InvoiceItemMutationResponse> {
    const response =
      await api.patch<InvoiceItemMutationResponse>(
        `/invoice-items/${itemId}`,
        data,
      );

    return response.data;
  },

  async delete(
    itemId: string,
  ): Promise<InvoiceItemMutationResponse> {
    const response =
      await api.delete<InvoiceItemMutationResponse>(
        `/invoice-items/${itemId}`,
      );

    return response.data;
  },
};