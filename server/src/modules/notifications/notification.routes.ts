import { Router } from "express";
import { UserRole } from "@prisma/client";

import { authenticate } from "../../middleware/authenticate";
import { authorize } from "../../middleware/authorize";
import { validate } from "../../middleware/validate";

import {
  createNotificationSchema,
  updateNotificationSchema,
  notificationQuerySchema,
} from "./notification.validation";

import { notificationController } from "./notification.controller";

const router = Router();

/**
 * Create notification
 */
router.post(
  "/",
  authenticate,
  authorize(
    UserRole.SUPER_ADMIN,
    UserRole.PROJECT_MANAGER
  ),
  validate(createNotificationSchema),
  notificationController.create.bind(
    notificationController
  )
);

/**
 * Get all notifications
 */
router.get(
  "/",
  authenticate,
  authorize(
    UserRole.SUPER_ADMIN,
    UserRole.PROJECT_MANAGER,
    UserRole.EMPLOYEE,
    UserRole.CLIENT
  ),
  validate(notificationQuerySchema),
  notificationController.findAll.bind(
    notificationController
  )
);

/**
 * Get single notification
 */
router.get(
  "/:id",
  authenticate,
  authorize(
    UserRole.SUPER_ADMIN,
    UserRole.PROJECT_MANAGER,
    UserRole.EMPLOYEE,
    UserRole.CLIENT
  ),
  notificationController.findById.bind(
    notificationController
  )
);

/**
 * Update notification
 */
router.patch(
  "/:id",
  authenticate,
  authorize(
    UserRole.SUPER_ADMIN,
    UserRole.PROJECT_MANAGER
  ),
  validate(updateNotificationSchema),
  notificationController.update.bind(
    notificationController
  )
);

/**
 * Mark one notification as read
 */
router.patch(
  "/:id/read",
  authenticate,
  authorize(
    UserRole.SUPER_ADMIN,
    UserRole.PROJECT_MANAGER,
    UserRole.EMPLOYEE,
    UserRole.CLIENT
  ),
  notificationController.markAsRead.bind(
    notificationController
  )
);

/**
 * Mark all notifications of a user as read
 */
router.patch(
  "/user/:userId/read-all",
  authenticate,
  authorize(
    UserRole.SUPER_ADMIN,
    UserRole.PROJECT_MANAGER
  ),
  notificationController.markAllAsRead.bind(
    notificationController
  )
);

/**
 * Delete notification
 */
router.delete(
  "/:id",
  authenticate,
  authorize(
    UserRole.SUPER_ADMIN,
    UserRole.PROJECT_MANAGER
  ),
  notificationController.delete.bind(
    notificationController
  )
);

export default router;