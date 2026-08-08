import { z } from "zod";

export const createAuditLogSchema =
  z.object({
    body: z.object({
      userId: z
        .string()
        .uuid("Invalid user ID.")
        .optional(),

      action: z
        .string()
        .trim()
        .min(1, "Action is required.")
        .max(
          100,
          "Action cannot exceed 100 characters."
        ),

      module: z
        .string()
        .trim()
        .min(1, "Module is required.")
        .max(
          100,
          "Module cannot exceed 100 characters."
        ),

      referenceId: z
        .string()
        .uuid("Invalid reference ID.")
        .optional(),

      ipAddress: z
        .string()
        .trim()
        .max(
          100,
          "IP address cannot exceed 100 characters."
        )
        .optional(),

      userAgent: z
        .string()
        .trim()
        .max(
          1000,
          "User agent cannot exceed 1000 characters."
        )
        .optional(),
    }),
  });

export const auditLogQuerySchema =
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

      action: z
        .string()
        .trim()
        .optional(),

      module: z
        .string()
        .trim()
        .optional(),

      referenceId: z
        .string()
        .uuid("Invalid reference ID.")
        .optional(),

      search: z
        .string()
        .trim()
        .optional(),

      sortBy: z
        .enum([
          "createdAt",
          "action",
          "module",
        ])
        .optional(),

      sortOrder: z
        .enum(["asc", "desc"])
        .optional(),
    }),
  });