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

export interface QuotationItemsResponse {
  success: boolean;
  message: string;
  data: QuotationItem[];
}

export interface QuotationItemResponse {
  success: boolean;
  message: string;
  data: QuotationItem;
}

export interface QuotationItemMutationResponse {
  success: boolean;
  message: string;
  data: QuotationItem | null;
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