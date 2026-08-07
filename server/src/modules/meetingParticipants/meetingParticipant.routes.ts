import { Router } from "express";
import { authenticate } from "../../middleware/authenticate";
import { authorize } from "../../middleware/authorize";
import { validate } from "../../middleware/validate";
import { UserRole } from "@prisma/client";
import { meetingParticipantController } from "./meetingParticipant.controller";
import { addMeetingParticipantSchema } from "./meetingParticipant.validation";

const router = Router();

router.post(
  "/:meetingId/participants",
  authenticate,
  authorize(
    UserRole.SUPER_ADMIN,
    UserRole.PROJECT_MANAGER
  ),
  validate(addMeetingParticipantSchema),
  meetingParticipantController.addParticipant.bind(
    meetingParticipantController
  )
);

router.get(
  "/:meetingId/participants",
  authenticate,
  authorize(
    UserRole.SUPER_ADMIN,
    UserRole.PROJECT_MANAGER
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
  meetingParticipantController.removeParticipant.bind(
    meetingParticipantController
  )
);

export default router;