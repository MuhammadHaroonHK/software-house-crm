import { Router } from "express";
import { authController } from "./auth.controller";
import { validate } from "../../middleware/validate";
import { loginSchema } from "./auth.validation";
import { authenticate } from "../../middleware/authenticate";

const router = Router();

router.post(
  "/login",
  validate(loginSchema),
  authController.login.bind(authController)
);

router.get(
  "/me",
  authenticate,
  authController.me.bind(authController)
);

export default router;