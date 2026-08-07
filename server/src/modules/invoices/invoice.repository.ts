import prisma from "../../lib/prisma";
import {
  InvoiceStatus,
  Prisma,
  QuotationStatus,
} from "@prisma/client";

export class InvoiceRepository {
  async create(data: Prisma.InvoiceCreateInput) {
    return prisma.invoice.create({
      data,

      include: {
        quotation: {
          include: {
            client: true,
            project: true,
          },
        },
      },
    });
  }

  async findById(id: string) {
    return prisma.invoice.findUnique({
      where: {
        id,
      },

      include: {
        quotation: {
          include: {
            client: true,
            project: true,
          },
        },
      },
    });
  }

  async findByQuotationId(
    quotationId: string
  ) {
    return prisma.invoice.findUnique({
      where: {
        quotationId,
      },
    });
  }

  async findQuotationById(id: string) {
    return prisma.quotation.findUnique({
      where: {
        id,
      },
    });
  }

  async findAll(
    skip: number,
    limit: number,
    search: string,
    status?: InvoiceStatus,
    quotationId?: string,
    sortBy: string = "createdAt",
    sortOrder: "asc" | "desc" = "desc"
  ) {
    const where: Prisma.InvoiceWhereInput = {
      ...(search && {
        invoiceNumber: {
          contains: search,
          mode: "insensitive",
        },
      }),

      ...(status && {
        status,
      }),

      ...(quotationId && {
        quotationId,
      }),
    };

    const [invoices, total] =
      await Promise.all([
        prisma.invoice.findMany({
          where,

          skip,

          take: limit,

          include: {
            quotation: {
              include: {
                client: true,
                project: true,
              },
            },
          },

          orderBy: {
            [sortBy]: sortOrder,
          },
        }),

        prisma.invoice.count({
          where,
        }),
      ]);

    return {
      invoices,
      total,
    };
  }

  async update(
    id: string,
    data: Prisma.InvoiceUpdateInput
  ) {
    return prisma.invoice.update({
      where: {
        id,
      },

      data,

      include: {
        quotation: {
          include: {
            client: true,
            project: true,
          },
        },
      },
    });
  }

  async delete(id: string) {
    return prisma.invoice.delete({
      where: {
        id,
      },
    });
  }

  async isQuotationAccepted(id: string) {
    const quotation =
      await prisma.quotation.findUnique({
        where: {
          id,
        },
      });

    if (!quotation) {
      return false;
    }

    return (
      quotation.status ===
      QuotationStatus.ACCEPTED
    );
  }
}