import prisma from "../../lib/prisma";
import {
  FileType,
  FileModule,
  Prisma,
} from "@prisma/client";

export class FileRepository {
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

  async findReference(
    module: FileModule,
    referenceId?: string
  ) {
    if (!referenceId) {
      return true;
    }

    switch (module) {
      case FileModule.PROJECT:
        return prisma.project.findUnique({
          where: {
            id: referenceId,
          },
          select: {
            id: true,
          },
        });

      case FileModule.CLIENT:
        return prisma.client.findUnique({
          where: {
            id: referenceId,
          },
          select: {
            id: true,
          },
        });

      case FileModule.QUOTATION:
        return prisma.quotation.findUnique({
          where: {
            id: referenceId,
          },
          select: {
            id: true,
          },
        });

      case FileModule.INVOICE:
        return prisma.invoice.findUnique({
          where: {
            id: referenceId,
          },
          select: {
            id: true,
          },
        });

      case FileModule.MEETING:
        return prisma.meeting.findUnique({
          where: {
            id: referenceId,
          },
          select: {
            id: true,
          },
        });

      case FileModule.COMPANY:
        return prisma.companySetting.findUnique({
          where: {
            id: referenceId,
          },
          select: {
            id: true,
          },
        });

      default:
        return null;
    }
  }

  async create(
    data: Prisma.FileCreateInput
  ) {
    return prisma.file.create({
      data,
      include: {
        uploadedBy: {
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
    search?: string,
    uploadedById?: string,
    module?: FileModule,
    referenceId?: string,
    fileType?: FileType,
    sortBy: string = "createdAt",
    sortOrder: "asc" | "desc" = "desc"
  ) {
    const where: Prisma.FileWhereInput = {
      ...(uploadedById && {
        uploadedById,
      }),

      ...(module && {
        module,
      }),

      ...(referenceId && {
        referenceId,
      }),

      ...(fileType && {
        fileType,
      }),

      ...(search && {
        OR: [
          {
            fileName: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            originalName: {
              contains: search,
              mode: "insensitive",
            },
          },
          {
            mimeType: {
              contains: search,
              mode: "insensitive",
            },
          },
        ],
      }),
    };

    const [files, total] =
      await prisma.$transaction([
        prisma.file.findMany({
          where,
          skip,
          take: limit,
          orderBy: {
            [sortBy]: sortOrder,
          },
          include: {
            uploadedBy: {
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

        prisma.file.count({
          where,
        }),
      ]);

    return {
      files,
      total,
    };
  }

  async findById(id: string) {
    return prisma.file.findUnique({
      where: {
        id,
      },
      include: {
        uploadedBy: {
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
    data: Prisma.FileUpdateInput
  ) {
    return prisma.file.update({
      where: {
        id,
      },
      data,
      include: {
        uploadedBy: {
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
    return prisma.file.delete({
      where: {
        id,
      },
    });
  }
}