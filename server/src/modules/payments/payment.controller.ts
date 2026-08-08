import {
  Request,
  Response,
  NextFunction,
} from "express";

import { PaymentService } from "./payment.service";
import { successResponse } from "../../utils/apiResponse";

const paymentService =
  new PaymentService();

export class PaymentController {
  async create(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const payment =
        await paymentService.create(
          req.body
        );

      return successResponse(
        res,
        "Payment created successfully.",
        payment,
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
      const payments =
        await paymentService.findAll(
          req.query as any
        );

      return successResponse(
        res,
        "Payments fetched successfully.",
        payments.data,
        200,
        payments.meta
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
      const payment =
        await paymentService.findById(
          String(req.params.id)
        );

      return successResponse(
        res,
        "Payment fetched successfully.",
        payment
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
      const payment =
        await paymentService.update(
          String(req.params.id),
          req.body
        );

      return successResponse(
        res,
        "Payment updated successfully.",
        payment
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
      await paymentService.delete(
        String(req.params.id)
      );

      return successResponse(
        res,
        "Payment deleted successfully."
      );
    } catch (error) {
      next(error);
    }
  }
}

export const paymentController =
  new PaymentController();