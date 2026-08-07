import { z } from "zod";

export const createInvoiceItemSchema = z.object({
  body: z.object({
    serviceName: z
      .string()
      .trim()
      .min(2)
      .max(150),

    description: z.string().optional(),

    quantity: z.coerce
      .number()
      .int()
      .positive(),

    unitPrice: z.coerce
      .number()
      .positive(),
  }),
});

export const updateInvoiceItemSchema = z.object({
  body: z.object({
    serviceName: z
      .string()
      .trim()
      .min(2)
      .max(150)
      .optional(),

    description: z.string().optional(),

    quantity: z.coerce
      .number()
      .int()
      .positive()
      .optional(),

    unitPrice: z.coerce
      .number()
      .positive()
      .optional(),
  }),
});