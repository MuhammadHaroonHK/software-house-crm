import { InvoiceStatus } from "@prisma/client";
import { AppError } from "../../utils/AppError";
import { getPagination } from "../../utils/pagination";

import {
  CreateInvoiceDTO,
  UpdateInvoiceDTO,
} from "./invoice.types";

import { InvoiceRepository } from "./invoice.repository";

const invoiceRepository =
  new InvoiceRepository();

export class InvoiceService {
  async create(
    data: CreateInvoiceDTO
  ) {
    const quotation =
      await invoiceRepository.findQuotationById(
        data.quotationId
      );

    if (!quotation) {
      throw new AppError(
        404,
        "Quotation not found."
      );
    }

    const accepted =
      await invoiceRepository.isQuotationAccepted(
        data.quotationId
      );

    if (!accepted) {
      throw new AppError(
        400,
        "Invoice can only be generated from an accepted quotation."
      );
    }

    const existingInvoice =
      await invoiceRepository.findByQuotationId(
        data.quotationId
      );

    if (existingInvoice) {
      throw new AppError(
        400,
        "Invoice already exists for this quotation."
      );
    }

    return invoiceRepository.create({
      invoiceNumber: data.invoiceNumber,

      issueDate: new Date(
        data.issueDate
      ),

      dueDate: new Date(
        data.dueDate
      ),

      subtotal: quotation.subtotal,

      discount: quotation.discount,

      tax: quotation.tax,

      totalAmount:
        quotation.totalAmount,

      amountPaid: 0,

      balanceDue:
        quotation.totalAmount,

      ...(data.notes && {
        notes: data.notes,
      }),

      ...(data.status && {
        status: data.status,
      }),

      quotation: {
        connect: {
          id: data.quotationId,
        },
      },
    });
  }

  async findAll(query: {
    page?: number;
    limit?: number;
    search?: string;
    status?: InvoiceStatus;
    quotationId?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }) {
    const pagination =
      getPagination(query);

    const {
      invoices,
      total,
    } =
      await invoiceRepository.findAll(
        pagination.skip,
        pagination.limit,
        pagination.search,
        query.status,
        query.quotationId,
        pagination.sortBy,
        pagination.sortOrder
      );

    return {
      data: invoices,

      meta: {
        page: pagination.page,

        limit: pagination.limit,

        total,

        totalPages: Math.ceil(
          total /
            pagination.limit
        ),
      },
    };
  }

  async findById(id: string) {
    const invoice =
      await invoiceRepository.findById(
        id
      );

    if (!invoice) {
      throw new AppError(
        404,
        "Invoice not found."
      );
    }

    return invoice;
  }
    async update(
    id: string,
    data: UpdateInvoiceDTO
  ) {
    const invoice =
      await invoiceRepository.findById(id);

    if (!invoice) {
      throw new AppError(
        404,
        "Invoice not found."
      );
    }

    return invoiceRepository.update(id, {
      ...(data.dueDate && {
        dueDate: new Date(data.dueDate),
      }),

      ...(data.status && {
        status: data.status,
      }),

      ...(data.notes !== undefined && {
        notes: data.notes,
      }),
    });
  }

  async delete(id: string) {
    const invoice =
      await invoiceRepository.findById(id);

    if (!invoice) {
      throw new AppError(
        404,
        "Invoice not found."
      );
    }

    if (
      invoice.status !==
      InvoiceStatus.DRAFT
    ) {
      throw new AppError(
        400,
        "Only draft invoices can be deleted."
      );
    }

    await invoiceRepository.delete(id);
  }
}