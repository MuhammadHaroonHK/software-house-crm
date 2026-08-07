import {
  Request,
  Response,
  NextFunction,
} from "express";
import { QuotationStatus } from "@prisma/client";
import { successResponse } from "../../utils/apiResponse";
import { QuotationService } from "./quotation.service";

const quotationService = new QuotationService();

export class QuotationController {
  async create(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const quotation =
        await quotationService.create(req.body);

      return successResponse(
        res,
        "Quotation created successfully.",
        quotation,
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
      const result =
        await quotationService.findAll({
          page: req.query.page
            ? Number(req.query.page)
            : undefined,

          limit: req.query.limit
            ? Number(req.query.limit)
            : undefined,

          search: req.query.search as string,

          clientId: req.query.clientId as string,

          projectId: req.query.projectId as string,

          status:
            req.query.status as QuotationStatus,

          sortBy: req.query.sortBy as string,

          sortOrder: req.query
            .sortOrder as "asc" | "desc",
        });

      return successResponse(
        res,
        "Quotations fetched successfully.",
        result.data,
        200,
        result.meta
      );
    } catch (error) {
      next(error);
    }
  }

  async findById(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const quotation =
        await quotationService.findById(
          String(req.params.id)
        );

      return successResponse(
        res,
        "Quotation fetched successfully.",
        quotation
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
      const quotation =
        await quotationService.update(
          String(req.params.id),
          req.body
        );

      return successResponse(
        res,
        "Quotation updated successfully.",
        quotation
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
      await quotationService.delete(
        String(req.params.id)
      );

      return successResponse(
        res,
        "Quotation deleted successfully."
      );
    } catch (error) {
      next(error);
    }
  }
}

export const quotationController =
  new QuotationController();