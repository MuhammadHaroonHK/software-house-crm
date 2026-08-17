export interface ContactPerson {
  id: string;
  clientId: string;

  firstName: string;
  lastName: string;
  designation: string | null;
  email: string | null;
  phone: string | null;

  isPrimary: boolean;

  createdAt: string;
  updatedAt: string;

  client?: {
    id: string;
    companyName: string;
  } | null;
}

export interface ContactPersonPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ContactPersonListResponse {
  success: boolean;
  message: string;
  data: ContactPerson[];
  meta: ContactPersonPagination;
}

export interface ContactPersonResponse {
  success: boolean;
  message: string;
  data: ContactPerson;
}

export interface ContactPersonMutationResponse {
  success: boolean;
  message: string;
  data: ContactPerson | null;
}

export interface CreateContactPersonPayload {
  clientId: string;
  firstName: string;
  lastName: string;
  designation?: string;
  email?: string;
  phone?: string;
  isPrimary?: boolean;
}

export interface UpdateContactPersonPayload {
  clientId?: string;
  firstName?: string;
  lastName?: string;
  designation?: string;
  email?: string;
  phone?: string;
  isPrimary?: boolean;
}

export interface ContactPersonQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  clientId?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}