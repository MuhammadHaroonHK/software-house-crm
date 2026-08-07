import {
  Request,
  Response,
  NextFunction,
} from "express";
import { successResponse } from "../../utils/apiResponse";
import { QuotationItemService } from "./quotationItem.service";

const quotationItemService =
  new QuotationItemService();

export class QuotationItemController {
  async create(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const item =
        await quotationItemService.create(
          String(req.params.quotationId),
          req.body
        );

      return successResponse(
        res,
        "Quotation item created successfully.",
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
        await quotationItemService.findAll(
          String(req.params.quotationId)
        );

      return successResponse(
        res,
        "Quotation items fetched successfully.",
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
        await quotationItemService.update(
          String(req.params.itemId),
          req.body
        );

      return successResponse(
        res,
        "Quotation item updated successfully.",
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
      await quotationItemService.delete(
        String(req.params.itemId)
      );

      return successResponse(
        res,
        "Quotation item deleted successfully."
      );
    } catch (error) {
      next(error);
    }
  }
}

export const quotationItemController =
  new QuotationItemController();