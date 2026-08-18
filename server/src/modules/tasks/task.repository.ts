import prisma from "../../lib/prisma";
import {
  Prisma,
  TaskPriority,
  TaskStatus,
} from "@prisma/client";

export class TaskRepository {
  async create(data: Prisma.TaskCreateInput) {
    return prisma.task.create({
      data,

      include: {
        project: {
          select: {
            id: true,
            name: true,
            status: true,
            managerId: true,
          },
        },

        assignedTo: {
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
    return prisma.task.findUnique({
      where: {
        id,
      },

      include: {
        project: {
          select: {
            id: true,
            name: true,
            status: true,
            managerId: true,
          },
        },

        assignedTo: {
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
  projectId?: string,
  assignedToId?: string,
  priority?: TaskPriority,
  status?: TaskStatus,
  managerId?: string,
  sortBy = "createdAt",
  sortOrder: "asc" | "desc" = "desc"
) {
  const where: Prisma.TaskWhereInput = {
    ...(search && {
      OR: [
        {
          title: {
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

    ...(projectId && {
      projectId,
    }),

    ...(assignedToId && {
      assignedToId,
    }),

    ...(priority && {
      priority,
    }),

    ...(status && {
      status,
    }),

    /*
     * PROJECT_MANAGER access is restricted at the
     * database-query level instead of filtering after
     * pagination.
     */
    ...(managerId && {
      project: {
        managerId,
      },
    }),
  };

  const [tasks, total] =
    await Promise.all([
      prisma.task.findMany({
        where,

        skip,

        take: limit,

        include: {
          project: {
            select: {
              id: true,
              name: true,
              status: true,
              managerId: true,
            },
          },

          assignedTo: {
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

      prisma.task.count({
        where,
      }),
    ]);

  return {
    tasks,
    total,
  };
}

  async update(
    id: string,
    data: Prisma.TaskUpdateInput
  ) {
    return prisma.task.update({
      where: {
        id,
      },

      data,

      include: {
        project: {
          select: {
            id: true,
            name: true,
            status: true,
            managerId: true,
          },
        },

        assignedTo: {
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
    return prisma.task.delete({
      where: {
        id,
      },
    });
  }

  async findProjectById(id: string) {
    return prisma.project.findUnique({
      where: {
        id,
      },

      select: {
        id: true,
        name: true,
        status: true,
        managerId: true,
      },
    });
  }

  async findUserById(id: string) {
    return prisma.user.findUnique({
      where: {
        id,
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
}