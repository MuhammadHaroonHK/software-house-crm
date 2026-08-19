import { z } from "zod";
import { MeetingStatus } from "@prisma/client";
import { paginationSchema } from "../../common/schemas/pagination.schema";

export const createMeetingSchema = z.object({
  body: z.object({
    projectId: z.uuid(),

    organizerId: z.uuid(),

    title: z
      .string()
      .trim()
      .min(3)
      .max(150),

    agenda: z.string().optional(),

    meetingDate: z.coerce.date(),

    location: z.string().optional(),

    notes: z.string().optional(),

    status: z
      .enum(MeetingStatus)
      .optional(),
  }),
});

export const updateMeetingSchema = z.object({
  body: z.object({
    projectId: z.uuid().optional(),

    organizerId: z.uuid().optional(),

    title: z
      .string()
      .trim()
      .min(3)
      .max(150)
      .optional(),

    agenda: z.string().optional(),

    meetingDate: z.coerce.date().optional(),

    location: z
      .union([z.string(), z.null()])
      .optional(),

    notes: z
      .union([z.string(), z.null()])
      .optional(),

    aiSummary: z
      .union([z.string(), z.null()])
      .optional(),

    status: z
      .enum(MeetingStatus)
      .optional(),
  }),
});

export const getMeetingsSchema = z.object({
  query: paginationSchema.extend({
    projectId: z.uuid().optional(),

    organizerId: z.uuid().optional(),

    status: z
      .enum(MeetingStatus)
      .optional(),

    sortBy: z
      .enum([
        "title",
        "meetingDate",
        "status",
        "createdAt",
      ])
      .default("meetingDate"),
  }),
});

export const changeMeetingStatusSchema = z.object({
  params: z.object({
    id: z.uuid(),
  }),

  body: z.object({
    status: z.enum(MeetingStatus),
  }),
});