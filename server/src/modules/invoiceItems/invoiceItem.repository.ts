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

  async update(id: string, data: Prisma.InvoiceItemUpdateInput) {
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
    const result = await prisma.invoiceItem.aggregate({
      where: {
        invoiceId,
      },

      _sum: {
        totalPrice: true,
      },
    });

    return Number(result._sum.totalPrice ?? 0);
  }

  async updateInvoiceTotals(invoiceId: string, subtotal: number) {
    const invoice = await prisma.invoice.findUnique({
      where: {
        id: invoiceId,
      },
    });

    if (!invoice) {
      return null;
    }

    const discount = Number(invoice.discount);

    const tax = Number(invoice.tax);

    const amountPaid = Number(invoice.amountPaid);

    const totalAmount = subtotal - discount + tax;

    if (totalAmount < 0) {
      throw new Error("Invoice total amount cannot be negative.");
    }

    const balanceDue = totalAmount - amountPaid;

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

  async createAndRecalculate(
    invoiceId: string,
    data: Prisma.InvoiceItemCreateWithoutInvoiceInput,
  ) {
    return prisma.$transaction(async (tx) => {
      const invoice = await tx.invoice.findUnique({
        where: {
          id: invoiceId,
        },
      });

      if (!invoice) {
        throw new Error("Invoice not found.");
      }

      if (invoice.status !== "DRAFT") {
        throw new Error("Only draft invoices can be modified.");
      }

      const item = await tx.invoiceItem.create({
        data: {
          ...data,

          invoice: {
            connect: {
              id: invoiceId,
            },
          },
        },
      });

      await this.recalculateInvoiceTotals(tx, invoiceId);

      return item;
    });
  }

  async updateAndRecalculate(
    itemId: string,
    invoiceId: string,
    data: Prisma.InvoiceItemUpdateInput,
  ) {
    return prisma.$transaction(async (tx) => {
      const invoice = await tx.invoice.findUnique({
        where: {
          id: invoiceId,
        },
      });

      if (!invoice) {
        throw new Error("Invoice not found.");
      }

      if (invoice.status !== "DRAFT") {
        throw new Error("Only draft invoices can be modified.");
      }

      const item = await tx.invoiceItem.findUnique({
        where: {
          id: itemId,
        },
      });

      if (!item) {
        throw new Error("Invoice item not found.");
      }

      const updatedItem = await tx.invoiceItem.update({
        where: {
          id: itemId,
        },

        data,
      });

      await this.recalculateInvoiceTotals(tx, invoiceId);

      return updatedItem;
    });
  }

  async deleteAndRecalculate(itemId: string, invoiceId: string) {
    return prisma.$transaction(async (tx) => {
      const invoice = await tx.invoice.findUnique({
        where: {
          id: invoiceId,
        },
      });

      if (!invoice) {
        throw new Error("Invoice not found.");
      }

      if (invoice.status !== "DRAFT") {
        throw new Error("Only draft invoices can be modified.");
      }

      await tx.invoiceItem.delete({
        where: {
          id: itemId,
        },
      });

      await this.recalculateInvoiceTotals(tx, invoiceId);
    });
  }

  private async recalculateInvoiceTotals(
    tx: Prisma.TransactionClient,
    invoiceId: string,
  ) {
    const invoice = await tx.invoice.findUnique({
      where: {
        id: invoiceId,
      },

      include: {
        items: true,
      },
    });

    if (!invoice) {
      throw new Error("Invoice not found.");
    }

    const subtotal = invoice.items.reduce(
      (sum, item) => sum + Number(item.totalPrice),
      0,
    );

    const discount = Number(invoice.discount);

    const tax = Number(invoice.tax);

    const totalAmount = subtotal - discount + tax;

    if (totalAmount < 0) {
      throw new Error("Invoice total amount cannot be negative.");
    }

    const amountPaid = Number(invoice.amountPaid);

    const balanceDue = totalAmount - amountPaid;

    if (balanceDue < 0) {
      throw new Error("Invoice balance cannot be negative.");
    }

    await tx.invoice.update({
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
