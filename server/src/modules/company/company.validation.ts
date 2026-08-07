import { z } from "zod";

export const updateCompanySchema = z.object({
  body: z.object({
    companyName: z
      .string()
      .trim()
      .min(2)
      .max(150)
      .optional(),

    companyEmail: z
      .email("Invalid company email.")
      .trim()
      .toLowerCase()
      .optional(),

    companyPhone: z
      .string()
      .trim()
      .optional(),

    companyAddress: z
      .string()
      .trim()
      .optional(),

    website: z
      .string()
      .trim()
      .optional(),

    logo: z
      .string()
      .trim()
      .optional(),

    bankName: z
      .string()
      .trim()
      .optional(),

    accountTitle: z
      .string()
      .trim()
      .optional(),

    accountNumber: z
      .string()
      .trim()
      .optional(),

    easyPaisaNumber: z
      .string()
      .trim()
      .optional(),

    jazzCashNumber: z
      .string()
      .trim()
      .optional(),

    currency: z
      .string()
      .trim()
      .optional(),

    timezone: z
      .string()
      .trim()
      .optional(),
  }),
});