import {
  Request,
  Response,
  NextFunction,
} from "express";
import { successResponse } from "../../utils/apiResponse";
import { auditLogService } from "./auditLog.service";

export class AuditLogController {
  async create(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const log =
        await auditLogService.create({
          ...req.body,

          // Use authenticated user by default.
          userId:
            req.body.userId ??
            req.user?.userId,

          ipAddress:
            req.ip ||
            req.socket.remoteAddress,

          userAgent:
            req.get("user-agent") ??
            undefined,
        });

      return successResponse(
        res,
        "Audit log created successfully.",
        log,
        201
      );
    } catch (error) {
      next(error);
    }
  }

  async findAll(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const result =
        await auditLogService.findAll(
          req.query as any
        );

      return successResponse(
        res,
        "Audit logs fetched successfully.",
        result.data,
        200,
        result.meta
      );
    } catch (error) {
      next(error);
    }
  }

  async findById(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const log =
        await auditLogService.findById(
          String(req.params.id)
        );

      return successResponse(
        res,
        "Audit log fetched successfully.",
        log
      );
    } catch (error) {
      next(error);
    }
  }
}

export const auditLogController =
  new AuditLogController();