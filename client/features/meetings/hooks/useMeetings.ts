"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { meetingService } from "../services/meeting.service";

import type {
  CreateMeetingPayload,
  MeetingQueryParams,
  UpdateMeetingPayload,
  MeetingStatus,
} from "../types/meeting.types";

export const MEETINGS_QUERY_KEY = ["meetings"] as const;

export function useMeetings(
  params?: MeetingQueryParams,
  options?: {
    enabled?: boolean;
  },
) {
  return useQuery({
    queryKey: [...MEETINGS_QUERY_KEY, params],

    queryFn: () => meetingService.getAll(params),

    placeholderData: keepPreviousData,

    staleTime: 30 * 1000,

    refetchOnWindowFocus: false,

    enabled: options?.enabled ?? true,
  });
}

export function useCreateMeeting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (data: CreateMeetingPayload) => meetingService.create(data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: MEETINGS_QUERY_KEY,
      });
    },
  });
}

export function useUpdateMeeting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: UpdateMeetingPayload }) =>
      meetingService.update(id, data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: MEETINGS_QUERY_KEY,
      });
    },
  });
}

export function useDeleteMeeting() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => meetingService.delete(id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: MEETINGS_QUERY_KEY,
      });
    },
  });
}

export function useChangeMeetingStatus() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: {
        status: MeetingStatus;
      };
    }) => meetingService.changeStatus(id, data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: MEETINGS_QUERY_KEY,
      });
    },
  });
}
