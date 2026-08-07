import { z } from "zod";
import { paginationSchema } from "../../common/schemas/pagination.schema";

export const createClientSchema = z.object({
  body: z.object({
    companyName: z
      .string()
      .trim()
      .min(2, "Company name must be at least 2 characters.")
      .max(100),

    industry: z
      .string()
      .trim()
      .max(100)
      .optional(),

    website: z
      .string()
      .trim()
      .url("Invalid website URL.")
      .optional(),

    email: z
      .email("Invalid email address.")
      .trim()
      .toLowerCase(),

    phone: z
      .string()
      .trim()
      .optional(),

    address: z
      .string()
      .trim()
      .optional(),

    city: z
      .string()
      .trim()
      .max(100)
      .optional(),

    country: z
      .string()
      .trim()
      .max(100)
      .optional(),

    notes: z
      .string()
      .trim()
      .optional(),
  }),
});

export const updateClientSchema = z.object({
  body: z.object({
    companyName: z
      .string()
      .trim()
      .min(2)
      .max(100)
      .optional(),

    industry: z
      .string()
      .trim()
      .max(100)
      .optional(),

    website: z
      .string()
      .trim()
      .url("Invalid website URL.")
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

    address: z
      .string()
      .trim()
      .optional(),

    city: z
      .string()
      .trim()
      .max(100)
      .optional(),

    country: z
      .string()
      .trim()
      .max(100)
      .optional(),

    notes: z
      .string()
      .trim()
      .optional(),
  }),
});

export const getClientsSchema = z.object({
  query: paginationSchema.extend({
    sortBy: z
      .enum([
        "companyName",
        "email",
        "city",
        "country",
        "createdAt",
      ])
      .default("createdAt"),
  }),
});