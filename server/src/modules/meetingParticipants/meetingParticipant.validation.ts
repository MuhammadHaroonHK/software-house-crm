import { z } from "zod";

export const addMeetingParticipantSchema = z.object({
  params: z.object({
    meetingId: z.uuid(),
  }),

  body: z.object({
    userId: z.uuid(),
  }),
});

export const getMeetingParticipantsSchema = z.object({
  params: z.object({
    meetingId: z.uuid(),
  }),
});

export const removeMeetingParticipantSchema = z.object({
  params: z.object({
    meetingId: z.uuid(),
    userId: z.uuid(),
  }),
});
