import prisma from "../../lib/prisma";
import { Prisma } from "@prisma/client";

export class InvoiceItemRepository {
  async create(data: Prisma.InvoiceItemCreateInput) {
    return prisma.invoiceItem.create({
      data,
    });
  }

  async findById(id: string) {
    return prisma.invoiceItem.findUnique({
      where: {
        id,
      },
    });
  }

  async findAll(invoiceId: string) {
    return prisma.invoiceItem.findMany({
      where: {
        invoiceId,
      },

      orderBy: {
        createdAt: "asc",
      },
    });
  }

  async update(
    id: string,
    data: Prisma.InvoiceItemUpdateInput
  ) {
    return prisma.invoiceItem.update({
      where: {
        id,
      },

      data,
    });
  }

  async delete(id: string) {
    return prisma.invoiceItem.delete({
      where: {
        id,
      },
    });
  }

  async findInvoiceById(id: string) {
    return prisma.invoice.findUnique({
      where: {
        id,
      },
    });
  }

  async calculateSubtotal(invoiceId: string) {
    const result =
      await prisma.invoiceItem.aggregate({
        where: {
          invoiceId,
        },

        _sum: {
          totalPrice: true,
        },
      });

    return Number(
      result._sum.totalPrice ?? 0
    );
  }

  async updateInvoiceTotals(
    invoiceId: string,
    subtotal: number
  ) {
    const invoice =
      await prisma.invoice.findUnique({
        where: {
          id: invoiceId,
        },
      });

    if (!invoice) {
      return null;
    }

    const discount = Number(
      invoice.discount
    );

    const tax = Number(invoice.tax);

    const amountPaid = Number(
      invoice.amountPaid
    );

    const totalAmount =
      subtotal - discount + tax;

    const balanceDue =
      totalAmount - amountPaid;

    return prisma.invoice.update({
      where: {
        id: invoiceId,
      },

      data: {
        subtotal,

        totalAmount,

        balanceDue,
      },
    });
  }
}