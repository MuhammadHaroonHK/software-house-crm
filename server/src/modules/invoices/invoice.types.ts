import { InvoiceStatus } from "@prisma/client";

export interface CreateInvoiceDTO {
  quotationId: string;

  invoiceNumber: string;

  issueDate: string;

  dueDate: string;

  notes?: string;
}

export interface UpdateInvoiceDTO {
  dueDate?: string;

  notes?: string;
}