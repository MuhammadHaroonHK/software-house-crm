export type InvoiceStatus =
  | "DRAFT"
  | "SENT"
  | "PAID"
  | "PARTIALLY_PAID"
  | "OVERDUE";

export interface InvoiceClient {
  id: string;
  companyName: string;
  industry?: string | null;
  website?: string | null;
  email: string;
  phone?: string | null;
  address?: string | null;
  city?: string | null;
  country?: string | null;
}

export interface InvoiceProject {
  id: string;
  name: string;
}

export interface InvoiceQuotation {
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

  status: "DRAFT" | "SENT" | "ACCEPTED" | "REJECTED" | "EXPIRED";

  notes: string | null;

  client?: InvoiceClient;
  project?: InvoiceProject | null;
}

export interface InvoiceItem {
  id: string;
  invoiceId: string;

  serviceName: string;
  description: string | null;

  quantity: number;

  unitPrice: string | number;
  totalPrice: string | number;

  createdAt: string;
  updatedAt: string;
}

export interface Invoice {
  id: string;

  quotationId: string;

  invoiceNumber: string;

  issueDate: string;
  dueDate: string;

  subtotal: string | number;
  discount: string | number;
  tax: string | number;
  totalAmount: string | number;

  amountPaid: string | number;
  balanceDue: string | number;

  status: InvoiceStatus;

  notes: string | null;

  createdAt: string;
  updatedAt: string;

  quotation: InvoiceQuotation;

  items: InvoiceItem[];
}

export interface InvoicePagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface InvoiceListResponse {
  success: boolean;
  message: string;
  data: Invoice[];
  meta: InvoicePagination;
}

export interface InvoiceResponse {
  success: boolean;
  message: string;
  data: Invoice;
}

export interface InvoiceMutationResponse {
  success: boolean;
  message: string;
  data: Invoice | null;
}

export interface CreateInvoicePayload {
  quotationId: string;

  invoiceNumber: string;

  issueDate: string;

  dueDate: string;

  notes?: string;
}

export interface UpdateInvoicePayload {
  dueDate?: string;

  notes?: string;
}

export interface InvoiceQueryParams {
  page?: number;
  limit?: number;

  search?: string;

  quotationId?: string;

  status?: InvoiceStatus;

  sortBy?:
    | "invoiceNumber"
    | "issueDate"
    | "dueDate"
    | "totalAmount"
    | "status"
    | "createdAt";

  sortOrder?: "asc" | "desc";
}
