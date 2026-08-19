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

export interface QuotationItem {
  id: string;
  quotationId: string;

  serviceName: string;
  description: string | null;

  quantity: number;

  unitPrice: string | number;
  totalPrice: string | number;

  createdAt: string;
  updatedAt: string;
}

export interface Quotation {
  id: string;

  clientId: string;
  projectId: string | null;

  quotationNumber: string;

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

export interface QuotationItemsResponse {
  success: boolean;
  message: string;
  data: QuotationItem[];
}

export interface QuotationItemMutationResponse {
  success: boolean;
  message: string;
  data: QuotationItem | null;
}

export interface CreateQuotationPayload {
  clientId: string;
  projectId?: string;

  quotationNumber: string;

  issueDate: string;
  expiryDate?: string;

  discount?: number;
  tax?: number;

  notes?: string;
}

export interface UpdateQuotationPayload {
  clientId?: string;
  projectId?: string | null;

  quotationNumber?: string;

  issueDate?: string;
  expiryDate?: string | null;

  discount?: number;
  tax?: number;

  notes?: string;
}

export interface CreateQuotationItemPayload {
  serviceName: string;
  description?: string;

  quantity: number;
  unitPrice: number;
}

export interface UpdateQuotationItemPayload {
  serviceName?: string;
  description?: string;

  quantity?: number;
  unitPrice?: number;
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