import { Router } from "express";
import { UserRole } from "@prisma/client";

import { departmentController } from "./department.controller";
import { validate } from "../../middleware/validate";
import { authenticate } from "../../middleware/authenticate";
import { authorize } from "../../middleware/authorize";
import { createDepartmentSchema } from "./department.validation";

const router = Router();

router.post(
  "/",
  authenticate,
  authorize(UserRole.SUPER_ADMIN),
  validate(createDepartmentSchema),
  departmentController.create.bind(departmentController)
);

export default router;