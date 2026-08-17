import api from "@/lib/api";

import type {
  ContactPersonListResponse,
  ContactPersonMutationResponse,
  ContactPersonQueryParams,
  ContactPersonResponse,
  CreateContactPersonPayload,
  UpdateContactPersonPayload,
} from "../types/contactPerson.types";

export const contactPersonService = {
  async getAll(
    params?: ContactPersonQueryParams
  ): Promise<ContactPersonListResponse> {
    const response =
      await api.get<ContactPersonListResponse>(
        "/contact-persons",
        {
          params,
        }
      );

    return response.data;
  },

  async getById(
    id: string
  ): Promise<ContactPersonResponse> {
    const response =
      await api.get<ContactPersonResponse>(
        `/contact-persons/${id}`
      );

    return response.data;
  },

  async create(
    data: CreateContactPersonPayload
  ): Promise<ContactPersonMutationResponse> {
    const response =
      await api.post<ContactPersonMutationResponse>(
        "/contact-persons",
        data
      );

    return response.data;
  },

  async update(
    id: string,
    data: UpdateContactPersonPayload
  ): Promise<ContactPersonMutationResponse> {
    const response =
      await api.patch<ContactPersonMutationResponse>(
        `/contact-persons/${id}`,
        data
      );

    return response.data;
  },

  async delete(
    id: string
  ): Promise<ContactPersonMutationResponse> {
    const response =
      await api.delete<ContactPersonMutationResponse>(
        `/contact-persons/${id}`
      );

    return response.data;
  },

  async setPrimary(
  id: string
): Promise<ContactPersonResponse> {
  const response =
    await api.patch<ContactPersonResponse>(
      `/contact-persons/${id}/primary`
    );

  return response.data;
},
};