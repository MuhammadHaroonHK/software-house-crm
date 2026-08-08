import { AuditLog } from "@prisma/client";

export type AuditLogResponse = AuditLog;

export interface CreateAuditLogDTO {
  userId?: string;
  action: string;
  module: string;
  referenceId?: string;
  ipAddress?: string;
  userAgent?: string;
}

export interface AuditLogQueryDTO {
  page?: number;
  limit?: number;
  userId?: string;
  action?: string;
  module?: string;
  referenceId?: string;
  search?: string;
  sortBy?: "createdAt" | "action" | "module";
  sortOrder?: "asc" | "desc";
}