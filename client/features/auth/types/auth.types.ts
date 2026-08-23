export type UserRole =
  | "SUPER_ADMIN"
  | "PROJECT_MANAGER"
  | "EMPLOYEE"
  | "CLIENT";

export interface LoginPayload {
  email: string;
  password: string;
}

export interface AuthUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  role: UserRole;
}

export interface LoginResponse {
  accessToken: string;
  user: AuthUser;
}

export interface MeResponse {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  profileImage: string | null;
  status: string;
  role: UserRole;
  department: string | null;
}
