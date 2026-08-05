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
  (req, res) => {
    return res.json({
      success: true,
      data: req.user,
    });
  }
);

export default router;