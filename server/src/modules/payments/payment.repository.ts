import prisma from "../../lib/prisma";
import {
  Prisma,
  PaymentMethod,
  PaymentStatus,
  InvoiceStatus,
} from "@prisma/client";

export class PaymentRepository {
  async create(data: Prisma.PaymentCreateInput) {
    return prisma.payment.create({
      data,

      include: {
        invoice: {
          include: {
            quotation: {
              include: {
                client: true,
                project: true,
              },
            },
          },
        },
      },
    });
  }

  async findById(id: string) {
    return prisma.payment.findUnique({
      where: {
        id,
      },

      include: {
        invoice: {
          include: {
            quotation: {
              include: {
                client: true,
                project: true,
              },
            },
          },
        },

        verifiedBy: {
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
    invoiceId?: string,
    status?: PaymentStatus,
    paymentMethod?: PaymentMethod,
    sortBy: string = "createdAt",
    sortOrder: "asc" | "desc" = "desc"
  ) {
    const where: Prisma.PaymentWhereInput = {
      ...(invoiceId && {
        invoiceId,
      }),

      ...(status && {
        status,
      }),

      ...(paymentMethod && {
        paymentMethod,
      }),
    };

    const [payments, total] =
      await Promise.all([
        prisma.payment.findMany({
          where,

          skip,

          take: limit,

          include: {
            invoice: {
              include: {
                quotation: {
                  include: {
                    client: true,
                    project: true,
                  },
                },
              },
            },

            verifiedBy: {
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

          orderBy: {
            [sortBy]: sortOrder,
          },
        }),

        prisma.payment.count({
          where,
        }),
      ]);

    return {
      payments,
      total,
    };
  }

  async update(
    id: string,
    data: Prisma.PaymentUpdateInput
  ) {
    return prisma.payment.update({
      where: {
        id,
      },

      data,

      include: {
        invoice: {
          include: {
            quotation: {
              include: {
                client: true,
                project: true,
              },
            },
          },
        },

        verifiedBy: {
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
    return prisma.payment.delete({
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

  async getInvoicePaymentsTotal(
    invoiceId: string,
    excludePaymentId?: string
  ) {
    const result =
      await prisma.payment.aggregate({
        where: {
          invoiceId,

          ...(excludePaymentId && {
            id: {
              not: excludePaymentId,
            },
          }),

          status: {
            not: PaymentStatus.FAILED,
          },
        },

        _sum: {
          amount: true,
        },
      });

    return Number(result._sum.amount ?? 0);
  }

  async updateInvoiceFinancials(
    invoiceId: string,
    amountPaid: number,
    balanceDue: number,
    status: InvoiceStatus
  ) {
    return prisma.invoice.update({
      where: {
        id: invoiceId,
      },

      data: {
        amountPaid,
        balanceDue,
        status,
      },
    });
  }
}