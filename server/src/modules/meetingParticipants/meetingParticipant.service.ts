import { AppError } from "../../utils/AppError";
import { meetingParticipantRepository } from "./meetingParticipant.repository";
import { AddMeetingParticipantDTO } from "./meetingParticipant.types";

export class MeetingParticipantService {
  async addParticipant(
    data: AddMeetingParticipantDTO
  ) {
    const meeting =
      await meetingParticipantRepository.findMeetingById(
        data.meetingId
      );

    if (!meeting) {
      throw new AppError(404, "Meeting not found.");
    }

    const user =
      await meetingParticipantRepository.findUserById(
        data.userId
      );

    if (!user) {
      throw new AppError(404, "User not found.");
    }

    const member =
      await meetingParticipantRepository.isProjectMember(
        meeting.projectId,
        data.userId
      );

    if (!member) {
      throw new AppError(
        400,
        "User is not a member of this project."
      );
    }

    const exists =
      await meetingParticipantRepository.participantExists(
        data.meetingId,
        data.userId
      );

    if (exists) {
      throw new AppError(
        409,
        "Participant already exists."
      );
    }

    return meetingParticipantRepository.addParticipant(
      data.meetingId,
      data.userId
    );
  }

  async findParticipants(meetingId: string) {
  const meeting =
    await meetingParticipantRepository.findMeetingById(
      meetingId
    );

  if (!meeting) {
    throw new AppError(404, "Meeting not found.");
  }

  const participants =
    await meetingParticipantRepository.findParticipants(
      meetingId
    );

  return participants.map((participant) => ({
    ...participant.user,
    joinedAt: participant.joinedAt,
  }));
}

async removeParticipant(
  meetingId: string,
  userId: string
) {
  const meeting =
    await meetingParticipantRepository.findMeetingById(
      meetingId
    );

  if (!meeting) {
    throw new AppError(404, "Meeting not found.");
  }

  const exists =
    await meetingParticipantRepository.participantExists(
      meetingId,
      userId
    );

  if (!exists) {
    throw new AppError(
      404,
      "Participant not found."
    );
  }

  await meetingParticipantRepository.removeParticipant(
    meetingId,
    userId
  );
}
}

export const meetingParticipantService =
  new MeetingParticipantService();