import { Router } from "express";
import { UserRole } from "@prisma/client";

import { authenticate } from "../../middleware/authenticate";
import { authorize } from "../../middleware/authorize";
import { validate } from "../../middleware/validate";

import {
  createFileSchema,
  updateFileSchema,
  fileQuerySchema,
} from "./file.validation";

import { fileController } from "./file.controller";

const router = Router();

router.post(
  "/",
  authenticate,
  authorize(
    UserRole.SUPER_ADMIN,
    UserRole.PROJECT_MANAGER
  ),
  validate(createFileSchema),
  fileController.create.bind(
    fileController
  )
);

router.get(
  "/",
  authenticate,
  authorize(
    UserRole.SUPER_ADMIN,
    UserRole.PROJECT_MANAGER,
    UserRole.EMPLOYEE,
    UserRole.CLIENT
  ),
  validate(fileQuerySchema),
  fileController.findAll.bind(
    fileController
  )
);

router.get(
  "/:id",
  authenticate,
  authorize(
    UserRole.SUPER_ADMIN,
    UserRole.PROJECT_MANAGER,
    UserRole.EMPLOYEE,
    UserRole.CLIENT
  ),
  fileController.findById.bind(
    fileController
  )
);

router.patch(
  "/:id",
  authenticate,
  authorize(
    UserRole.SUPER_ADMIN,
    UserRole.PROJECT_MANAGER
  ),
  validate(updateFileSchema),
  fileController.update.bind(
    fileController
  )
);

router.delete(
  "/:id",
  authenticate,
  authorize(
    UserRole.SUPER_ADMIN,
    UserRole.PROJECT_MANAGER
  ),
  fileController.delete.bind(
    fileController
  )
);

export default router;