import api from "@/lib/api";

import type {
  CreatePaymentPayload,
  PaymentListResponse,
  PaymentMutationResponse,
  PaymentQueryParams,
  PaymentReceiverResponse,
  PaymentResponse,
  UpdatePaymentPayload,
} from "../types/payment.types";

export const paymentService = {
  async getAll(
    params?: PaymentQueryParams,
  ): Promise<PaymentListResponse> {
    const response =
      await api.get<PaymentListResponse>(
        "/payments",
        {
          params,
        },
      );

    return response.data;
  },

  async getById(
    id: string,
  ): Promise<PaymentResponse> {
    const response =
      await api.get<PaymentResponse>(
        `/payments/${id}`,
      );

    return response.data;
  },

  async create(
    data: CreatePaymentPayload,
  ): Promise<PaymentMutationResponse> {
    const formData = new FormData();

    formData.append(
      "invoiceId",
      data.invoiceId,
    );

    formData.append(
      "amount",
      String(data.amount),
    );

    formData.append(
      "paymentMethod",
      data.paymentMethod,
    );

    if (data.paymentDate) {
      formData.append(
        "paymentDate",
        data.paymentDate,
      );
    }

    if (data.accountTitle) {
      formData.append(
        "accountTitle",
        data.accountTitle,
      );
    }

    if (data.accountNumber) {
      formData.append(
        "accountNumber",
        data.accountNumber,
      );
    }

    if (data.referenceNumber) {
      formData.append(
        "referenceNumber",
        data.referenceNumber,
      );
    }

    if (data.notes) {
      formData.append(
        "notes",
        data.notes,
      );
    }

    if (data.receiptImage) {
      formData.append(
        "receiptImage",
        data.receiptImage,
      );
    }

    const response =
      await api.post<PaymentMutationResponse>(
        "/payments",
        formData,
      );

    return response.data;
  },

  async update(
    id: string,
    data: UpdatePaymentPayload,
  ): Promise<PaymentMutationResponse> {
    const response =
      await api.patch<PaymentMutationResponse>(
        `/payments/${id}`,
        data,
      );

    return response.data;
  },

  async delete(
    id: string,
  ): Promise<PaymentMutationResponse> {
    const response =
      await api.delete<PaymentMutationResponse>(
        `/payments/${id}`,
      );

    return response.data;
  },

  async verify(
    id: string,
  ): Promise<PaymentMutationResponse> {
    const response =
      await api.patch<PaymentMutationResponse>(
        `/payments/${id}/verify`,
      );

    return response.data;
  },

  async reject(
    id: string,
  ): Promise<PaymentMutationResponse> {
    const response =
      await api.patch<PaymentMutationResponse>(
        `/payments/${id}/reject`,
      );

    return response.data;
  },

  async getReceiverDetails(): Promise<PaymentReceiverResponse> {
    const response =
      await api.get<PaymentReceiverResponse>(
        "/payments/receiver-details",
      );

    return response.data;
  },
};