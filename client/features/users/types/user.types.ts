import type { UserRole } from "@/features/auth/types/auth.types";

export type UserStatus = "ACTIVE" | "INACTIVE";

export interface Department {
  id: string;
  name: string;
  description?: string | null;
}

export interface UserRoleInfo {
  id: string;
  name: UserRole;
}

export interface Client {
  id: string;
  companyName: string;
}

export interface User {
  id: string;

  firstName: string;
  lastName: string;

  email: string;
  phone: string | null;
  profileImage: string | null;

  status: UserStatus;

  role: UserRoleInfo;
  department: Department | null;
  client: Client | null;

  createdAt: string;
  updatedAt: string;
}

export interface CreateUserPayload {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  role: UserRole;
  departmentId?: string;
  clientId?: string;
}

export interface UpdateUserPayload {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
  role?: UserRole;
  departmentId?: string | null;
  clientId?: string | null;
}

export interface UpdateUserStatusPayload {
  status: UserStatus;
}

export interface UserFilters {
  page?: number;
  limit?: number;
  search?: string;
  role?: UserRole;
  status?: UserStatus;
  departmentId?: string;
  sortBy?: "firstName" | "lastName" | "email" | "createdAt";
  sortOrder?: "asc" | "desc";
}

export interface PaginationMeta {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  meta?: PaginationMeta;
}
