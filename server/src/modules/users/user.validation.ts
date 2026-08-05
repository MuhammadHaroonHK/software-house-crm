import { z } from "zod";
import { UserRole } from "@prisma/client";

export const createUserSchema = z.object({
  firstName: z
    .string()
    .trim()
    .min(2, "First name must be at least 2 characters.")
    .max(50),

  lastName: z
    .string()
    .trim()
    .min(2, "Last name must be at least 2 characters.")
    .max(50),

  email: z
    .email("Invalid email address.")
    .trim()
    .toLowerCase(),

  password: z
  .string()
  .min(8, "Password must be at least 8 characters.")
  .regex(
    /^(?=.*[A-Z])(?=.*[a-z])(?=.*\d).+$/,
    "Password must contain at least one uppercase letter, one lowercase letter, and one number."
  ),

  phone: z
    .string()
    .optional(),

  role: z.enum(UserRole),

  departmentId: z
    .uuid()
    .optional(),
});