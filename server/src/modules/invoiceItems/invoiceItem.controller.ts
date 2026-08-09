import { Request, Response, NextFunction } from "express";
import { InvoiceItemService } from "./invoiceItem.service";
import { successResponse } from "../../utils/apiResponse";

const invoiceItemService = new InvoiceItemService();

export class InvoiceItemController {
  async create(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const item =
        await invoiceItemService.create(
          String(req.params.invoiceId),
          req.body
        );

      return successResponse(
        res,
        "Invoice item created successfully.",
        item,
        201
      );
    } catch (error) {
      next(error);
    }
  }

  async findAll(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const items =
        await invoiceItemService.findAll(
          String(req.params.invoiceId)
        );

      return successResponse(
        res,
        "Invoice items fetched successfully.",
        items
      );
    } catch (error) {
      next(error);
    }
  }

  async update(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const item =
      await invoiceItemService.update(
        String(req.params.itemId),
        req.body
      );

    return successResponse(
      res,
      "Invoice item updated successfully.",
      item
    );
  } catch (error) {
    next(error);
  }
}

  async delete(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    await invoiceItemService.delete(
      String(req.params.itemId)
    );

    return successResponse(
      res,
      "Invoice item deleted successfully."
    );
  } catch (error) {
    next(error);
  }
}
}

export const invoiceItemController =
  new InvoiceItemController();