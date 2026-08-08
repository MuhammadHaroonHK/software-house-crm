import prisma from "../../lib/prisma";
import { Prisma } from "@prisma/client";
import {
  CreateAuditLogDTO,
} from "./auditLog.types";

export class AuditLogRepository {
  async create(data: CreateAuditLogDTO) {
    return prisma.auditLog.create({
      data: {
        ...(data.userId && {
          user: {
            connect: {
              id: data.userId,
            },
          },
        }),

        action: data.action,
        module: data.module,

        ...(data.referenceId && {
          referenceId: data.referenceId,
        }),

        ...(data.ipAddress && {
          ipAddress: data.ipAddress,
        }),

        ...(data.userAgent && {
          userAgent: data.userAgent,
        }),
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
    userId?: string,
    action?: string,
    module?: string,
    referenceId?: string,
    search?: string,
    sortBy:
      | "createdAt"
      | "action"
      | "module" = "createdAt",
    sortOrder: "asc" | "desc" = "desc"
  ) {
    const where: Prisma.AuditLogWhereInput = {
      ...(userId && {
        userId,
      }),

      ...(action && {
        action: {
          contains: action,
          mode: "insensitive",
        },
      }),

      ...(module && {
        module: {
          contains: module,
          mode: "insensitive",
        },
      }),

      ...(referenceId && {
        referenceId,
      }),

      ...(search && {
        OR: [
          {
            action: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            module: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            ipAddress: {
              contains: search,
              mode: "insensitive",
            },
          },
        ],
      }),
    };

    const [logs, total] =
      await prisma.$transaction([
        prisma.auditLog.findMany({
          where,

          skip,
          take: limit,

          orderBy: {
            [sortBy]: sortOrder,
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
                    name: true,
                  },
                },
              },
            },
          },
        }),

        prisma.auditLog.count({
          where,
        }),
      ]);

    return {
      logs,
      total,
    };
  }

  async findById(id: string) {
    return prisma.auditLog.findUnique({
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
      },
    });
  }
}