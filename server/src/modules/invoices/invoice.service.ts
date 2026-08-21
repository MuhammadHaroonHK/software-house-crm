import {
  InvoiceStatus,
  QuotationStatus,
  UserRole,
} from "@prisma/client";

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
  private async getClientIdForUser(
    userId: string
  ) {
    return invoiceRepository.findClientIdByUserId(
      userId
    );
  }

  private async ensureInvoiceAccess(
    invoice: {
      quotation: {
        clientId: string;
      };
    },
    actorId: string,
    actorRole: UserRole
  ) {
    if (actorRole !== UserRole.CLIENT) {
      return;
    }

    const clientId =
      await this.getClientIdForUser(actorId);

    if (!clientId) {
      throw new AppError(
        403,
        "Your account is not linked to a client."
      );
    }

    if (
      invoice.quotation.clientId !==
      clientId
    ) {
      throw new AppError(
        403,
        "You do not have access to this invoice."
      );
    }
  }

  async create(
    data: CreateInvoiceDTO
  ) {
    const quotation =
      await invoiceRepository.findQuotationForInvoice(
        data.quotationId
      );

    if (!quotation) {
      throw new AppError(
        404,
        "Quotation not found."
      );
    }

    if (
      quotation.status !==
      QuotationStatus.ACCEPTED
    ) {
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
        409,
        "Invoice already exists for this quotation."
      );
    }

    if (quotation.items.length === 0) {
      throw new AppError(
        400,
        "Cannot create an invoice from a quotation without items."
      );
    }

    if (quotation.totalAmount <= 0) {
      throw new AppError(
        400,
        "Cannot create an invoice with a zero or negative total amount."
      );
    }

    return invoiceRepository.createFromQuotation(
      data.quotationId,
      {
        invoiceNumber:
          data.invoiceNumber,

        issueDate:
          new Date(data.issueDate),

        dueDate:
          new Date(data.dueDate),

        notes:
          data.notes,
      }
    );
  }

  async findAll(
    query: {
      page?: number;
      limit?: number;
      search?: string;
      status?: InvoiceStatus;
      quotationId?: string;
      sortBy?: string;
      sortOrder?: "asc" | "desc";
    },
    actorId?: string,
    actorRole?: UserRole
  ) {
    const pagination =
      getPagination(query);

    let clientId:
      | string
      | undefined;

    if (
      actorRole === UserRole.CLIENT
    ) {
      if (!actorId) {
        throw new AppError(
          401,
          "Authenticated user not found."
        );
      }

      clientId =
  (await this.getClientIdForUser(
    actorId
  )) ?? undefined;

      if (!clientId) {
        throw new AppError(
          403,
          "Your account is not linked to a client."
        );
      }
    }

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
        clientId,
        pagination.sortBy,
        pagination.sortOrder
      );

    return {
      data: invoices,

      meta: {
        page:
          pagination.page,

        limit:
          pagination.limit,

        total,

        totalPages:
          Math.ceil(
            total /
              pagination.limit
          ),
      },
    };
  }

  async findById(
    id: string,
    actorId?: string,
    actorRole?: UserRole
  ) {
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

    if (
      actorId &&
      actorRole
    ) {
      await this.ensureInvoiceAccess(
        invoice,
        actorId,
        actorRole
      );
    }

    return invoice;
  }

  async update(
    id: string,
    data: UpdateInvoiceDTO
  ) {
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

    if (
      invoice.status !==
      InvoiceStatus.DRAFT
    ) {
      throw new AppError(
        400,
        "Only draft invoices can be modified."
      );
    }

    const dueDate =
      data.dueDate
        ? new Date(
            data.dueDate
          )
        : invoice.dueDate;

    if (
      dueDate <
      invoice.issueDate
    ) {
      throw new AppError(
        400,
        "Due date must be after issue date."
      );
    }

    return invoiceRepository.update(
      id,
      {
        ...(data.dueDate && {
          dueDate,
        }),

        ...(data.notes !==
          undefined && {
          notes:
            data.notes,
        }),
      }
    );
  }

  async delete(
    id: string
  ) {
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

    if (
      invoice.status !==
      InvoiceStatus.DRAFT
    ) {
      throw new AppError(
        400,
        "Only draft invoices can be deleted."
      );
    }

    await invoiceRepository.delete(
      id
    );
  }

  async send(
    id: string
  ) {
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

    if (
      invoice.status !==
      InvoiceStatus.DRAFT
    ) {
      throw new AppError(
        400,
        "Only draft invoices can be sent."
      );
    }

    return invoiceRepository.send(
      id
    );
  }
}

export const invoiceService =
  new InvoiceService();