import api from "@/lib/api";

import type {
  AddMeetingParticipantPayload,
  MeetingParticipantMutationResponse,
  MeetingParticipantsResponse,
} from "../types/meetingParticipant.types";

export const meetingParticipantService = {
  async getParticipants(
    meetingId: string
  ): Promise<MeetingParticipantsResponse> {
    const response =
      await api.get<MeetingParticipantsResponse>(
        `/meetings/${meetingId}/participants`
      );

    return response.data;
  },

  async addParticipant(
    meetingId: string,
    data: AddMeetingParticipantPayload
  ): Promise<MeetingParticipantMutationResponse> {
    const response =
      await api.post<MeetingParticipantMutationResponse>(
        `/meetings/${meetingId}/participants`,
        data
      );

    return response.data;
  },

  async removeParticipant(
    meetingId: string,
    userId: string
  ): Promise<MeetingParticipantMutationResponse> {
    const response =
      await api.delete<MeetingParticipantMutationResponse>(
        `/meetings/${meetingId}/participants/${userId}`
      );

    return response.data;
  },
};