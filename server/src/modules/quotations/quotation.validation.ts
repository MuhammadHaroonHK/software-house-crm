import { z } from "zod";
import { QuotationStatus } from "@prisma/client";
import { paginationSchema } from "../../common/schemas/pagination.schema";

export const createQuotationSchema = z.object({
  body: z
    .object({
      clientId: z.uuid(),

      projectId: z.uuid().optional(),

      quotationNumber: z
        .string()
        .trim()
        .min(3)
        .max(100),

      issueDate: z.coerce.date(),

      expiryDate: z.coerce.date().optional(),

      discount: z.coerce.number().nonnegative().optional(),

      tax: z.coerce.number().nonnegative().optional(),

      notes: z.string().trim().optional(),
    })
    .refine(
      (data) =>
        !data.expiryDate ||
        data.expiryDate >= data.issueDate,
      {
        message: "Expiry date must be after issue date.",
        path: ["expiryDate"],
      }
    )
});

export const updateQuotationSchema = z.object({
  body: z
    .object({
      clientId: z.uuid().optional(),

      projectId: z
        .union([z.uuid(), z.null()])
        .optional(),

      quotationNumber: z
        .string()
        .trim()
        .min(3)
        .max(100)
        .optional(),

      issueDate: z.coerce.date().optional(),

      expiryDate: z
        .union([z.coerce.date(), z.null()])
        .optional(),

      discount: z.coerce.number().nonnegative().optional(),

      tax: z.coerce.number().nonnegative().optional(),

      notes: z.string().trim().optional(),
    })
    .refine(
      (data) =>
        !data.issueDate ||
        !data.expiryDate ||
        data.expiryDate === null ||
        data.expiryDate >= data.issueDate,
      {
        message: "Expiry date must be after issue date.",
        path: ["expiryDate"],
      }
    ),
});

export const getQuotationsSchema = z.object({
  query: paginationSchema.extend({
    clientId: z.uuid().optional(),

    projectId: z.uuid().optional(),

    status: z
      .enum(QuotationStatus)
      .optional(),

    sortBy: z
      .enum([
        "quotationNumber",
        "issueDate",
        "expiryDate",
        "totalAmount",
        "status",
        "createdAt",
      ])
      .default("createdAt"),
  }),
});