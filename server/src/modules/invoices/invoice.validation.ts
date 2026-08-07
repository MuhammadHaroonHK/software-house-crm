import { z } from "zod";
import { InvoiceStatus } from "@prisma/client";
import { paginationSchema } from "../../common/schemas/pagination.schema";

export const createInvoiceSchema = z.object({
  body: z.object({
    quotationId: z.uuid(),

    invoiceNumber: z
      .string()
      .trim()
      .min(3)
      .max(50),

    issueDate: z.coerce.date(),

    dueDate: z.coerce.date(),

    status: z
      .enum(InvoiceStatus)
      .optional(),

    notes: z.string().optional(),
  }).refine(
    (data) => data.dueDate >= data.issueDate,
    {
      message: "Due date must be after issue date.",
      path: ["dueDate"],
    }
  ),
});

export const updateInvoiceSchema = z.object({
  body: z.object({
    dueDate: z.coerce.date().optional(),

    status: z
      .enum(InvoiceStatus)
      .optional(),

    notes: z.string().optional(),
  }),
});

export const getInvoicesSchema = z.object({
  query: paginationSchema.extend({
    quotationId: z.uuid().optional(),

    status: z
      .enum(InvoiceStatus)
      .optional(),

    sortBy: z
      .enum([
        "invoiceNumber",
        "issueDate",
        "dueDate",
        "totalAmount",
        "createdAt",
      ])
      .default("createdAt"),
  }),
});