export type PaymentMethod = "CASH" | "BANK_TRANSFER" | "EASYPAISA" | "JAZZCASH";

export type PaymentStatus = "PENDING" | "COMPLETED" | "FAILED" | "REFUNDED";

export interface PaymentClient {
  id: string;
  companyName: string;
}

export interface PaymentProject {
  id: string;
  name: string;
}

export interface PaymentQuotation {
  id: string;
  quotationNumber: string;
  client: PaymentClient;
  project: PaymentProject | null;
}

export interface PaymentInvoice {
  id: string;
  invoiceNumber: string;
  totalAmount: string | number;
  amountPaid: string | number;
  balanceDue: string | number;
  status: "DRAFT" | "SENT" | "PARTIALLY_PAID" | "PAID" | "OVERDUE";
  quotation: PaymentQuotation;
}

export interface PaymentVerifier {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: {
    id: string;
    name: string;
  };
}

export interface Payment {
  id: string;
  invoiceId: string;

  amount: string | number;
  paymentMethod: PaymentMethod;

  paymentDate: string | null;

  accountTitle: string | null;
  accountNumber: string | null;

  receiptImage: string | null;

  referenceNumber: string | null;

  status: PaymentStatus;

  verifiedAt: string | null;
  verifiedBy: PaymentVerifier | null;

  notes: string | null;

  createdAt: string;
  updatedAt: string;

  invoice: PaymentInvoice;
}

export interface PaymentPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface PaymentListResponse {
  success: boolean;
  message: string;
  data: Payment[];
  meta: PaymentPagination;
}

export interface PaymentResponse {
  success: boolean;
  message: string;
  data: Payment;
}

export interface PaymentMutationResponse {
  success: boolean;
  message: string;
  data: Payment | null;
}

export interface CreatePaymentPayload {
  invoiceId: string;
  amount: number;
  paymentMethod: PaymentMethod;
  paymentDate?: string;
  accountTitle?: string;
  accountNumber?: string;
  receiptImage?: File;
  referenceNumber?: string;
  notes?: string;
}

export interface UpdatePaymentPayload {
  amount?: number;
  paymentMethod?: PaymentMethod;
  paymentDate?: string | null;
  accountTitle?: string | null;
  accountNumber?: string | null;
  receiptImage?: string | null;
  referenceNumber?: string | null;
  notes?: string | null;
}

export interface PaymentQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  invoiceId?: string;
  status?: PaymentStatus;
  paymentMethod?: PaymentMethod;
  sortBy?: "amount" | "paymentDate" | "createdAt";
  sortOrder?: "asc" | "desc";
}

export interface PaymentReceiverDetails {
  bankName: string | null;
  accountTitle: string | null;
  accountNumber: string | null;
  iban: string | null;
  easyPaisaNumber: string | null;
  jazzCashNumber: string | null;
  currency: string;
}

export interface PaymentReceiverResponse {
  success: boolean;
  message: string;
  data: PaymentReceiverDetails;
}
