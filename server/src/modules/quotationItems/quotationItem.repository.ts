import prisma from "../../lib/prisma";
import { Prisma, QuotationStatus } from "@prisma/client";

export class QuotationItemRepository {
  async create(data: Prisma.QuotationItemCreateInput) {
    return prisma.quotationItem.create({
      data,
    });
  }

  async findById(id: string) {
    return prisma.quotationItem.findUnique({
      where: {
        id,
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

  async findItemsByQuotationId(quotationId: string) {
    return prisma.quotationItem.findMany({
      where: {
        quotationId,
      },

      orderBy: {
        createdAt: "asc",
      },
    });
  }

  async update(id: string, data: Prisma.QuotationItemUpdateInput) {
    return prisma.quotationItem.update({
      where: {
        id,
      },

      data,
    });
  }

  async delete(id: string) {
    return prisma.quotationItem.delete({
      where: {
        id,
      },
    });
  }

  async updateQuotationTotals(quotationId: string) {
    const quotation = await prisma.quotation.findUnique({
      where: {
        id: quotationId,
      },

      include: {
        items: true,
      },
    });

    if (!quotation) return;

    const subtotal = quotation.items.reduce(
      (sum, item) => sum + Number(item.totalPrice),
      0,
    );

    const totalAmount =
      subtotal - Number(quotation.discount) + Number(quotation.tax);

    return prisma.quotation.update({
      where: {
        id: quotationId,
      },

      data: {
        subtotal,

        totalAmount,
      },
    });
  }

  async isQuotationLocked(id: string) {
    const quotation = await prisma.quotation.findUnique({
      where: {
        id,
      },
    });

    if (!quotation) return false;

    const lockedStatuses: QuotationStatus[] = [
      QuotationStatus.ACCEPTED,
      QuotationStatus.REJECTED,
      QuotationStatus.EXPIRED,
    ];

    return lockedStatuses.includes(quotation.status);
  }
}
