import { Router } from "express";
import { authenticate } from "../../middleware/authenticate";
import { authorize } from "../../middleware/authorize";
import { validate } from "../../middleware/validate";
import { UserRole } from "@prisma/client";
import { meetingController } from "./meeting.controller";
import {
  createMeetingSchema,
  updateMeetingSchema,
  getMeetingsSchema,
} from "./meeting.validation";

const router = Router();

/*
 * CREATE MEETING
 *
 * Only SUPER_ADMIN and PROJECT_MANAGER.
 */
router.post(
  "/",
  authenticate,
  authorize(
    UserRole.SUPER_ADMIN,
    UserRole.PROJECT_MANAGER
  ),
  validate(createMeetingSchema),
  meetingController.create.bind(
    meetingController
  )
);

/*
 * LIST MEETINGS
 *
 * SUPER_ADMIN:
 *   All meetings
 *
 * PROJECT_MANAGER:
 *   Meetings for projects they manage
 *
 * EMPLOYEE:
 *   Meetings for projects they are a member of
 */
router.get(
  "/",
  authenticate,
  authorize(
    UserRole.SUPER_ADMIN,
    UserRole.PROJECT_MANAGER,
    UserRole.EMPLOYEE
  ),
  validate(getMeetingsSchema),
  meetingController.findAll.bind(
    meetingController
  )
);

/*
 * GET MEETING
 *
 * SUPER_ADMIN:
 *   Any meeting
 *
 * PROJECT_MANAGER:
 *   Meeting from their project
 *
 * EMPLOYEE:
 *   Meeting from a project they are a member of
 */
router.get(
  "/:id",
  authenticate,
  authorize(
    UserRole.SUPER_ADMIN,
    UserRole.PROJECT_MANAGER,
    UserRole.EMPLOYEE
  ),
  meetingController.findById.bind(
    meetingController
  )
);

/*
 * UPDATE MEETING
 *
 * Only SUPER_ADMIN and PROJECT_MANAGER.
 */
router.patch(
  "/:id",
  authenticate,
  authorize(
    UserRole.SUPER_ADMIN,
    UserRole.PROJECT_MANAGER
  ),
  validate(updateMeetingSchema),
  meetingController.update.bind(
    meetingController
  )
);

/*
 * DELETE MEETING
 *
 * Only SUPER_ADMIN and PROJECT_MANAGER.
 */
router.delete(
  "/:id",
  authenticate,
  authorize(
    UserRole.SUPER_ADMIN,
    UserRole.PROJECT_MANAGER
  ),
  meetingController.delete.bind(
    meetingController
  )
);

export default router;