import { Router } from "express";
import { UserRole } from "@prisma/client";

import { departmentController } from "./department.controller";
import {
  createDepartmentSchema,
  updateDepartmentSchema,
  getDepartmentsSchema,
} from "./department.validation";

import { authenticate } from "../../middleware/authenticate";
import { authorize } from "../../middleware/authorize";
import { validate } from "../../middleware/validate";

const router = Router();

router.use(authenticate);
router.use(authorize(UserRole.SUPER_ADMIN));

router.post(
  "/",
  validate(createDepartmentSchema),
  departmentController.create.bind(departmentController)
);

router.get(
  "/",
  validate(getDepartmentsSchema),
  departmentController.findAll.bind(departmentController)
);

router.patch(
  "/:id",
  validate(updateDepartmentSchema),
  departmentController.update.bind(departmentController)
);

router.delete(
  "/:id",
  departmentController.delete.bind(departmentController)
);

export default router;