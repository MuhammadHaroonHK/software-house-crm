import { Router } from "express";
import { authenticate } from "../../middleware/authenticate";
import { authorize } from "../../middleware/authorize";
import { validate } from "../../middleware/validate";
import { UserRole } from "@prisma/client";

import {
  createInvoiceItemSchema,
  updateInvoiceItemSchema,
} from "./invoiceItem.validation";

import { invoiceItemController } from "./invoiceItem.controller";

const router = Router();

router.post(
  "/invoices/:invoiceId/items",
  authenticate,
  authorize(
    UserRole.SUPER_ADMIN,
    UserRole.PROJECT_MANAGER
  ),
  validate(createInvoiceItemSchema),
  invoiceItemController.create.bind(
    invoiceItemController
  )
);

router.get(
  "/invoices/:invoiceId/items",
  authenticate,
  authorize(
    UserRole.SUPER_ADMIN,
    UserRole.PROJECT_MANAGER,
    UserRole.EMPLOYEE
  ),
  invoiceItemController.findAll.bind(
    invoiceItemController
  )
);

router.patch(
  "/invoice-items/:itemId",
  authenticate,
  authorize(
    UserRole.SUPER_ADMIN,
    UserRole.PROJECT_MANAGER
  ),
  validate(updateInvoiceItemSchema),
  invoiceItemController.update.bind(
    invoiceItemController
  )
);

router.delete(
  "/invoice-items/:itemId",
  authenticate,
  authorize(
    UserRole.SUPER_ADMIN,
    UserRole.PROJECT_MANAGER
  ),
  invoiceItemController.delete.bind(
    invoiceItemController
  )
);

export default router;