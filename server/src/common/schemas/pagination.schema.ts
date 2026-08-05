import { z } from "zod";

export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1).default(1),

  limit: z.coerce.number().int().min(1).max(100).default(10),

  search: z.string().optional().default(""),

  sortBy: z.string().optional().default("createdAt"),

  sortOrder: z
    .enum(["asc", "desc"])
    .optional()
    .default("desc"),
});