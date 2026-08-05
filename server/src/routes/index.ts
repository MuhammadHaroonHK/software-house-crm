import { Router } from "express";
import healthRoutes from "./health.routes";
import authRoutes from "../modules/auth/auth.routes";
import userRoutes from "../modules/users/user.routes";

const router = Router();

router.use("/", healthRoutes);
router.use("/auth", authRoutes);
router.use("/users", userRoutes);

export default router;