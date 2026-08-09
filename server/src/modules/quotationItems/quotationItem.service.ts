import { AppError } from "../../utils/AppError";
import {
  CreateQuotationItemDTO,
  UpdateQuotationItemDTO,
} from "./quotationItem.types";
import { QuotationItemRepository } from "./quotationItem.repository";
import { QuotationStatus } from "@prisma/client";

const quotationItemRepository =
  new QuotationItemRepository();

export class QuotationItemService {
  async create(
    quotationId: string,
    data: CreateQuotationItemDTO
  ) {
    const quotation =
  await quotationItemRepository.findQuotationById(
    quotationId
  );

if (!quotation) {
  throw new AppError(
    404,
    "Quotation not found."
  );
}

const lockedStatuses: QuotationStatus[] = [
  QuotationStatus.SENT,
  QuotationStatus.ACCEPTED,
  QuotationStatus.REJECTED,
  QuotationStatus.EXPIRED,
];

if (lockedStatuses.includes(quotation.status)) {
  throw new AppError(
    400,
    "This quotation can no longer be modified."
  );
}

    const totalPrice =
      data.quantity * data.unitPrice;

    const item =
      await quotationItemRepository.create({
        serviceName: data.serviceName,

        ...(data.description && {
          description: data.description,
        }),

        quantity: data.quantity,

        unitPrice: data.unitPrice,

        totalPrice,

        quotation: {
          connect: {
            id: quotationId,
          },
        },
      });

    await quotationItemRepository.updateQuotationTotals(
      quotationId
    );

    return item;
  }

  async findAll(quotationId: string) {
    const quotation =
      await quotationItemRepository.findQuotationById(
        quotationId
      );

    if (!quotation) {
      throw new AppError(
        404,
        "Quotation not found."
      );
    }

    return quotationItemRepository.findItemsByQuotationId(
      quotationId
    );
  }

  async update(
    itemId: string,
    data: UpdateQuotationItemDTO
  ) {
    const item =
      await quotationItemRepository.findById(
        itemId
      );

    if (!item) {
      throw new AppError(
        404,
        "Quotation item not found."
      );
    }

    const locked =
      await quotationItemRepository.isQuotationLocked(
        item.quotationId
      );

    if (locked) {
      throw new AppError(
        400,
        "This quotation can no longer be modified."
      );
    }

    const quantity =
      data.quantity ?? item.quantity;

    const unitPrice =
      data.unitPrice ??
      Number(item.unitPrice);

    const totalPrice =
      quantity * unitPrice;
          await quotationItemRepository.update(
      itemId,
      {
        ...(data.serviceName && {
          serviceName: data.serviceName,
        }),

        ...(data.description !== undefined && {
          description: data.description,
        }),

        quantity,

        unitPrice,

        totalPrice,
      }
    );

    await quotationItemRepository.updateQuotationTotals(
      item.quotationId
    );

    return quotationItemRepository.findById(
      itemId
    );
  }

  async delete(itemId: string) {
    const item =
      await quotationItemRepository.findById(
        itemId
      );

    if (!item) {
      throw new AppError(
        404,
        "Quotation item not found."
      );
    }

    const locked =
      await quotationItemRepository.isQuotationLocked(
        item.quotationId
      );

    if (locked) {
      throw new AppError(
        400,
        "This quotation can no longer be modified."
      );
    }

    await quotationItemRepository.delete(
      itemId
    );

    await quotationItemRepository.updateQuotationTotals(
      item.quotationId
    );
  }
}