import type { UserRole } from "@/features/auth/types/auth.types";

export interface ProfileRole {
  id: string;
  name: UserRole;
}

export interface ProfileDepartment {
  id: string;
  name: string;
}

export interface UserProfile {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string | null;
  profileImage: string | null;
  status: string;
  role: ProfileRole;
  department: ProfileDepartment | null;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateProfilePayload {
  firstName?: string;
  lastName?: string;
  email?: string;
  phone?: string;
}

export interface ChangePasswordPayload {
  currentPassword: string;
  newPassword: string;
}

export interface ProfileApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}