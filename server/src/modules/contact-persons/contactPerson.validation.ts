import { z } from "zod";
import { paginationSchema } from "../../common/schemas/pagination.schema";

export const createContactPersonSchema = z.object({
  body: z.object({
    clientId: z.uuid(),

    firstName: z
      .string()
      .trim()
      .min(2)
      .max(50),

    lastName: z
      .string()
      .trim()
      .min(2)
      .max(50),

    designation: z
      .string()
      .trim()
      .max(100)
      .optional(),

    email: z
      .email()
      .trim()
      .toLowerCase()
      .optional(),

    phone: z
      .string()
      .trim()
      .optional(),
  }),
});

export const updateContactPersonSchema = z.object({
  body: z.object({
    clientId: z.uuid().optional(),

    firstName: z
      .string()
      .trim()
      .min(2)
      .max(50)
      .optional(),

    lastName: z
      .string()
      .trim()
      .min(2)
      .max(50)
      .optional(),

    designation: z
      .string()
      .trim()
      .max(100)
      .optional(),

    email: z
      .email()
      .trim()
      .toLowerCase()
      .optional(),

    phone: z
      .string()
      .trim()
      .optional(),
  }),
});

export const getContactPersonsSchema = z.object({
  query: paginationSchema.extend({
    clientId: z.uuid().optional(),
  }),
});