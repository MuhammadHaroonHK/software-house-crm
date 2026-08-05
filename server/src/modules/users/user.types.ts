import { UserRole } from "@prisma/client";

export interface CreateUserDTO {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone?: string;
  role: UserRole;
  departmentId?: string;
}