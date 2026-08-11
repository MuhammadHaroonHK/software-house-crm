import prisma from "../../lib/prisma";
import {
  Prisma,
  ProjectStatus,
  UserRole,
} from "@prisma/client";

export class ProjectRepository {
  async create(data: Prisma.ProjectCreateInput) {
    return prisma.project.create({
      data,

      include: {
        client: true,

        manager: {
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
    return prisma.project.findUnique({
      where: {
        id,
      },

      include: {
        client: true,

        manager: {
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

  async countMembers(projectId: string) {
    return prisma.projectMember.count({
      where: {
        projectId,
      },
    });
  }

  async countTasks(projectId: string) {
    return prisma.task.count({
      where: {
        projectId,
      },
    });
  }

  async countMeetings(projectId: string) {
    return prisma.meeting.count({
      where: {
        projectId,
      },
    });
  }

  async countQuotations(projectId: string) {
    return prisma.quotation.count({
      where: {
        projectId,
      },
    });
  }

  async findAll(
    skip: number,
    limit: number,
    search: string,
    status?: ProjectStatus,
    clientId?: string,
    managerId?: string,
    sortBy: string = "createdAt",
    sortOrder: "asc" | "desc" = "desc"
  ) {
    const where: Prisma.ProjectWhereInput = {
      ...(search && {
        OR: [
          {
            name: {
              contains: search,
              mode: "insensitive",
            },
          },

          {
            description: {
              contains: search,
              mode: "insensitive",
            },
          },
        ],
      }),

      ...(status && {
        status,
      }),

      ...(clientId && {
        clientId,
      }),

      ...(managerId && {
        managerId,
      }),
    };

    const [projects, total] = await Promise.all([
      prisma.project.findMany({
        where,

        skip,

        take: limit,

        include: {
          client: true,

          manager: {
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

      prisma.project.count({
        where,
      }),
    ]);

    return {
      projects,
      total,
    };
  }

  async update(
    id: string,
    data: Prisma.ProjectUpdateInput
  ) {
    return prisma.project.update({
      where: {
        id,
      },

      data,

      include: {
        client: true,

        manager: {
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

  async updateStatus(
    id: string,
    status: ProjectStatus
  ) {
    return prisma.project.update({
      where: {
        id,
      },

      data: {
        status,
      },

      include: {
        client: true,

        manager: {
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

  async updateManager(
    id: string,
    managerId: string
  ) {
    return prisma.project.update({
      where: {
        id,
      },

      data: {
        manager: {
          connect: {
            id: managerId,
          },
        },
      },

      include: {
        client: true,

        manager: {
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
    return prisma.project.delete({
      where: {
        id,
      },
    });
  }

  async findClientById(id: string) {
    return prisma.client.findUnique({
      where: {
        id,
      },
    });
  }

  async findManagerById(id: string) {
    return prisma.user.findUnique({
      where: {
        id,
      },

      include: {
        role: true,
      },
    });
  }

  async isProjectManager(id: string) {
    const user = await prisma.user.findUnique({
      where: {
        id,
      },

      include: {
        role: true,
      },
    });

    if (!user) {
      return false;
    }

    return user.role.name === UserRole.PROJECT_MANAGER;
  }
}