import { Router } from "express";
import { authController } from "./auth.controller";
import { validate } from "../../middleware/validate";
import { loginSchema } from "./auth.validation";
import { authenticate } from "../../middleware/authenticate";
import { UserRole } from "@prisma/client";
import { authorize } from "../../middleware/authorize";

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

router.get(
  "/admin-only",
  authenticate,
  authorize(UserRole.SUPER_ADMIN),
  (req, res) => {
    return res.json({
      success: true,
      message: "Welcome Super Admin!",
    });
  }
);

export default router;