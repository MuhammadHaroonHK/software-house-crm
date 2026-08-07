import { Router } from "express";
import { UserRole } from "@prisma/client";

import { authenticate } from "../../middleware/authenticate";
import { authorize } from "../../middleware/authorize";
import { validate } from "../../middleware/validate";

import { quotationController } from "./quotation.controller";

import {
  createQuotationSchema,
  updateQuotationSchema,
  getQuotationsSchema,
} from "./quotation.validation";

const router = Router();

router.post(
  "/",
  authenticate,
  authorize(
    UserRole.SUPER_ADMIN,
    UserRole.PROJECT_MANAGER
  ),
  validate(createQuotationSchema),
  quotationController.create.bind(quotationController)
);

router.get(
  "/",
  authenticate,
  authorize(
    UserRole.SUPER_ADMIN,
    UserRole.PROJECT_MANAGER
  ),
  validate(getQuotationsSchema),
  quotationController.findAll.bind(quotationController)
);

router.get(
  "/:id",
  authenticate,
  authorize(
    UserRole.SUPER_ADMIN,
    UserRole.PROJECT_MANAGER
  ),
  quotationController.findById.bind(quotationController)
);

router.patch(
  "/:id",
  authenticate,
  authorize(
    UserRole.SUPER_ADMIN,
    UserRole.PROJECT_MANAGER
  ),
  validate(updateQuotationSchema),
  quotationController.update.bind(quotationController)
);

router.delete(
  "/:id",
  authenticate,
  authorize(
    UserRole.SUPER_ADMIN,
    UserRole.PROJECT_MANAGER
  ),
  quotationController.delete.bind(quotationController)
);

export default router;