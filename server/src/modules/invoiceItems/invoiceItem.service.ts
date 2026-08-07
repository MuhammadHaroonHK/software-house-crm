import { AppError } from "../../utils/AppError";
import {
  CreateInvoiceItemDTO,
  UpdateInvoiceItemDTO,
} from "./invoiceItem.types";
import { InvoiceItemRepository } from "./invoiceItem.repository";
import { InvoiceStatus } from "@prisma/client";

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

    const item =
      await invoiceItemRepository.create({
        serviceName: data.serviceName,

        description: data.description,

        quantity: data.quantity,

        unitPrice: data.unitPrice,

        totalPrice,

        invoice: {
          connect: {
            id: invoiceId,
          },
        },
      });

    const subtotal =
      await invoiceItemRepository.calculateSubtotal(
        invoiceId
      );

    await invoiceItemRepository.updateInvoiceTotals(
      invoiceId,
      subtotal
    );

    return item;
  }

  async findAll(invoiceId: string) {
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
    id: string,
    data: UpdateInvoiceItemDTO
  ) {
    const item =
      await invoiceItemRepository.findById(id);

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
      data.quantity ?? item.quantity;

    const unitPrice =
      data.unitPrice !== undefined
        ? data.unitPrice
        : Number(item.unitPrice);

    const totalPrice =
      quantity * unitPrice;

    const updatedItem =
      await invoiceItemRepository.update(
        id,
        {
          ...(data.serviceName && {
            serviceName:
              data.serviceName,
          }),

          ...(data.description !==
            undefined && {
            description:
              data.description,
          }),

          ...(data.quantity !==
            undefined && {
            quantity: data.quantity,
          }),

          ...(data.unitPrice !==
            undefined && {
            unitPrice:
              data.unitPrice,
          }),

          totalPrice,
        }
      );
          const subtotal =
      await invoiceItemRepository.calculateSubtotal(
        item.invoiceId
      );

    await invoiceItemRepository.updateInvoiceTotals(
      item.invoiceId,
      subtotal
    );

    return updatedItem;
  }

  async delete(id: string) {
    const item =
      await invoiceItemRepository.findById(id);

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

    await invoiceItemRepository.delete(id);

    const subtotal =
      await invoiceItemRepository.calculateSubtotal(
        item.invoiceId
      );

    await invoiceItemRepository.updateInvoiceTotals(
      item.invoiceId,
      subtotal
    );
  }
}