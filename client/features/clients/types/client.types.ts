export interface Client {
  id: string;
  companyName: string;
  industry: string | null;
  website: string | null;
  email: string;
  phone: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  notes: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface ClientPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ClientListResponse {
  success: boolean;
  message: string;
  data: Client[];
  meta: ClientPagination;
}

export interface ClientResponse {
  success: boolean;
  message: string;
  data: Client;
}

export interface ClientMutationResponse {
  success: boolean;
  message: string;
  data: Client | null;
}

export interface CreateClientPayload {
  companyName: string;
  industry?: string;
  website?: string;
  email: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  notes?: string;
}

export interface UpdateClientPayload {
  companyName?: string;
  industry?: string;
  website?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  notes?: string;
}

export interface ClientQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}
