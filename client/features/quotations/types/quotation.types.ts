export type QuotationStatus =
  | "DRAFT"
  | "SENT"
  | "ACCEPTED"
  | "REJECTED"
  | "EXPIRED";

export interface QuotationClient {
  id: string;
  companyName: string;
}

export interface QuotationProject {
  id: string;
  name: string;
  clientId?: string;
}

export interface Quotation {
  id: string;

  quotationNumber: string;

  clientId: string;
  projectId: string | null;

  issueDate: string;
  expiryDate: string | null;

  subtotal: string | number;
  discount: string | number;
  tax: string | number;
  totalAmount: string | number;

  status: QuotationStatus;

  notes: string | null;

  createdAt: string;
  updatedAt: string;

  client?: QuotationClient;
  project?: QuotationProject | null;
}

export interface QuotationPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface QuotationListResponse {
  success: boolean;
  message: string;
  data: Quotation[];
  meta: QuotationPagination;
}

export interface QuotationResponse {
  success: boolean;
  message: string;
  data: Quotation;
}

export interface QuotationMutationResponse {
  success: boolean;
  message: string;
  data: Quotation | null;
}

export interface CreateQuotationPayload {
  clientId: string;
  projectId?: string;

  issueDate: string;
  expiryDate?: string;

  discount?: number;
  tax?: number;

  notes?: string;
}

export interface UpdateQuotationPayload {
  clientId?: string;
  projectId?: string | null;

  issueDate?: string;
  expiryDate?: string | null;

  discount?: number;
  tax?: number;

  notes?: string;
}

export interface QuotationQueryParams {
  page?: number;
  limit?: number;
  search?: string;

  clientId?: string;
  projectId?: string;
  status?: QuotationStatus;

  sortBy?: string;
  sortOrder?: "asc" | "desc";
}