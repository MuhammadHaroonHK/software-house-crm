import { Router } from "express";
import { authenticate } from "../../middleware/authenticate";
import { authorize } from "../../middleware/authorize";
import { validate } from "../../middleware/validate";
import { UserRole } from "@prisma/client";
import { taskController } from "./task.controller";
import {
  createTaskSchema,
  updateTaskSchema,
  getTasksSchema,
  updateTaskStatusSchema,
} from "./task.validation";

const router = Router();

/*
 * CREATE TASK
 * Only Super Admin and Project Manager
 */
router.post(
  "/",

  authenticate,

  authorize(
    UserRole.SUPER_ADMIN,
    UserRole.PROJECT_MANAGER
  ),

  validate(createTaskSchema),

  taskController.create.bind(
    taskController
  )
);

/*
 * LIST TASKS
 *
 * Super Admin:
 *   All tasks
 *
 * Project Manager:
 *   Tasks belonging to projects they manage
 *
 * Employee:
 *   Only their own assigned tasks
 */
router.get(
  "/",

  authenticate,

  authorize(
    UserRole.SUPER_ADMIN,
    UserRole.PROJECT_MANAGER,
    UserRole.EMPLOYEE
  ),

  validate(getTasksSchema),

  taskController.findAll.bind(
    taskController
  )
);

/*
 * GET TASK
 *
 * Super Admin:
 *   Any task
 *
 * Project Manager:
 *   Task from their project
 *
 * Employee:
 *   Their own task
 */
router.get(
  "/:id",

  authenticate,

  authorize(
    UserRole.SUPER_ADMIN,
    UserRole.PROJECT_MANAGER,
    UserRole.EMPLOYEE
  ),

  taskController.findById.bind(
    taskController
  )
);

/*
 * UPDATE TASK STATUS
 *
 * Employee:
 *   TODO -> IN_PROGRESS
 *   IN_PROGRESS -> IN_REVIEW
 *
 * Project Manager:
 *   IN_REVIEW -> COMPLETED
 *
 * Super Admin:
 *   Same manager-level authority
 */
router.patch(
  "/:id/status",

  authenticate,

  authorize(
    UserRole.SUPER_ADMIN,
    UserRole.PROJECT_MANAGER,
    UserRole.EMPLOYEE
  ),

  validate(updateTaskStatusSchema),

  taskController.updateStatus.bind(
    taskController
  )
);

/*
 * UPDATE TASK DETAILS
 *
 * Only Super Admin and Project Manager
 */
router.patch(
  "/:id",

  authenticate,

  authorize(
    UserRole.SUPER_ADMIN,
    UserRole.PROJECT_MANAGER
  ),

  validate(updateTaskSchema),

  taskController.update.bind(
    taskController
  )
);

/*
 * DELETE TASK
 *
 * Only Super Admin and Project Manager
 */
router.delete(
  "/:id",

  authenticate,

  authorize(
    UserRole.SUPER_ADMIN,
    UserRole.PROJECT_MANAGER
  ),

  taskController.delete.bind(
    taskController
  )
);

export default router;