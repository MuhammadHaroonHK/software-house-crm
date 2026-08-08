import { AppError } from "../../utils/AppError";
import { getPagination } from "../../utils/pagination";
import {
  CreateAuditLogDTO,
  AuditLogQueryDTO,
} from "./auditLog.types";
import { AuditLogRepository } from "./auditLog.repository";

const auditLogRepository =
  new AuditLogRepository();

export class AuditLogService {
  async create(data: CreateAuditLogDTO) {
    if (data.userId) {
      const user =
        await auditLogRepository.findUserById(
          data.userId
        );

      if (!user) {
        throw new AppError(
          404,
          "User not found."
        );
      }
    }

    return auditLogRepository.create(data);
  }

  async findAll(query: AuditLogQueryDTO) {
    const pagination =
      getPagination(query);

    if (query.userId) {
      const user =
        await auditLogRepository.findUserById(
          query.userId
        );

      if (!user) {
        throw new AppError(
          404,
          "User not found."
        );
      }
    }

    const {
      logs,
      total,
    } =
      await auditLogRepository.findAll(
        pagination.skip,
        pagination.limit,
        query.userId,
        query.action,
        query.module,
        query.referenceId,
        query.search,
        pagination.sortBy as
          | "createdAt"
          | "action"
          | "module",
        pagination.sortOrder
      );

    return {
      data: logs,

      meta: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages: Math.ceil(
          total / pagination.limit
        ),
      },
    };
  }

  async findById(id: string) {
    const log =
      await auditLogRepository.findById(id);

    if (!log) {
      throw new AppError(
        404,
        "Audit log not found."
      );
    }

    return log;
  }
}

export const auditLogService =
  new AuditLogService();