import { z } from "zod";
import { paginationSchema } from "../../common/schemas/pagination.schema";

export const createDepartmentSchema = z.object({
  body: z.object({
    name: z
      .string()
      .trim()
      .min(2, "Department name must be at least 2 characters.")
      .max(100, "Department name cannot exceed 100 characters."),

    description: z
      .string()
      .trim()
      .max(500, "Description cannot exceed 500 characters.")
      .optional(),
  }),
});

export const updateDepartmentSchema = z.object({
  body: z.object({
    name: z
      .string()
      .trim()
      .min(2)
      .max(100)
      .optional(),

    description: z
      .string()
      .trim()
      .max(500)
      .optional(),
  }),
});

export const getDepartmentsSchema = z.object({
  query: paginationSchema,
});