import { Router } from "express";
import { UserRole } from "@prisma/client";

import { authenticate } from "../../middleware/authenticate";
import { authorize } from "../../middleware/authorize";
import { validate } from "../../middleware/validate";

import {
  createAuditLogSchema,
  auditLogQuerySchema,
} from "./auditLog.validation";

import { auditLogController } from "./auditLog.controller";

const router = Router();

/*
 * Create audit log
 *
 * Only Super Admin and Project Manager
 * can manually create audit logs.
 */
router.post(
  "/",
  authenticate,
  authorize(
    UserRole.SUPER_ADMIN,
    UserRole.PROJECT_MANAGER
  ),
  validate(createAuditLogSchema),
  auditLogController.create.bind(
    auditLogController
  )
);

/*
 * Get all audit logs
 */
router.get(
  "/",
  authenticate,
  authorize(
    UserRole.SUPER_ADMIN,
    UserRole.PROJECT_MANAGER
  ),
  validate(auditLogQuerySchema),
  auditLogController.findAll.bind(
    auditLogController
  )
);

/*
 * Get audit log by ID
 */
router.get(
  "/:id",
  authenticate,
  authorize(
    UserRole.SUPER_ADMIN,
    UserRole.PROJECT_MANAGER
  ),
  auditLogController.findById.bind(
    auditLogController
  )
);

export default router;