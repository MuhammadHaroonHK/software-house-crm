import {
  NotificationType,
  Prisma,
} from "@prisma/client";
import prisma from "../../lib/prisma";

export class NotificationRepository {
  async create(
    data: Prisma.NotificationCreateInput
  ) {
    return prisma.notification.create({
      data,
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

  async findUserById(id: string) {
    return prisma.user.findUnique({
      where: {
        id,
      },
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
    });
  }

  async findAll(
    skip: number,
    limit: number,
    search?: string,
    userId?: string,
    type?: NotificationType,
    isRead?: boolean,
    sortBy: string = "createdAt",
    sortOrder: "asc" | "desc" = "desc"
  ) {
    const where: Prisma.NotificationWhereInput =
      {};

    if (userId) {
      where.userId = userId;
    }

    if (type) {
      where.type = type;
    }

    if (isRead !== undefined) {
      where.isRead = isRead;
    }

    if (search) {
      where.OR = [
        {
          title: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          message: {
            contains: search,
            mode: "insensitive",
          },
        },
      ];
    }

    const orderBy: Prisma.NotificationOrderByWithRelationInput =
      {
        [sortBy]: sortOrder,
      };

    const [notifications, total] =
      await Promise.all([
        prisma.notification.findMany({
          where,
          skip,
          take: limit,
          orderBy,
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
        }),

        prisma.notification.count({
          where,
        }),
      ]);

    return {
      notifications,
      total,
    };
  }

  async findById(id: string) {
    return prisma.notification.findUnique({
      where: {
        id,
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

  async update(
    id: string,
    data: Prisma.NotificationUpdateInput
  ) {
    return prisma.notification.update({
      where: {
        id,
      },
      data,
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

  async markAllAsRead(userId: string) {
    return prisma.notification.updateMany({
      where: {
        userId,
        isRead: false,
      },
      data: {
        isRead: true,
        readAt: new Date(),
      },
    });
  }

  async delete(id: string) {
    return prisma.notification.delete({
      where: {
        id,
      },
    });
  }
}