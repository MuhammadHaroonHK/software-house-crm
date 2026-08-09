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

router.patch(
  "/:id/send",
  authenticate,
  authorize(
    UserRole.SUPER_ADMIN,
    UserRole.PROJECT_MANAGER
  ),
  quotationController.send.bind(
    quotationController
  )
);

router.patch(
  "/:id/accept",
  authenticate,
  authorize(
    UserRole.SUPER_ADMIN,
    UserRole.PROJECT_MANAGER
  ),
  quotationController.accept.bind(
    quotationController
  )
);

router.patch(
  "/:id/reject",
  authenticate,
  authorize(
    UserRole.SUPER_ADMIN,
    UserRole.PROJECT_MANAGER
  ),
  quotationController.reject.bind(
    quotationController
  )
);

router.patch(
  "/:id/expire",
  authenticate,
  authorize(
    UserRole.SUPER_ADMIN,
    UserRole.PROJECT_MANAGER
  ),
  quotationController.expire.bind(
    quotationController
  )
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