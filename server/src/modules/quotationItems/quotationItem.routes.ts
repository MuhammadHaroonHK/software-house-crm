import { Router } from "express";
import { UserRole } from "@prisma/client";

import { authenticate } from "../../middleware/authenticate";
import { authorize } from "../../middleware/authorize";
import { validate } from "../../middleware/validate";

import { quotationItemController } from "./quotationItem.controller";

import {
  createQuotationItemSchema,
  updateQuotationItemSchema,
} from "./quotationItem.validation";

const router = Router();

router.post(
  "/quotations/:quotationId/items",
  authenticate,
  authorize(
    UserRole.SUPER_ADMIN,
    UserRole.PROJECT_MANAGER
  ),
  validate(createQuotationItemSchema),
  quotationItemController.create.bind(
    quotationItemController
  )
);

router.get(
  "/quotations/:quotationId/items",
  authenticate,
  authorize(
    UserRole.SUPER_ADMIN,
    UserRole.PROJECT_MANAGER
  ),
  quotationItemController.findAll.bind(
    quotationItemController
  )
);

router.patch(
  "/quotation-items/:itemId",
  authenticate,
  authorize(
    UserRole.SUPER_ADMIN,
    UserRole.PROJECT_MANAGER
  ),
  validate(updateQuotationItemSchema),
  quotationItemController.update.bind(
    quotationItemController
  )
);

router.delete(
  "/quotation-items/:itemId",
  authenticate,
  authorize(
    UserRole.SUPER_ADMIN,
    UserRole.PROJECT_MANAGER
  ),
  quotationItemController.delete.bind(
    quotationItemController
  )
);

export default router;