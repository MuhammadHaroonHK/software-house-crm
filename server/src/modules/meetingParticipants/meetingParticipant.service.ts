import { AppError } from "../../utils/AppError";
import {
  ProjectStatus,
  UserRole,
} from "@prisma/client";
import { meetingParticipantRepository } from "./meetingParticipant.repository";
import { AddMeetingParticipantDTO } from "./meetingParticipant.types";

export class MeetingParticipantService {
  private validateProjectAccess(
    project: {
      managerId: string;
      status: ProjectStatus;
    },
    actorId: string,
    actorRole: UserRole
  ) {
    if (
      actorRole !== UserRole.SUPER_ADMIN &&
      project.managerId !== actorId
    ) {
      throw new AppError(
        403,
        "Only the project manager can manage meeting participants."
      );
    }
  }

  private validateProjectStatus(
    status: ProjectStatus
  ) {
    if (
      status === ProjectStatus.COMPLETED ||
      status === ProjectStatus.CANCELLED
    ) {
      throw new AppError(
        400,
        "Meeting participants cannot be modified for a completed or cancelled project."
      );
    }
  }

  async addParticipant(
    data: AddMeetingParticipantDTO,
    actorId: string,
    actorRole: UserRole
  ) {
    const meeting =
      await meetingParticipantRepository.findMeetingById(
        data.meetingId
      );

    if (!meeting) {
      throw new AppError(
        404,
        "Meeting not found."
      );
    }

    this.validateProjectStatus(
      meeting.project.status
    );

    this.validateProjectAccess(
      meeting.project,
      actorId,
      actorRole
    );

    const user =
      await meetingParticipantRepository.findUserById(
        data.userId
      );

    if (!user) {
      throw new AppError(
        404,
        "User not found."
      );
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

  async findParticipants(
    meetingId: string,
    actorId: string,
    actorRole: UserRole
  ) {
    const meeting =
      await meetingParticipantRepository.findMeetingById(
        meetingId
      );

    if (!meeting) {
      throw new AppError(
        404,
        "Meeting not found."
      );
    }

    this.validateProjectAccess(
      meeting.project,
      actorId,
      actorRole
    );

    const participants =
      await meetingParticipantRepository.findParticipants(
        meetingId
      );

    return participants.map(
      (participant) => ({
        ...participant.user,
        joinedAt: participant.joinedAt,
      })
    );
  }

  async removeParticipant(
    meetingId: string,
    userId: string,
    actorId: string,
    actorRole: UserRole
  ) {
    const meeting =
      await meetingParticipantRepository.findMeetingById(
        meetingId
      );

    if (!meeting) {
      throw new AppError(
        404,
        "Meeting not found."
      );
    }

    this.validateProjectStatus(
      meeting.project.status
    );

    this.validateProjectAccess(
      meeting.project,
      actorId,
      actorRole
    );

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