import prisma from "../../lib/prisma";
import { Prisma, QuotationStatus } from "@prisma/client";

export class QuotationRepository {
  async create(data: Prisma.QuotationCreateInput) {
    return prisma.quotation.create({
      data,

      include: {
        client: true,

        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async findById(id: string) {
    return prisma.quotation.findUnique({
      where: { id },

      include: {
        client: true,

        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async findByQuotationNumber(quotationNumber: string) {
    return prisma.quotation.findUnique({
      where: {
        quotationNumber,
      },
    });
  }

  async findClientById(id: string) {
    return prisma.client.findUnique({
      where: { id },
    });
  }

  async findProjectById(id: string) {
    return prisma.project.findUnique({
      where: { id },
    });
  }
  async findAll(
    skip: number,
    limit: number,
    search: string,
    status?: QuotationStatus,
    clientId?: string,
    projectId?: string,
    sortBy: string = "createdAt",
    sortOrder: "asc" | "desc" = "desc",
  ) {
    const where: Prisma.QuotationWhereInput = {
      ...(search && {
        OR: [
          {
            quotationNumber: {
              contains: search,
              mode: "insensitive",
            },
          },

          {
            notes: {
              contains: search,
              mode: "insensitive",
            },
          },

          {
            client: {
              companyName: {
                contains: search,
                mode: "insensitive",
              },
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

      ...(projectId && {
        projectId,
      }),
    };

    const [quotations, total] = await Promise.all([
      prisma.quotation.findMany({
        where,

        skip,

        take: limit,

        include: {
          client: true,

          project: {
            select: {
              id: true,
              name: true,
            },
          },
        },

        orderBy: {
          [sortBy]: sortOrder,
        },
      }),

      prisma.quotation.count({
        where,
      }),
    ]);

    return {
      quotations,
      total,
    };
  }

  async findItemsByQuotationId(quotationId: string) {
    return prisma.quotationItem.findMany({
      where: {
        quotationId,
      },
    });
  }

  async update(id: string, data: Prisma.QuotationUpdateInput) {
    return prisma.quotation.update({
      where: {
        id,
      },

      data,

      include: {
        client: true,

        project: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    });
  }

  async delete(id: string) {
    return prisma.quotation.delete({
      where: {
        id,
      },
    });
  }
}
