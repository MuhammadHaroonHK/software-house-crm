import { z } from "zod";
import { ProjectStatus } from "@prisma/client";

export const createProjectSchema = z.object({
  body: z
    .object({
      clientId: z.uuid(),

      managerId: z.uuid(),

      name: z
        .string()
        .trim()
        .min(3)
        .max(150),

      description: z.string().optional(),

      startDate: z.coerce.date().optional(),

      endDate: z.coerce.date().optional(),

      budget: z
        .coerce
        .number()
        .positive()
        .optional(),

      status: z
        .enum(ProjectStatus)
        .optional(),
    })
    .refine(
      (data) =>
        !data.startDate ||
        !data.endDate ||
        data.endDate >= data.startDate,
      {
        message:
          "End date must be after start date.",
        path: ["endDate"],
      }
    ),
});

export const updateProjectSchema = z.object({
  body: z
    .object({
      clientId: z.uuid().optional(),

      managerId: z.uuid().optional(),

      name: z
        .string()
        .trim()
        .min(3)
        .max(150)
        .optional(),

      description: z.string().optional(),

      startDate: z
        .union([
          z.coerce.date(),
          z.null(),
        ])
        .optional(),

      endDate: z
        .union([
          z.coerce.date(),
          z.null(),
        ])
        .optional(),

      budget: z
        .union([
          z.coerce.number().positive(),
          z.null(),
        ])
        .optional(),

      status: z
        .enum(ProjectStatus)
        .optional(),
    })
    .refine(
      (data) =>
        !data.startDate ||
        !data.endDate ||
        data.startDate === null ||
        data.endDate === null ||
        data.endDate >= data.startDate,
      {
        message:
          "End date must be after start date.",
        path: ["endDate"],
      }
    ),
});