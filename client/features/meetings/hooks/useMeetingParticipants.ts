"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  meetingParticipantService,
} from "../services/meetingParticipant.service";

import type {
  AddMeetingParticipantPayload,
} from "../types/meetingParticipant.types";

export const MEETING_PARTICIPANTS_QUERY_KEY = [
  "meeting-participants",
] as const;

export function useMeetingParticipants(
  meetingId?: string
) {
  return useQuery({
    queryKey: [
      ...MEETING_PARTICIPANTS_QUERY_KEY,
      meetingId,
    ],

    queryFn: () =>
      meetingParticipantService.getParticipants(
        meetingId as string
      ),

    enabled:
      Boolean(meetingId),

    staleTime: 30 * 1000,

    refetchOnWindowFocus:
      false,
  });
}

export function useAddMeetingParticipant() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: ({
      meetingId,
      data,
    }: {
      meetingId: string;
      data: AddMeetingParticipantPayload;
    }) =>
      meetingParticipantService.addParticipant(
        meetingId,
        data
      ),

    onSuccess: (
      _response,
      variables
    ) => {
      queryClient.invalidateQueries({
        queryKey: [
          ...MEETING_PARTICIPANTS_QUERY_KEY,
          variables.meetingId,
        ],
      });
    },
  });
}

export function useRemoveMeetingParticipant() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: ({
      meetingId,
      userId,
    }: {
      meetingId: string;
      userId: string;
    }) =>
      meetingParticipantService.removeParticipant(
        meetingId,
        userId
      ),

    onSuccess: (
      _response,
      variables
    ) => {
      queryClient.invalidateQueries({
        queryKey: [
          ...MEETING_PARTICIPANTS_QUERY_KEY,
          variables.meetingId,
        ],
      });
    },
  });
}