import { InvoiceStatus } from "@prisma/client";
import { AppError } from "../../utils/AppError";

import {
  CreateInvoiceItemDTO,
  UpdateInvoiceItemDTO,
} from "./invoiceItem.types";

import { InvoiceItemRepository } from "./invoiceItem.repository";

const invoiceItemRepository =
  new InvoiceItemRepository();

export class InvoiceItemService {
  async create(
    invoiceId: string,
    data: CreateInvoiceItemDTO
  ) {
    const invoice =
      await invoiceItemRepository.findInvoiceById(
        invoiceId
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

    const totalPrice =
      data.quantity * data.unitPrice;

    return invoiceItemRepository.createAndRecalculate(
      invoiceId,
      {
        serviceName:
          data.serviceName,

        ...(data.description !==
          undefined && {
          description:
            data.description,
        }),

        quantity:
          data.quantity,

        unitPrice:
          data.unitPrice,

        totalPrice,
      }
    );
  }

  async findAll(
    invoiceId: string
  ) {
    const invoice =
      await invoiceItemRepository.findInvoiceById(
        invoiceId
      );

    if (!invoice) {
      throw new AppError(
        404,
        "Invoice not found."
      );
    }

    return invoiceItemRepository.findAll(
      invoiceId
    );
  }

  async update(
    itemId: string,
    data: UpdateInvoiceItemDTO
  ) {
    const item =
      await invoiceItemRepository.findById(
        itemId
      );

    if (!item) {
      throw new AppError(
        404,
        "Invoice item not found."
      );
    }

    const invoice =
      await invoiceItemRepository.findInvoiceById(
        item.invoiceId
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

    const quantity =
      data.quantity ??
      item.quantity;

    const unitPrice =
      data.unitPrice !== undefined
        ? data.unitPrice
        : Number(item.unitPrice);

    const totalPrice =
      quantity * unitPrice;

    return invoiceItemRepository.updateAndRecalculate(
      itemId,
      item.invoiceId,
      {
        ...(data.serviceName !==
          undefined && {
          serviceName:
            data.serviceName,
        }),

        ...(data.description !==
          undefined && {
          description:
            data.description,
        }),

        quantity,

        unitPrice,

        totalPrice,
      }
    );
  }

  async delete(
    itemId: string
  ) {
    const item =
      await invoiceItemRepository.findById(
        itemId
      );

    if (!item) {
      throw new AppError(
        404,
        "Invoice item not found."
      );
    }

    const invoice =
      await invoiceItemRepository.findInvoiceById(
        item.invoiceId
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

    await invoiceItemRepository.deleteAndRecalculate(
      itemId,
      item.invoiceId
    );
  }
}

export const invoiceItemService =
  new InvoiceItemService();