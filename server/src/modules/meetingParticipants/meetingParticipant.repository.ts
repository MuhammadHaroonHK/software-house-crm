import prisma from "../../lib/prisma";

export class MeetingParticipantRepository {
  async findMeetingById(id: string) {
    return prisma.meeting.findUnique({
      where: { id },

      select: {
        id: true,
        projectId: true,

        project: {
          select: {
            id: true,
            managerId: true,
            status: true,
          },
        },
      },
    });
  }

  async findUserById(id: string) {
    return prisma.user.findUnique({
      where: { id },

      include: {
        role: true,
      },
    });
  }

  async isProjectMember(
    projectId: string,
    userId: string
  ) {
    return prisma.projectMember.findUnique({
      where: {
        projectId_userId: {
          projectId,
          userId,
        },
      },
    });
  }

  async participantExists(
    meetingId: string,
    userId: string
  ) {
    return prisma.meetingParticipant.findUnique({
      where: {
        meetingId_userId: {
          meetingId,
          userId,
        },
      },
    });
  }

  async addParticipant(
    meetingId: string,
    userId: string
  ) {
    return prisma.meetingParticipant.create({
      data: {
        meeting: {
          connect: {
            id: meetingId,
          },
        },

        user: {
          connect: {
            id: userId,
          },
        },
      },

      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,

            role: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });
  }

  async findParticipants(meetingId: string) {
    return prisma.meetingParticipant.findMany({
      where: {
        meetingId,
      },

      orderBy: {
        joinedAt: "asc",
      },

      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,

            role: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });
  }

  async removeParticipant(
    meetingId: string,
    userId: string
  ) {
    return prisma.meetingParticipant.delete({
      where: {
        meetingId_userId: {
          meetingId,
          userId,
        },
      },
    });
  }
}

export const meetingParticipantRepository =
  new MeetingParticipantRepository();