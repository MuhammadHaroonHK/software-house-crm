import { z } from "zod";
import {
  TaskPriority,
  TaskStatus,
} from "@prisma/client";
import { paginationSchema } from "../../common/schemas/pagination.schema";

export const createTaskSchema = z.object({
  body: z.object({
    projectId: z.uuid(),

    assignedToId: z.uuid(),

    title: z
      .string()
      .trim()
      .min(3)
      .max(150),

    description: z.string().optional(),

    priority: z
      .enum(TaskPriority)
      .optional(),

    status: z
      .enum(TaskStatus)
      .optional(),

    dueDate: z.coerce.date().optional(),
  }),
});

export const updateTaskSchema = z.object({
  body: z.object({
    assignedToId: z
      .uuid()
      .optional(),

    title: z
      .string()
      .trim()
      .min(3)
      .max(150)
      .optional(),

    description: z.string().optional(),

    priority: z
      .enum(TaskPriority)
      .optional(),

    status: z
      .enum(TaskStatus)
      .optional(),

    dueDate: z
      .union([
        z.coerce.date(),
        z.null(),
      ])
      .optional(),
  }),
});

export const getTasksSchema = z.object({
  query: paginationSchema.extend({
    projectId: z
      .uuid()
      .optional(),

    assignedToId: z
      .uuid()
      .optional(),

    priority: z
      .enum(TaskPriority)
      .optional(),

    status: z
      .enum(TaskStatus)
      .optional(),

    sortBy: z
      .enum([
        "title",
        "priority",
        "status",
        "dueDate",
        "createdAt",
      ])
      .default("createdAt"),
  }),
});