import { z } from "zod";
import {
  NotificationType,
} from "@prisma/client";

const notificationTypes =
  Object.values(NotificationType) as [
    NotificationType,
    ...NotificationType[]
  ];

export const createNotificationSchema =
  z.object({
    body: z.object({
      userId: z
        .string()
        .uuid("Invalid user ID."),

      title: z
        .string()
        .trim()
        .min(1, "Title is required.")
        .max(
          255,
          "Title cannot exceed 255 characters."
        ),

      message: z
        .string()
        .trim()
        .min(1, "Message is required."),

      type: z.enum(notificationTypes),
    }),
  });

export const updateNotificationSchema =
  z.object({
    body: z
      .object({
        title: z
          .string()
          .trim()
          .min(1, "Title cannot be empty.")
          .max(
            255,
            "Title cannot exceed 255 characters."
          )
          .optional(),

        message: z
          .string()
          .trim()
          .min(1, "Message cannot be empty.")
          .optional(),

        type: z
          .enum(notificationTypes)
          .optional(),

        isRead: z
          .boolean()
          .optional(),
      })
      .refine(
        (data) =>
          Object.keys(data).length > 0,
        {
          message:
            "At least one field is required.",
        }
      ),
  });

export const notificationQuerySchema =
  z.object({
    query: z.object({
      page: z.coerce
        .number()
        .int()
        .min(1)
        .optional(),

      limit: z.coerce
        .number()
        .int()
        .min(1)
        .max(100)
        .optional(),

      userId: z
        .string()
        .uuid("Invalid user ID.")
        .optional(),

      type: z
        .enum(notificationTypes)
        .optional(),

      isRead: z
        .enum(["true", "false"])
        .transform(
          (value) => value === "true"
        )
        .optional(),

      search: z
        .string()
        .trim()
        .optional(),

      sortBy: z
        .enum([
          "createdAt",
          "title",
          "type",
          "isRead",
        ])
        .optional(),

      sortOrder: z
        .enum(["asc", "desc"])
        .optional(),
    }),
  });