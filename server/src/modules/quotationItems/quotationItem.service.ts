import { QuotationStatus } from "@prisma/client";
import { AppError } from "../../utils/AppError";
import {
  CreateQuotationItemDTO,
  UpdateQuotationItemDTO,
} from "./quotationItem.types";
import { QuotationItemRepository } from "./quotationItem.repository";

const quotationItemRepository = new QuotationItemRepository();

export class QuotationItemService {
  async create(quotationId: string, data: CreateQuotationItemDTO) {
    const quotation =
      await quotationItemRepository.findQuotationById(quotationId);

    if (!quotation) {
      throw new AppError(404, "Quotation not found.");
    }

    // Only draft quotations can have items added.
    if (quotation.status !== QuotationStatus.DRAFT) {
      throw new AppError(400, "Only draft quotations can be modified.");
    }

    const totalPrice = data.quantity * data.unitPrice;

    return quotationItemRepository.createAndRecalculate(quotationId, {
      serviceName: data.serviceName,

      ...(data.description !== undefined && {
        description: data.description,
      }),

      quantity: data.quantity,
      unitPrice: data.unitPrice,
      totalPrice,
    });
  }

  async findAll(quotationId: string) {
    const quotation =
      await quotationItemRepository.findQuotationById(quotationId);

    if (!quotation) {
      throw new AppError(404, "Quotation not found.");
    }

    return quotationItemRepository.findItemsByQuotationId(quotationId);
  }

  async update(itemId: string, data: UpdateQuotationItemDTO) {
    const item = await quotationItemRepository.findById(itemId);

    if (!item) {
      throw new AppError(404, "Quotation item not found.");
    }

    const quotation = await quotationItemRepository.findQuotationById(
      item.quotationId,
    );

    if (!quotation) {
      throw new AppError(404, "Quotation not found.");
    }

    // Only draft quotations can have items updated.
    if (quotation.status !== QuotationStatus.DRAFT) {
      throw new AppError(400, "Only draft quotations can be modified.");
    }

    const quantity = data.quantity ?? item.quantity;

    const unitPrice = data.unitPrice ?? Number(item.unitPrice);

    const totalPrice = quantity * unitPrice;

    return quotationItemRepository.updateAndRecalculate(
      itemId,
      item.quotationId,
      {
        ...(data.serviceName !== undefined && {
          serviceName: data.serviceName,
        }),

        ...(data.description !== undefined && {
          description: data.description,
        }),

        quantity,
        unitPrice,
        totalPrice,
      },
    );
  }

  async delete(itemId: string) {
    const item = await quotationItemRepository.findById(itemId);

    if (!item) {
      throw new AppError(404, "Quotation item not found.");
    }

    const quotation = await quotationItemRepository.findQuotationById(
      item.quotationId,
    );

    if (!quotation) {
      throw new AppError(404, "Quotation not found.");
    }

    // Only draft quotations can have items deleted.
    if (quotation.status !== QuotationStatus.DRAFT) {
      throw new AppError(400, "Only draft quotations can be modified.");
    }

    await quotationItemRepository.deleteAndRecalculate(
      itemId,
      item.quotationId,
    );
  }
}

export const quotationItemService = new QuotationItemService();
