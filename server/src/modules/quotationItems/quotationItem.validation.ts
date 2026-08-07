import { z } from "zod";

export const createQuotationItemSchema = z.object({
  body: z.object({
    serviceName: z
      .string()
      .trim()
      .min(2)
      .max(200),

    description: z.string().optional(),

    quantity: z
      .coerce
      .number()
      .int()
      .positive(),

    unitPrice: z
      .coerce
      .number()
      .positive(),
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

    description: z.string().optional(),

    quantity: z
      .coerce
      .number()
      .int()
      .positive()
      .optional(),

    unitPrice: z
      .coerce
      .number()
      .positive()
      .optional(),
  }),
});