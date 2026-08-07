import {
  Request,
  Response,
  NextFunction,
} from "express";
import { successResponse } from "../../utils/apiResponse";
import { meetingParticipantService } from "./meetingParticipant.service";

export class MeetingParticipantController {
  async addParticipant(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const participant =
        await meetingParticipantService.addParticipant({
          meetingId: String(req.params.meetingId),
          userId: req.body.userId,
        });

      return successResponse(
        res,
        "Participant added successfully.",
        participant,
        201
      );
    } catch (error) {
      next(error);
    }
  }

  async findParticipants(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const participants =
      await meetingParticipantService.findParticipants(
        String(req.params.meetingId)
      );

    return successResponse(
      res,
      "Participants fetched successfully.",
      participants
    );
  } catch (error) {
    next(error);
  }
}

async removeParticipant(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    await meetingParticipantService.removeParticipant(
      String(req.params.meetingId),
      String(req.params.userId)
    );

    return successResponse(
      res,
      "Participant removed successfully."
    );
  } catch (error) {
    next(error);
  }
}
}

export const meetingParticipantController =
  new MeetingParticipantController();