import prisma from "../../lib/prisma";
import { InvoiceStatus, Prisma } from "@prisma/client";

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

        items: true,
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

        items: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });
  }

  async findByQuotationId(quotationId: string) {
    return prisma.invoice.findUnique({
      where: {
        quotationId,
      },
    });
  }

  async findQuotationForInvoice(id: string) {
    const quotation = await prisma.quotation.findUnique({
      where: {
        id,
      },

      include: {
        items: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });

    if (!quotation) {
      return null;
    }

    return {
      ...quotation,

      totalAmount: Number(quotation.totalAmount),
    };
  }

  async createFromQuotation(
    quotationId: string,
    data: {
      invoiceNumber: string;
      issueDate: Date;
      dueDate: Date;
      notes?: string;
    },
  ) {
    return prisma.$transaction(async (tx) => {
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

      const invoice = await tx.invoice.create({
        data: {
          invoiceNumber: data.invoiceNumber,

          issueDate: data.issueDate,

          dueDate: data.dueDate,

          status: InvoiceStatus.DRAFT,

          subtotal: quotation.subtotal,

          discount: quotation.discount,

          tax: quotation.tax,

          totalAmount: quotation.totalAmount,

          amountPaid: 0,

          balanceDue: quotation.totalAmount,

          ...(data.notes !== undefined && {
            notes: data.notes,
          }),

          quotation: {
            connect: {
              id: quotationId,
            },
          },
        },
      });

      if (quotation.items.length > 0) {
        await tx.invoiceItem.createMany({
          data: quotation.items.map((item) => ({
            invoiceId: invoice.id,

            serviceName: item.serviceName,

            description: item.description,

            quantity: item.quantity,

            unitPrice: item.unitPrice,

            totalPrice: item.totalPrice,
          })),
        });
      }

      return tx.invoice.findUnique({
        where: {
          id: invoice.id,
        },

        include: {
          quotation: {
            include: {
              client: true,
              project: true,
            },
          },

          items: {
            orderBy: {
              createdAt: "asc",
            },
          },
        },
      });
    });
  }

  async findAll(
    skip: number,
    limit: number,
    search: string,
    status?: InvoiceStatus,
    quotationId?: string,
    sortBy: string = "createdAt",
    sortOrder: "asc" | "desc" = "desc",
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

    const [invoices, total] = await Promise.all([
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

          items: {
            orderBy: {
              createdAt: "asc",
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

  async update(id: string, data: Prisma.InvoiceUpdateInput) {
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

        items: {
          orderBy: {
            createdAt: "asc",
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

  async send(id: string) {
    return prisma.invoice.update({
      where: {
        id,
      },

      data: {
        status: InvoiceStatus.SENT,
      },

      include: {
        quotation: {
          include: {
            client: true,
            project: true,
          },
        },

        items: {
          orderBy: {
            createdAt: "asc",
          },
        },
      },
    });
  }
}
