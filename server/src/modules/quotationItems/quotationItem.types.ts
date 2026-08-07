export interface CreateQuotationItemDTO {
  serviceName: string;
  description?: string;

  quantity: number;
  unitPrice: number;
}

export interface UpdateQuotationItemDTO {
  serviceName?: string;
  description?: string;

  quantity?: number;
  unitPrice?: number;
}