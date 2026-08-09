import { QuotationStatus } from "@prisma/client";

export interface CreateQuotationDTO {
  clientId: string;
  projectId?: string;

  quotationNumber: string;

  issueDate: string;
  expiryDate?: string;

  subtotal: number;
  discount?: number;
  tax?: number;

  notes?: string;
}

export interface UpdateQuotationDTO {
  clientId?: string;
  projectId?: string | null;

  quotationNumber?: string;

  issueDate?: string;
  expiryDate?: string | null;

  subtotal?: number;
  discount?: number;
  tax?: number;

  notes?: string;
}