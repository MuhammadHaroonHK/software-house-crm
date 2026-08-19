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
      select: {
        id: true,
        clientId: true,
        projectId: true,
        status: true,
        subtotal: true,
        discount: true,
        tax: true,
        totalAmount: true,
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

    if (!quotation) {
      return;
    }

    const subtotal = quotation.items.reduce(
      (sum, item) => sum + Number(item.totalPrice),
      0,
    );

    const discount = Number(quotation.discount);

    const tax = Number(quotation.tax);

    const totalAmount = subtotal - discount + tax;

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

  async createAndRecalculate(
    quotationId: string,
    data: Prisma.QuotationItemCreateWithoutQuotationInput,
  ) {
    return prisma.$transaction(async (tx) => {
      await tx.quotationItem.create({
        data: {
          ...data,

          quotation: {
            connect: {
              id: quotationId,
            },
          },
        },
      });

      await this.recalculateQuotationTotals(tx, quotationId);

      return tx.quotationItem.findFirst({
        where: {
          quotationId,
        },

        orderBy: {
          createdAt: "desc",
        },
      });
    });
  }

  async updateAndRecalculate(
    itemId: string,
    quotationId: string,
    data: Prisma.QuotationItemUpdateInput,
  ) {
    return prisma.$transaction(async (tx) => {
      await tx.quotationItem.update({
        where: {
          id: itemId,
        },

        data,
      });

      await this.recalculateQuotationTotals(tx, quotationId);

      return tx.quotationItem.findUnique({
        where: {
          id: itemId,
        },
      });
    });
  }

  async deleteAndRecalculate(itemId: string, quotationId: string) {
    return prisma.$transaction(async (tx) => {
      await tx.quotationItem.delete({
        where: {
          id: itemId,
        },
      });

      await this.recalculateQuotationTotals(tx, quotationId);
    });
  }

  async isQuotationLocked(id: string) {
    const quotation = await this.findQuotationById(id);

    if (!quotation) {
      return false;
    }

    const lockedStatuses: QuotationStatus[] = [
      QuotationStatus.SENT,
      QuotationStatus.ACCEPTED,
      QuotationStatus.REJECTED,
      QuotationStatus.EXPIRED,
    ];

    return lockedStatuses.includes(quotation.status);
  }

  private async recalculateQuotationTotals(
    tx: Prisma.TransactionClient,
    quotationId: string,
  ) {
    const quotation = await tx.quotation.findUnique({
      where: {
        id: quotationId,
      },

      include: {
        items: true,
      },
    });

    if (!quotation) {
      throw new Error("Quotation not found.");
    }

    const subtotal = quotation.items.reduce(
      (sum, item) => sum + Number(item.totalPrice),
      0,
    );

    const discount = Number(quotation.discount);

    const tax = Number(quotation.tax);

    const totalAmount = subtotal - discount + tax;

    if (totalAmount < 0) {
      throw new Error("Quotation total amount cannot be negative.");
    }

    return tx.quotation.update({
      where: {
        id: quotationId,
      },

      data: {
        subtotal,
        totalAmount,
      },
    });
  }
}
