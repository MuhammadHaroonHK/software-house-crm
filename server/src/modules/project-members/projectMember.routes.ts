import { Router } from "express";
import { UserRole } from "@prisma/client";
import { authenticate } from "../../middleware/authenticate";
import { authorize } from "../../middleware/authorize";
import { validate } from "../../middleware/validate";
import { projectMemberController } from "./projectMember.controller";
import {
  addProjectMemberSchema,
  getProjectMembersSchema,
  removeProjectMemberSchema,
} from "./projectMember.validation";

const router = Router({ mergeParams: true });

router.post(
  "/",
  authenticate,
  authorize(
    UserRole.SUPER_ADMIN,
    UserRole.PROJECT_MANAGER
  ),
  validate(addProjectMemberSchema),
  projectMemberController.addMember.bind(
    projectMemberController
  )
);

router.get(
  "/",
  authenticate,
  authorize(
    UserRole.SUPER_ADMIN,
    UserRole.PROJECT_MANAGER,
    UserRole.EMPLOYEE
  ),
  validate(getProjectMembersSchema),
  projectMemberController.findMembers.bind(
    projectMemberController
  )
);

router.delete(
  "/:userId",
  authenticate,
  authorize(
    UserRole.SUPER_ADMIN,
    UserRole.PROJECT_MANAGER
  ),
  validate(removeProjectMemberSchema),
  projectMemberController.removeMember.bind(
    projectMemberController
  )
);

export default router;