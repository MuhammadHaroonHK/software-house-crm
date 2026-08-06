import { Router } from "express";
import { userController } from "./user.controller";
import { validate } from "../../middleware/validate";
import { createUserSchema } from "./user.validation";
import { authenticate } from "../../middleware/authenticate";
import { authorize } from "../../middleware/authorize";
import { UserRole } from "@prisma/client";
import { getUsersSchema } from "./user.validation";

const router = Router();

router.post(
  "/",
  authenticate,
  authorize(UserRole.SUPER_ADMIN),
  validate(createUserSchema),
  userController.createUser.bind(userController)
);

router.get(
  "/",
  authenticate,
  authorize(UserRole.SUPER_ADMIN),
  validate(getUsersSchema),
  userController.findAll.bind(userController)
);

router.get(
  "/:id",
  authenticate,
  authorize(UserRole.SUPER_ADMIN),
  userController.findById.bind(userController)
);

export default router;