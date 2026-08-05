import { z } from "zod";
import { UserRole } from "@prisma/client";
import { UserStatus } from "@prisma/client";

export const createUserSchema = z.object({
  body:z.object({
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
})
});

export const getUsersSchema = z.object({
  query: z.object({
    page: z.coerce.number().int().min(1).default(1),

    limit: z.coerce.number().int().min(1).max(100).default(10),

    search: z.string().trim().optional(),

    role: z.enum(UserRole).optional(),

    status: z.enum(UserStatus).optional(),

    departmentId: z.uuid().optional(),

    sortBy: z
      .enum([
        "firstName",
        "lastName",
        "email",
        "createdAt",
      ])
      .default("createdAt"),

    sortOrder: z
      .enum(["asc", "desc"])
      .default("desc"),
  }),
});