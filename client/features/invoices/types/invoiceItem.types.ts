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

export interface InvoiceItemsResponse {
  success: boolean;
  message: string;
  data: InvoiceItem[];
}

export interface InvoiceItemResponse {
  success: boolean;
  message: string;
  data: InvoiceItem;
}

export interface InvoiceItemMutationResponse {
  success: boolean;
  message: string;
  data: InvoiceItem | null;
}

export interface CreateInvoiceItemPayload {
  serviceName: string;
  description?: string;
  quantity: number;
  unitPrice: number;
}

export interface UpdateInvoiceItemPayload {
  serviceName?: string;
  description?: string;
  quantity?: number;
  unitPrice?: number;
}