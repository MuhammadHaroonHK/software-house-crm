import { z } from "zod";
import {
  PaymentMethod,
  PaymentStatus,
} from "@prisma/client";
import { paginationSchema } from "../../common/schemas/pagination.schema";

export const createPaymentSchema = z.object({
  body: z.object({
    invoiceId: z.uuid(),

    amount: z.coerce.number().positive(),

    paymentMethod: z.enum(PaymentMethod),

    paymentDate: z.coerce
      .date()
      .optional(),

    accountTitle: z.string().optional(),

    accountNumber: z.string().optional(),

    receiptImage: z.string().optional(),

    referenceNumber: z.string().optional(),

    notes: z.string().optional(),
  }),
});

export const updatePaymentSchema = z.object({
  body: z.object({
    amount: z.coerce
      .number()
      .positive()
      .optional(),

    paymentMethod: z
      .enum(PaymentMethod)
      .optional(),

    paymentDate: z
      .union([
        z.coerce.date(),
        z.null(),
      ])
      .optional(),

    accountTitle: z
      .string()
      .nullable()
      .optional(),

    accountNumber: z
      .string()
      .nullable()
      .optional(),

    receiptImage: z
      .string()
      .nullable()
      .optional(),

    referenceNumber: z
      .string()
      .nullable()
      .optional(),

    status: z
      .enum(PaymentStatus)
      .optional(),

    notes: z
      .string()
      .nullable()
      .optional(),
  }),
});

export const getPaymentsSchema = z.object({
  query: paginationSchema.extend({
    invoiceId: z.uuid().optional(),

    status: z
      .enum(PaymentStatus)
      .optional(),

    paymentMethod: z
      .enum(PaymentMethod)
      .optional(),

    sortBy: z
      .enum([
        "amount",
        "paymentDate",
        "createdAt",
      ])
      .default("createdAt"),
  }),
});