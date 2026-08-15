export interface Department {
  id: string;
  name: string;
  description: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface DepartmentPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface DepartmentListResponse {
  success: boolean;
  message: string;
  data: Department[];
  meta: DepartmentPagination;
}

export interface DepartmentResponse {
  success: boolean;
  message: string;
  data: Department;
}

export interface DepartmentMutationResponse {
  success: boolean;
  message: string;
  data: Department | null;
}

export interface CreateDepartmentPayload {
  name: string;
  description?: string;
}

export interface UpdateDepartmentPayload {
  name?: string;
  description?: string;
}

export interface DepartmentQueryParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}