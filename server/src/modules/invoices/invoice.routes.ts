import { Router } from "express";
import { UserRole } from "@prisma/client";

import { authenticate } from "../../middleware/authenticate";
import { authorize } from "../../middleware/authorize";
import { validate } from "../../middleware/validate";

import { invoiceController } from "./invoice.controller";

import {
  createInvoiceSchema,
  updateInvoiceSchema,
  getInvoicesSchema,
} from "./invoice.validation";

const router = Router();

router.post(
  "/",
  authenticate,
  authorize(
    UserRole.SUPER_ADMIN,
    UserRole.PROJECT_MANAGER
  ),
  validate(createInvoiceSchema),
  invoiceController.create.bind(
    invoiceController
  )
);

router.get(
  "/",
  authenticate,
  authorize(
    UserRole.SUPER_ADMIN,
    UserRole.PROJECT_MANAGER
  ),
  validate(getInvoicesSchema),
  invoiceController.findAll.bind(
    invoiceController
  )
);

router.get(
  "/:id",
  authenticate,
  authorize(
    UserRole.SUPER_ADMIN,
    UserRole.PROJECT_MANAGER
  ),
  invoiceController.findById.bind(
    invoiceController
  )
);

router.patch(
  "/:id",
  authenticate,
  authorize(
    UserRole.SUPER_ADMIN,
    UserRole.PROJECT_MANAGER
  ),
  validate(updateInvoiceSchema),
  invoiceController.update.bind(
    invoiceController
  )
);

router.delete(
  "/:id",
  authenticate,
  authorize(
    UserRole.SUPER_ADMIN,
    UserRole.PROJECT_MANAGER
  ),
  invoiceController.delete.bind(
    invoiceController
  )
);

export default router;