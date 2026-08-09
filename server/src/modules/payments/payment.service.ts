import { AppError } from "../../utils/AppError";
import { getPagination } from "../../utils/pagination";
import {
  InvoiceStatus,
  PaymentStatus,
} from "@prisma/client";
import {
  CreatePaymentDTO,
  UpdatePaymentDTO,
} from "./payment.types";
import { PaymentRepository } from "./payment.repository";

const paymentRepository =
  new PaymentRepository();

export class PaymentService {
  async create(data: CreatePaymentDTO) {
    const invoice =
      await paymentRepository.findInvoiceById(
        data.invoiceId
      );

    if (!invoice) {
      throw new AppError(
        404,
        "Invoice not found."
      );
    }

    if (
      invoice.status ===
      InvoiceStatus.PAID
    ) {
      throw new AppError(
        400,
        "Invoice is already fully paid."
      );
    }

    if (data.amount <= 0) {
      throw new AppError(
        400,
        "Payment amount must be greater than zero."
      );
    }

    if (
      data.amount >
      Number(invoice.balanceDue)
    ) {
      throw new AppError(
        400,
        "Payment amount cannot exceed the invoice balance due."
      );
    }

    const payment =
      await paymentRepository.create({
        amount: data.amount,

        paymentMethod:
          data.paymentMethod,

        ...(data.paymentDate && {
          paymentDate:
            new Date(data.paymentDate),
        }),

        ...(data.accountTitle !== undefined && {
          accountTitle:
            data.accountTitle,
        }),

        ...(data.accountNumber !== undefined && {
          accountNumber:
            data.accountNumber,
        }),

        ...(data.receiptImage !== undefined && {
          receiptImage:
            data.receiptImage,
        }),

        ...(data.referenceNumber !== undefined && {
          referenceNumber:
            data.referenceNumber,
        }),

        status: PaymentStatus.PENDING,

        ...(data.notes !== undefined && {
          notes: data.notes,
        }),

        invoice: {
          connect: {
            id: data.invoiceId,
          },
        },
      });

    await this.recalculateInvoice(
      data.invoiceId
    );

    return paymentRepository.findById(
      payment.id
    );
  }

  async findAll(query: {
    page?: number;
    limit?: number;
    invoiceId?: string;
    status?: PaymentStatus;
    paymentMethod?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }) {
    const pagination =
      getPagination(query);

    const paymentMethod =
      query.paymentMethod as
        | import("@prisma/client").PaymentMethod
        | undefined;

    const {
      payments,
      total,
    } =
      await paymentRepository.findAll(
        pagination.skip,
        pagination.limit,
        query.invoiceId,
        query.status,
        paymentMethod,
        pagination.sortBy,
        pagination.sortOrder
      );

    return {
      data: payments,

      meta: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages: Math.ceil(
          total / pagination.limit
        ),
      },
    };
  }

  async findById(id: string) {
    const payment =
      await paymentRepository.findById(id);

    if (!payment) {
      throw new AppError(
        404,
        "Payment not found."
      );
    }

    return payment;
  }

  async update(
    id: string,
    data: UpdatePaymentDTO
  ) {
    const payment =
      await paymentRepository.findById(id);

    if (!payment) {
      throw new AppError(
        404,
        "Payment not found."
      );
    }

    const invoice =
      await paymentRepository.findInvoiceById(
        payment.invoiceId
      );

    if (!invoice) {
      throw new AppError(
        404,
        "Invoice not found."
      );
    }

    const amount =
      data.amount ??
      Number(payment.amount);

    if (amount <= 0) {
      throw new AppError(
        400,
        "Payment amount must be greater than zero."
      );
    }

    if (
      data.amount !== undefined
    ) {
      const otherPaymentsTotal =
        await paymentRepository.getInvoicePaymentsTotal(
          payment.invoiceId,
          payment.id
        );

      if (
        otherPaymentsTotal + amount >
        Number(invoice.totalAmount)
      ) {
        throw new AppError(
          400,
          "Payment amount cannot make the invoice overpaid."
        );
      }
    }

    const updatedPayment =
      await paymentRepository.update(
        id,
        {
          ...(data.amount !== undefined && {
            amount: data.amount,
          }),

          ...(data.paymentMethod !==
            undefined && {
            paymentMethod:
              data.paymentMethod,
          }),

          ...(data.paymentDate !==
            undefined && {
            paymentDate:
              data.paymentDate === null
                ? null
                : new Date(
                    data.paymentDate
                  ),
          }),

          ...(data.accountTitle !==
            undefined && {
            accountTitle:
              data.accountTitle,
          }),

          ...(data.accountNumber !==
            undefined && {
            accountNumber:
              data.accountNumber,
          }),

          ...(data.receiptImage !==
            undefined && {
            receiptImage:
              data.receiptImage,
          }),

          ...(data.referenceNumber !==
            undefined && {
            referenceNumber:
              data.referenceNumber,
          }),

          ...(data.status !== undefined && {
            status: data.status,
          }),

          ...(data.notes !== undefined && {
            notes: data.notes,
          }),
        }
      );

    await this.recalculateInvoice(
      payment.invoiceId
    );

    return updatedPayment;
  }

  async delete(id: string) {
    const payment =
      await paymentRepository.findById(id);

    if (!payment) {
      throw new AppError(
        404,
        "Payment not found."
      );
    }

    const invoice =
      await paymentRepository.findInvoiceById(
        payment.invoiceId
      );

    if (!invoice) {
      throw new AppError(
        404,
        "Invoice not found."
      );
    }

    await paymentRepository.delete(id);

    await this.recalculateInvoice(
      payment.invoiceId
    );
  }

  private async recalculateInvoice(
  invoiceId: string
) {
  const invoice =
    await paymentRepository.findInvoiceById(
      invoiceId
    );

  if (!invoice) {
    throw new AppError(
      404,
      "Invoice not found."
    );
  }

  const amountPaid =
    await paymentRepository.getInvoicePaymentsTotal(
      invoiceId
    );

  const totalAmount =
    Number(invoice.totalAmount);

  const balanceDue =
    Math.max(
      totalAmount - amountPaid,
      0
    );

  let status = invoice.status;

  if (amountPaid >= totalAmount) {
    status = InvoiceStatus.PAID;
  } else if (amountPaid > 0) {
    status =
      InvoiceStatus.PARTIALLY_PAID;
  }

  await paymentRepository.updateInvoiceFinancials(
    invoiceId,
    amountPaid,
    balanceDue,
    status
  );
}

async getReceiverDetails() {
  const company =
    await paymentRepository.getReceiverDetails();

  if (!company) {
    throw new AppError(
      404,
      "Company payment details not configured."
    );
  }

  return company;
}
}