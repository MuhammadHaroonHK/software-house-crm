import { Router } from "express";
import healthRoutes from "./health.routes";
import authRoutes from "../modules/auth/auth.routes";
import userRoutes from "../modules/users/user.routes";
import departmentRoutes from "../modules/departments/department.routes";
import companyRoutes from "../modules/company/company.routes";
import clientRoutes from "../modules/clients/client.routes";
import contactPersonRoutes from "../modules/contact-persons/contactPerson.routes";
import projectRoutes from "../modules/projects/project.routes";
import taskRoutes from "../modules/tasks/task.routes";
import meetingRoutes from "../modules/meetings/meeting.routes";

const router = Router();

router.use("/", healthRoutes);
router.use("/auth", authRoutes);
router.use("/users", userRoutes);
router.use("/departments", departmentRoutes);
router.use("/company", companyRoutes);
router.use("/clients", clientRoutes);
router.use("/contact-persons", contactPersonRoutes);
router.use("/projects", projectRoutes);
router.use("/tasks", taskRoutes);
router.use("/meetings", meetingRoutes);

export default router;