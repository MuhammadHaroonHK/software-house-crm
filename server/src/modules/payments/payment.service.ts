import { InvoiceStatus, PaymentStatus } from "@prisma/client";

import { AppError } from "../../utils/AppError";
import { getPagination } from "../../utils/pagination";

import { CreatePaymentDTO, UpdatePaymentDTO } from "./payment.types";

import { PaymentRepository } from "./payment.repository";

const paymentRepository = new PaymentRepository();

export class PaymentService {
  async create(data: CreatePaymentDTO) {
    const invoice = await paymentRepository.findInvoiceById(data.invoiceId);

    if (!invoice) {
      throw new AppError(404, "Invoice not found.");
    }

    // Payments cannot be created for draft invoices.
    if (invoice.status === InvoiceStatus.DRAFT) {
      throw new AppError(
        400,
        "Payment cannot be recorded for a draft invoice.",
      );
    }

    // A fully paid invoice cannot receive another payment.
    if (invoice.status === InvoiceStatus.PAID) {
      throw new AppError(400, "Invoice is already fully paid.");
    }

    if (data.amount <= 0) {
      throw new AppError(400, "Payment amount must be greater than zero.");
    }

    if (data.amount > Number(invoice.balanceDue)) {
      throw new AppError(
        400,
        "Payment amount cannot exceed the invoice balance due.",
      );
    }

    // New payments always require verification.
    const payment = await paymentRepository.create({
      amount: data.amount,

      paymentMethod: data.paymentMethod,

      ...(data.paymentDate && {
        paymentDate: new Date(data.paymentDate),
      }),

      ...(data.accountTitle !== undefined && {
        accountTitle: data.accountTitle,
      }),

      ...(data.accountNumber !== undefined && {
        accountNumber: data.accountNumber,
      }),

      ...(data.receiptImage !== undefined && {
        receiptImage: data.receiptImage,
      }),

      ...(data.referenceNumber !== undefined && {
        referenceNumber: data.referenceNumber,
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

    // IMPORTANT:
    // Pending payments are not included in amountPaid.
    // Invoice financials change only after verification.

    return paymentRepository.findById(payment.id);
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
    const pagination = getPagination(query);

    const paymentMethod = query.paymentMethod as
      | import("@prisma/client").PaymentMethod
      | undefined;

    const { payments, total } = await paymentRepository.findAll(
      pagination.skip,
      pagination.limit,
      query.invoiceId,
      query.status,
      paymentMethod,
      pagination.sortBy,
      pagination.sortOrder,
    );

    return {
      data: payments,

      meta: {
        page: pagination.page,
        limit: pagination.limit,
        total,

        totalPages: Math.ceil(total / pagination.limit),
      },
    };
  }

  async findById(id: string) {
    const payment = await paymentRepository.findById(id);

    if (!payment) {
      throw new AppError(404, "Payment not found.");
    }

    return payment;
  }

  async update(id: string, data: UpdatePaymentDTO) {
    const payment = await paymentRepository.findById(id);

    if (!payment) {
      throw new AppError(404, "Payment not found.");
    }

    // Completed payments are financial records
    // and should not be edited.
    if (payment.status === PaymentStatus.COMPLETED) {
      throw new AppError(400, "Completed payment cannot be modified.");
    }

    if (payment.status === PaymentStatus.REFUNDED) {
      throw new AppError(400, "Refunded payment cannot be modified.");
    }

    const invoice = await paymentRepository.findInvoiceById(payment.invoiceId);

    if (!invoice) {
      throw new AppError(404, "Invoice not found.");
    }

    const amount = data.amount ?? Number(payment.amount);

    if (amount <= 0) {
      throw new AppError(400, "Payment amount must be greater than zero.");
    }

    const completedPayments = await paymentRepository.getInvoicePaymentsTotal(
      payment.invoiceId,
    );

    const remainingBalance = Number(invoice.totalAmount) - completedPayments;

    if (amount > remainingBalance) {
      throw new AppError(
        400,
        "Payment amount cannot exceed the remaining invoice balance.",
      );
    }

    await paymentRepository.update(id, {
      ...(data.amount !== undefined && {
        amount: data.amount,
      }),

      ...(data.paymentMethod !== undefined && {
        paymentMethod: data.paymentMethod,
      }),

      ...(data.paymentDate !== undefined && {
        paymentDate:
          data.paymentDate === null ? null : new Date(data.paymentDate),
      }),

      ...(data.accountTitle !== undefined && {
        accountTitle: data.accountTitle,
      }),

      ...(data.accountNumber !== undefined && {
        accountNumber: data.accountNumber,
      }),

      ...(data.receiptImage !== undefined && {
        receiptImage: data.receiptImage,
      }),

      ...(data.referenceNumber !== undefined && {
        referenceNumber: data.referenceNumber,
      }),

      ...(data.notes !== undefined && {
        notes: data.notes,
      }),
    });

    /*
     * Updating a PENDING/FAILED payment does not
     * affect invoice financials because only
     * COMPLETED payments are counted.
     */

    const updatedPayment = await paymentRepository.findById(id);

    if (!updatedPayment) {
      throw new AppError(404, "Payment not found after update.");
    }

    return updatedPayment;
  }

  async delete(id: string) {
    const payment = await paymentRepository.findById(id);

    if (!payment) {
      throw new AppError(404, "Payment not found.");
    }

    if (payment.status === PaymentStatus.COMPLETED) {
      throw new AppError(400, "Completed payment cannot be deleted.");
    }

    if (payment.status === PaymentStatus.REFUNDED) {
      throw new AppError(400, "Refunded payment cannot be deleted.");
    }

    await paymentRepository.delete(id);
  }

  async getReceiverDetails() {
    const company = await paymentRepository.getReceiverDetails();

    if (!company) {
      throw new AppError(404, "Company payment details not configured.");
    }

    return company;
  }

  async verify(id: string, verifiedById: string) {
    const payment = await paymentRepository.findById(id);

    if (!payment) {
      throw new AppError(404, "Payment not found.");
    }

    if (payment.status === PaymentStatus.COMPLETED) {
      throw new AppError(400, "Payment is already completed.");
    }

    if (payment.status === PaymentStatus.REFUNDED) {
      throw new AppError(400, "Refunded payment cannot be completed.");
    }

    if (payment.status === PaymentStatus.FAILED) {
      throw new AppError(400, "Failed payment cannot be completed.");
    }

    const invoice = await paymentRepository.findInvoiceById(payment.invoiceId);

    if (!invoice) {
      throw new AppError(404, "Invoice not found.");
    }

    const completedPayments = await paymentRepository.getInvoicePaymentsTotal(
      payment.invoiceId,
      payment.id,
    );

    const totalAfterPayment = completedPayments + Number(payment.amount);

    if (totalAfterPayment > Number(invoice.totalAmount)) {
      throw new AppError(
        400,
        "Payment cannot be completed because it would overpay the invoice.",
      );
    }

    const amountPaid = totalAfterPayment;

    const balanceDue = Math.max(Number(invoice.totalAmount) - amountPaid, 0);

    let status: InvoiceStatus;

    if (amountPaid >= Number(invoice.totalAmount)) {
      status = InvoiceStatus.PAID;
    } else {
      status = InvoiceStatus.PARTIALLY_PAID;
    }

    const completedPayment =
      await paymentRepository.completePaymentAndUpdateInvoice(
        payment.id,
        payment.invoiceId,
        verifiedById,
        amountPaid,
        balanceDue,
        status,
      );

    if (!completedPayment) {
      throw new AppError(404, "Payment not found after verification.");
    }

    return completedPayment;
  }

  async reject(id: string) {
    const payment = await paymentRepository.findById(id);

    if (!payment) {
      throw new AppError(404, "Payment not found.");
    }

    if (payment.status === PaymentStatus.COMPLETED) {
      throw new AppError(400, "Completed payment cannot be marked as failed.");
    }

    if (payment.status === PaymentStatus.REFUNDED) {
      throw new AppError(400, "Refunded payment cannot be marked as failed.");
    }

    if (payment.status === PaymentStatus.FAILED) {
      throw new AppError(400, "Payment is already marked as failed.");
    }

    await paymentRepository.update(id, {
      status: PaymentStatus.FAILED,
    });

    const updatedPayment = await paymentRepository.findById(id);

    if (!updatedPayment) {
      throw new AppError(404, "Payment not found after rejection.");
    }

    return updatedPayment;
  }
}

export const paymentService = new PaymentService();
