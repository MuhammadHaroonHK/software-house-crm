import prisma from "../../lib/prisma";
import {
  Prisma,
  MeetingStatus,
  UserRole,
} from "@prisma/client";

export class MeetingRepository {
  async create(
    data: Prisma.MeetingCreateInput
  ) {
    return prisma.meeting.create({
      data,

      include: {
        project: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },

        organizer: {
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

  async findById(id: string) {
    return prisma.meeting.findUnique({
      where: { id },

      include: {
        project: {
          select: {
            id: true,
            name: true,
            managerId: true,
            status: true,
          },
        },

        organizer: {
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

  async findAll(
    skip: number,
    limit: number,
    search: string,
    status?: MeetingStatus,
    projectId?: string,
    organizerId?: string,
    sortBy: string = "meetingDate",
    sortOrder: "asc" | "desc" = "desc",
    actorId?: string,
    actorRole?: UserRole
  ) {
    const where: Prisma.MeetingWhereInput = {
      ...(search && {
        OR: [
          {
            title: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            agenda: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            location: {
              contains: search,
              mode: "insensitive",
            },
          },
        ],
      }),

      ...(status && {
        status,
      }),

      ...(projectId && {
        projectId,
      }),

      ...(organizerId && {
        organizerId,
      }),

      ...(actorRole !== UserRole.SUPER_ADMIN &&
        actorId && {
          project: {
            managerId: actorId,
          },
        }),
    };

    const [meetings, total] =
      await Promise.all([
        prisma.meeting.findMany({
          where,

          skip,
          take: limit,

          include: {
            project: {
              select: {
                id: true,
                name: true,
                status: true,
              },
            },

            organizer: {
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

          orderBy: {
            [sortBy]: sortOrder,
          },
        }),

        prisma.meeting.count({
          where,
        }),
      ]);

    return {
      meetings,
      total,
    };
  }

  async update(
    id: string,
    data: Prisma.MeetingUpdateInput
  ) {
    return prisma.meeting.update({
      where: { id },

      data,

      include: {
        project: {
          select: {
            id: true,
            name: true,
            status: true,
          },
        },

        organizer: {
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

  async delete(id: string) {
    return prisma.meeting.delete({
      where: { id },
    });
  }

  async findProjectById(id: string) {
    return prisma.project.findUnique({
      where: { id },

      select: {
        id: true,
        managerId: true,
        status: true,
      },
    });
  }

  async findOrganizerById(id: string) {
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
    const member =
      await prisma.projectMember.findUnique({
        where: {
          projectId_userId: {
            projectId,
            userId,
          },
        },
      });

    return !!member;
  }

  async getAccessibleProjectIds(
    actorId: string,
    actorRole: UserRole
  ) {
    if (actorRole === UserRole.SUPER_ADMIN) {
      const projects =
        await prisma.project.findMany({
          select: {
            id: true,
          },
        });

      return projects.map(
        (project) => project.id
      );
    }

    const projects =
      await prisma.project.findMany({
        where: {
          managerId: actorId,
        },

        select: {
          id: true,
        },
      });

    return projects.map(
      (project) => project.id
    );
  }
}