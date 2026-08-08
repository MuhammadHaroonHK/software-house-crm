import {
  PaymentMethod,
  PaymentStatus,
} from "@prisma/client";

export interface CreatePaymentDTO {
  invoiceId: string;

  amount: number;

  paymentMethod: PaymentMethod;

  paymentDate?: string;

  accountTitle?: string;

  accountNumber?: string;

  receiptImage?: string;

  referenceNumber?: string;

  status?: PaymentStatus;

  notes?: string;
}

export interface UpdatePaymentDTO {
  amount?: number;

  paymentMethod?: PaymentMethod;

  paymentDate?: string | null;

  accountTitle?: string | null;

  accountNumber?: string | null;

  receiptImage?: string | null;

  referenceNumber?: string | null;

  status?: PaymentStatus;

  notes?: string | null;
}