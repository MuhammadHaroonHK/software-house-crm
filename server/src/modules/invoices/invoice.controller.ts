import {
  Request,
  Response,
  NextFunction,
} from "express";

import { InvoiceStatus } from "@prisma/client";

import { successResponse } from "../../utils/apiResponse";
import { InvoiceService } from "./invoice.service";

const invoiceService = new InvoiceService();

export class InvoiceController {
  async create(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const invoice =
        await invoiceService.create(req.body);

      return successResponse(
        res,
        "Invoice created successfully.",
        invoice,
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
        await invoiceService.findAll({
          page: req.query.page
            ? Number(req.query.page)
            : undefined,

          limit: req.query.limit
            ? Number(req.query.limit)
            : undefined,

          search: req.query.search as string,

          quotationId:
            req.query.quotationId as string,

          status:
            req.query.status as InvoiceStatus,

          sortBy:
            req.query.sortBy as string,

          sortOrder:
            req.query.sortOrder as
              | "asc"
              | "desc",
        });

      return successResponse(
        res,
        "Invoices fetched successfully.",
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
      const invoice =
        await invoiceService.findById(
          String(req.params.id)
        );

      return successResponse(
        res,
        "Invoice fetched successfully.",
        invoice
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
      const invoice =
        await invoiceService.update(
          String(req.params.id),
          req.body
        );

      return successResponse(
        res,
        "Invoice updated successfully.",
        invoice
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
      await invoiceService.delete(
        String(req.params.id)
      );

      return successResponse(
        res,
        "Invoice deleted successfully."
      );
    } catch (error) {
      next(error);
    }
  }
}

export const invoiceController =
  new InvoiceController();