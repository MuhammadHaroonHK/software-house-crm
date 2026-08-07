import { Router } from "express";
import { authenticate } from "../../middleware/authenticate";
import { authorize } from "../../middleware/authorize";
import { validate } from "../../middleware/validate";
import { UserRole } from "@prisma/client";
import { projectController } from "./project.controller";
import { createProjectSchema } from "./project.validation";
import { getProjectsSchema } from "./project.validation";

const router = Router();

router.post(
  "/",
  authenticate,
  authorize(
    UserRole.SUPER_ADMIN,
    UserRole.PROJECT_MANAGER
  ),
  validate(createProjectSchema),
  projectController.create.bind(projectController)
);

router.get(
  "/",
  authenticate,
  authorize(
    UserRole.SUPER_ADMIN,
    UserRole.PROJECT_MANAGER
  ),
  validate(getProjectsSchema),
  projectController.findAll.bind(projectController)
);

export default router;