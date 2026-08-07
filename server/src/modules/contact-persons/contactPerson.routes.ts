import { Router } from "express";
import { authenticate } from "../../middleware/authenticate";
import { authorize } from "../../middleware/authorize";
import { validate } from "../../middleware/validate";
import { UserRole } from "@prisma/client";

import { contactPersonController } from "./contactPerson.controller";

import {
  createContactPersonSchema,
  updateContactPersonSchema,
  getContactPersonsSchema,
} from "./contactPerson.validation";

const router = Router();

router.post(
  "/",
  authenticate,
  authorize(
    UserRole.SUPER_ADMIN,
    UserRole.PROJECT_MANAGER
  ),
  validate(createContactPersonSchema),
  contactPersonController.create.bind(contactPersonController)
);

router.get(
  "/",
  authenticate,
  authorize(
    UserRole.SUPER_ADMIN,
    UserRole.PROJECT_MANAGER
  ),
  validate(getContactPersonsSchema),
  contactPersonController.findAll.bind(contactPersonController)
);

router.get(
  "/:id",
  authenticate,
  authorize(
    UserRole.SUPER_ADMIN,
    UserRole.PROJECT_MANAGER
  ),
  contactPersonController.findById.bind(contactPersonController)
);

router.patch(
  "/:id",
  authenticate,
  authorize(
    UserRole.SUPER_ADMIN,
    UserRole.PROJECT_MANAGER
  ),
  validate(updateContactPersonSchema),
  contactPersonController.update.bind(contactPersonController)
);

router.delete(
  "/:id",
  authenticate,
  authorize(
    UserRole.SUPER_ADMIN,
    UserRole.PROJECT_MANAGER
  ),
  contactPersonController.delete.bind(contactPersonController)
);

export default router;