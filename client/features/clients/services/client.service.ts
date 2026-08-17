import api from "@/lib/api";

import type {
  ClientListResponse,
  ClientMutationResponse,
  ClientQueryParams,
  ClientResponse,
  CreateClientPayload,
  UpdateClientPayload,
} from "../types/client.types";

export const clientService = {
  async getAll(
    params?: ClientQueryParams
  ): Promise<ClientListResponse> {
    const response =
      await api.get<ClientListResponse>(
        "/clients",
        {
          params,
        }
      );

    return response.data;
  },

  async getById(
    id: string
  ): Promise<ClientResponse> {
    const response =
      await api.get<ClientResponse>(
        `/clients/${id}`
      );

    return response.data;
  },

  async create(
    data: CreateClientPayload
  ): Promise<ClientMutationResponse> {
    const response =
      await api.post<ClientMutationResponse>(
        "/clients",
        data
      );

    return response.data;
  },

  async update(
    id: string,
    data: UpdateClientPayload
  ): Promise<ClientMutationResponse> {
    const response =
      await api.patch<ClientMutationResponse>(
        `/clients/${id}`,
        data
      );

    return response.data;
  },

  async delete(
    id: string
  ): Promise<ClientMutationResponse> {
    const response =
      await api.delete<ClientMutationResponse>(
        `/clients/${id}`
      );

    return response.data;
  },
};