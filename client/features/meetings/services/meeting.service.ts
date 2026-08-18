import api from "@/lib/api";

import type {
  CreateMeetingPayload,
  MeetingListResponse,
  MeetingMutationResponse,
  MeetingQueryParams,
  MeetingResponse,
  UpdateMeetingPayload,
} from "../types/meeting.types";

export const meetingService = {
  async getAll(
    params?: MeetingQueryParams
  ): Promise<MeetingListResponse> {
    const response =
      await api.get<MeetingListResponse>(
        "/meetings",
        {
          params,
        }
      );

    return response.data;
  },

  async getById(
    id: string
  ): Promise<MeetingResponse> {
    const response =
      await api.get<MeetingResponse>(
        `/meetings/${id}`
      );

    return response.data;
  },

  async create(
    data: CreateMeetingPayload
  ): Promise<MeetingMutationResponse> {
    const response =
      await api.post<MeetingMutationResponse>(
        "/meetings",
        data
      );

    return response.data;
  },

  async update(
    id: string,
    data: UpdateMeetingPayload
  ): Promise<MeetingMutationResponse> {
    const response =
      await api.patch<MeetingMutationResponse>(
        `/meetings/${id}`,
        data
      );

    return response.data;
  },

  async delete(
    id: string
  ): Promise<MeetingMutationResponse> {
    const response =
      await api.delete<MeetingMutationResponse>(
        `/meetings/${id}`
      );

    return response.data;
  },
};