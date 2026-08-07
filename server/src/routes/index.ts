import { Router } from "express";
import healthRoutes from "./health.routes";
import authRoutes from "../modules/auth/auth.routes";
import userRoutes from "../modules/users/user.routes";
import departmentRoutes from "../modules/departments/department.routes";
import companyRoutes from "../modules/company/company.routes";

const router = Router();

router.use("/", healthRoutes);
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/departments", departmentRoutes);
router.use("/company", companyRoutes);

export default router;