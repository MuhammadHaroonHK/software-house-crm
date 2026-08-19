import api from "@/lib/api";

import type {
  CreateQuotationItemPayload,
  QuotationItemMutationResponse,
  QuotationItemsResponse,
  UpdateQuotationItemPayload,
} from "../types/quotation.types";

export const quotationItemService = {
  async getAll(
    quotationId: string
  ): Promise<QuotationItemsResponse> {
    const response =
      await api.get<QuotationItemsResponse>(
        `/quotations/${quotationId}/items`
      );

    return response.data;
  },

  async create(
    quotationId: string,
    data: CreateQuotationItemPayload
  ): Promise<QuotationItemMutationResponse> {
    const response =
      await api.post<QuotationItemMutationResponse>(
        `/quotations/${quotationId}/items`,
        data
      );

    return response.data;
  },

  async update(
    itemId: string,
    data: UpdateQuotationItemPayload
  ): Promise<QuotationItemMutationResponse> {
    const response =
      await api.patch<QuotationItemMutationResponse>(
        `/quotation-items/${itemId}`,
        data
      );

    return response.data;
  },

  async delete(
    itemId: string
  ): Promise<QuotationItemMutationResponse> {
    const response =
      await api.delete<QuotationItemMutationResponse>(
        `/quotation-items/${itemId}`
      );

    return response.data;
  },
};