export interface CreateQuotationDTO {
  clientId: string;

  projectId?: string;

  issueDate: string;
  expiryDate?: string;

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

  discount?: number;
  tax?: number;

  notes?: string;
}