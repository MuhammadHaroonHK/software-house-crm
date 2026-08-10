import { Router } from "express";
import { UserRole } from "@prisma/client";

import { authenticate } from "../../middleware/authenticate";
import { authorize } from "../../middleware/authorize";
import { validate } from "../../middleware/validate";
import { paymentProofUpload } from "../../middleware/upload";

import {
  createPaymentSchema,
  updatePaymentSchema,
  getPaymentsSchema,
} from "./payment.validation";

import { paymentController } from "./payment.controller";

const router = Router();

// Create Payment
router.post(
  "/",
  authenticate,
  authorize(
    UserRole.SUPER_ADMIN,
    UserRole.PROJECT_MANAGER,
    UserRole.CLIENT
  ),
  paymentProofUpload.single("receiptImage"),
  validate(createPaymentSchema),
  paymentController.create.bind(
    paymentController
  )
);

// List Payments
router.get(
  "/",
  authenticate,
  authorize(
    UserRole.SUPER_ADMIN,
    UserRole.PROJECT_MANAGER,
    UserRole.EMPLOYEE
  ),
  validate(getPaymentsSchema),
  paymentController.findAll.bind(
    paymentController
  )
);

router.get(
  "/receiver-details",
  authenticate,
  paymentController.getReceiverDetails.bind(
    paymentController
  )
);

router.patch(
  "/:id/verify",
  authenticate,
  authorize(
    UserRole.SUPER_ADMIN,
    UserRole.PROJECT_MANAGER
  ),
  paymentController.verify.bind(
    paymentController
  )
);

router.patch(
  "/:id/reject",
  authenticate,
  authorize(
    UserRole.SUPER_ADMIN,
    UserRole.PROJECT_MANAGER
  ),
  paymentController.reject.bind(
    paymentController
  )
);

// Get Single Payment
router.get(
  "/:id",
  authenticate,
  authorize(
    UserRole.SUPER_ADMIN,
    UserRole.PROJECT_MANAGER,
    UserRole.EMPLOYEE
  ),
  paymentController.findById.bind(
    paymentController
  )
);

// Update Payment
router.patch(
  "/:id",
  authenticate,
  authorize(
    UserRole.SUPER_ADMIN,
    UserRole.PROJECT_MANAGER
  ),
  validate(updatePaymentSchema),
  paymentController.update.bind(
    paymentController
  )
);

// Delete Payment
router.delete(
  "/:id",
  authenticate,
  authorize(
    UserRole.SUPER_ADMIN,
    UserRole.PROJECT_MANAGER
  ),
  paymentController.delete.bind(
    paymentController
  )
);

export default router;