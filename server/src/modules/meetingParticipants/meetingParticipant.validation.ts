import { z } from "zod";

export const addMeetingParticipantSchema = z.object({
  body: z.object({
    userId: z.uuid(),
  }),
});