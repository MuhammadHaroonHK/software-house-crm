import { Router } from "express";
import { authController } from "./auth.controller";
import { validate } from "../../middleware/validate";
import { loginSchema } from "./auth.validation";

const router = Router();

router.post(
  "/login",
  validate(loginSchema),
  authController.login.bind(authController)
);

export default router;