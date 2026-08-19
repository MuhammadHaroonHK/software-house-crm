import { Router } from "express";

import { authenticate } from "../../middleware/authenticate";
import { authorize } from "../../middleware/authorize";
import { validate } from "../../middleware/validate";
import { UserRole } from "@prisma/client";

import {
  meetingParticipantController,
} from "./meetingParticipant.controller";

import {
  addMeetingParticipantSchema,
  getMeetingParticipantsSchema,
  removeMeetingParticipantSchema,
} from "./meetingParticipant.validation";

const router = Router();

router.post(
  "/:meetingId/participants",
  authenticate,
  authorize(
    UserRole.SUPER_ADMIN,
    UserRole.PROJECT_MANAGER
  ),
  validate(
    addMeetingParticipantSchema
  ),
  meetingParticipantController.addParticipant.bind(
    meetingParticipantController
  )
);

/*
 * View participants
 *
 * SUPER_ADMIN:
 *   Any meeting
 *
 * PROJECT_MANAGER:
 *   Meetings from their projects
 *
 * EMPLOYEE:
 *   Meetings from projects they are members of
 *
 * Employees remain read-only.
 */
router.get(
  "/:meetingId/participants",
  authenticate,
  authorize(
    UserRole.SUPER_ADMIN,
    UserRole.PROJECT_MANAGER,
    UserRole.EMPLOYEE
  ),
  validate(
    getMeetingParticipantsSchema
  ),
  meetingParticipantController.findParticipants.bind(
    meetingParticipantController
  )
);

router.delete(
  "/:meetingId/participants/:userId",
  authenticate,
  authorize(
    UserRole.SUPER_ADMIN,
    UserRole.PROJECT_MANAGER
  ),
  validate(
    removeMeetingParticipantSchema
  ),
  meetingParticipantController.removeParticipant.bind(
    meetingParticipantController
  )
);

export default router;