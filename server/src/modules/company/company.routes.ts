import { Router } from "express";
import { companyController } from "./company.controller";
import { authenticate } from "../../middleware/authenticate";
import { authorize } from "../../middleware/authorize";
import { validate } from "../../middleware/validate";
import { UserRole } from "@prisma/client";
import { updateCompanySchema } from "./company.validation";

const router = Router();

router.get(
  "/",
  authenticate,
  authorize(UserRole.SUPER_ADMIN),
  companyController.find.bind(companyController)
);

router.patch(
  "/",
  authenticate,
  authorize(UserRole.SUPER_ADMIN),
  validate(updateCompanySchema),
  companyController.update.bind(companyController)
);

export default router;