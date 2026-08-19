import api from "@/lib/api";

import type {
  CreateQuotationPayload,
  QuotationListResponse,
  QuotationMutationResponse,
  QuotationQueryParams,
  QuotationResponse,
  UpdateQuotationPayload,
} from "../types/quotation.types";

export const quotationService = {
  async getAll(
    params?: QuotationQueryParams
  ): Promise<QuotationListResponse> {
    const response =
      await api.get<QuotationListResponse>(
        "/quotations",
        {
          params,
        }
      );

    return response.data;
  },

  async getById(
    id: string
  ): Promise<QuotationResponse> {
    const response =
      await api.get<QuotationResponse>(
        `/quotations/${id}`
      );

    return response.data;
  },

  async create(
    data: CreateQuotationPayload
  ): Promise<QuotationMutationResponse> {
    const response =
      await api.post<QuotationMutationResponse>(
        "/quotations",
        data
      );

    return response.data;
  },

  async update(
    id: string,
    data: UpdateQuotationPayload
  ): Promise<QuotationMutationResponse> {
    const response =
      await api.patch<QuotationMutationResponse>(
        `/quotations/${id}`,
        data
      );

    return response.data;
  },

  async send(
    id: string
  ): Promise<QuotationMutationResponse> {
    const response =
      await api.patch<QuotationMutationResponse>(
        `/quotations/${id}/send`
      );

    return response.data;
  },

  async accept(
    id: string
  ): Promise<QuotationMutationResponse> {
    const response =
      await api.patch<QuotationMutationResponse>(
        `/quotations/${id}/accept`
      );

    return response.data;
  },

  async reject(
    id: string
  ): Promise<QuotationMutationResponse> {
    const response =
      await api.patch<QuotationMutationResponse>(
        `/quotations/${id}/reject`
      );

    return response.data;
  },

  async expire(
    id: string
  ): Promise<QuotationMutationResponse> {
    const response =
      await api.patch<QuotationMutationResponse>(
        `/quotations/${id}/expire`
      );

    return response.data;
  },

  async delete(
    id: string
  ): Promise<QuotationMutationResponse> {
    const response =
      await api.delete<QuotationMutationResponse>(
        `/quotations/${id}`
      );

    return response.data;
  },
};