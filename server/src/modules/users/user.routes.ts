import { Router } from "express";
import { userController } from "./user.controller";
import { validate } from "../../middleware/validate";
import { createUserSchema } from "./user.validation";

const router = Router();

router.post(
  "/",
  validate(createUserSchema),
  userController.createUser.bind(userController)
);

export default router;