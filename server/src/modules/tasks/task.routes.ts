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

router.post(
  "/",
  authenticate,
  authorize(
    UserRole.SUPER_ADMIN,
    UserRole.PROJECT_MANAGER
  ),
  validate(createTaskSchema),
  taskController.create.bind(taskController)
);

router.get(
  "/",
  authenticate,
  authorize(
    UserRole.SUPER_ADMIN,
    UserRole.PROJECT_MANAGER
  ),
  validate(getTasksSchema),
  taskController.findAll.bind(taskController)
);

router.get(
  "/:id",
  authenticate,
  authorize(
    UserRole.SUPER_ADMIN,
    UserRole.PROJECT_MANAGER
  ),
  taskController.findById.bind(taskController)
);

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

router.patch(
  "/:id",
  authenticate,
  authorize(
    UserRole.SUPER_ADMIN,
    UserRole.PROJECT_MANAGER
  ),
  validate(updateTaskSchema),
  taskController.update.bind(taskController)
);

router.delete(
  "/:id",
  authenticate,
  authorize(
    UserRole.SUPER_ADMIN,
    UserRole.PROJECT_MANAGER
  ),
  taskController.delete.bind(taskController)
);

export default router;