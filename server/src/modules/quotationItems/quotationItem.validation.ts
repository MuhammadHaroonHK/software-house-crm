import { z } from "zod";

export const createQuotationItemSchema = z.object({
  body: z.object({
    serviceName: z
      .string()
      .trim()
      .min(2)
      .max(200),

    description: z
      .string()
      .trim()
      .optional(),

    quantity: z
      .coerce
      .number()
      .int()
      .positive(),

    unitPrice: z
      .coerce
      .number()
      .nonnegative(),
  }),
});

export const updateQuotationItemSchema = z.object({
  body: z.object({
    serviceName: z
      .string()
      .trim()
      .min(2)
      .max(200)
      .optional(),

    description: z
      .string()
      .trim()
      .optional(),

    quantity: z
      .coerce
      .number()
      .int()
      .positive()
      .optional(),

    unitPrice: z
      .coerce
      .number()
      .nonnegative()
      .optional(),
  }),
});