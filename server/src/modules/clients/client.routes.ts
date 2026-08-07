import { Router } from "express";
import { authenticate } from "../../middleware/authenticate";
import { authorize } from "../../middleware/authorize";
import { validate } from "../../middleware/validate";
import { UserRole } from "@prisma/client";

import { clientController } from "./client.controller";

import {
  createClientSchema,
  updateClientSchema,
  getClientsSchema,
} from "./client.validation";

const router = Router();

router.post(
  "/",
  authenticate,
  authorize(
    UserRole.SUPER_ADMIN,
    UserRole.PROJECT_MANAGER
  ),
  validate(createClientSchema),
  clientController.create.bind(clientController)
);

router.get(
  "/",
  authenticate,
  authorize(
    UserRole.SUPER_ADMIN,
    UserRole.PROJECT_MANAGER
  ),
  validate(getClientsSchema),
  clientController.findAll.bind(clientController)
);

router.get(
  "/:id",
  authenticate,
  authorize(
    UserRole.SUPER_ADMIN,
    UserRole.PROJECT_MANAGER
  ),
  clientController.findById.bind(clientController)
);

router.patch(
  "/:id",
  authenticate,
  authorize(
    UserRole.SUPER_ADMIN,
    UserRole.PROJECT_MANAGER
  ),
  validate(updateClientSchema),
  clientController.update.bind(clientController)
);

router.delete(
  "/:id",
  authenticate,
  authorize(UserRole.SUPER_ADMIN),
  clientController.delete.bind(clientController)
);

export default router;