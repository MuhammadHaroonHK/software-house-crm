import prisma from "../../lib/prisma";
import { UserRole, UserStatus } from "@prisma/client";

export class ProjectMemberRepository {
  async findProjectById(projectId: string) {
    return prisma.project.findUnique({
      where: {
        id: projectId,
      },
    });
  }

  async findUserById(userId: string) {
    return prisma.user.findUnique({
      where: {
        id: userId,
      },

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

  async addMember(
    projectId: string,
    userId: string
  ) {
    return prisma.projectMember.create({
      data: {
        project: {
          connect: {
            id: projectId,
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
            status: true,

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

  async findMembers(projectId: string) {
    return prisma.projectMember.findMany({
      where: {
        projectId,
      },

      include: {
        user: {
          select: {
            id: true,
            firstName: true,
            lastName: true,
            email: true,
            status: true,

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
        joinedAt: "asc",
      },
    });
  }

  async removeMember(
    projectId: string,
    userId: string
  ) {
    return prisma.projectMember.delete({
      where: {
        projectId_userId: {
          projectId,
          userId,
        },
      },
    });
  }
}