import { Decimal } from "@prisma/client/runtime/library";

export interface CreateInvoiceItemDTO {
  serviceName: string;
  description?: string;

  quantity: number;

  unitPrice: number;
}

export interface UpdateInvoiceItemDTO {
  serviceName?: string;

  description?: string;

  quantity?: number;

  unitPrice?: number;
}