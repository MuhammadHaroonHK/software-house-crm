import { Request, Response, NextFunction } from "express";

import { successResponse } from "../../utils/apiResponse";

import cloudinary from "../../lib/cloudinary";

import { PaymentService } from "./payment.service";

const paymentService = new PaymentService();

export class PaymentController {
  /* ------------------------------------------------------------------------ */
  /* Create                                                                   */
  /* ------------------------------------------------------------------------ */

  async create(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new Error("Authenticated user not found.");
      }

      let receiptImage: string | undefined;

      /* -------------------------------------------------------------------- */
      /* Upload receipt to Cloudinary                                         */
      /* -------------------------------------------------------------------- */

      if (req.file) {
        receiptImage = await uploadReceiptToCloudinary(req.file.buffer);
      }

      /* -------------------------------------------------------------------- */
      /* Create payment                                                       */
      /* -------------------------------------------------------------------- */

      const payment = await paymentService.create(
        {
          ...req.body,

          receiptImage,
        },

        req.user.userId,

        req.user.role,
      );

      return successResponse(
        res,
        "Payment created successfully.",
        payment,
        201,
      );
    } catch (error) {
      next(error);
    }
  }

  /* ------------------------------------------------------------------------ */
  /* Find All                                                                 */
  /* ------------------------------------------------------------------------ */

  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new Error("Authenticated user not found.");
      }

      const payments = await paymentService.findAll(
        req.query as any,

        req.user.userId,

        req.user.role,
      );

      return successResponse(
        res,
        "Payments fetched successfully.",
        payments.data,
        200,
        payments.meta,
      );
    } catch (error) {
      next(error);
    }
  }

  /* ------------------------------------------------------------------------ */
  /* Find By ID                                                               */
  /* ------------------------------------------------------------------------ */

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new Error("Authenticated user not found.");
      }

      const payment = await paymentService.findById(
        String(req.params.id),

        req.user.userId,

        req.user.role,
      );

      return successResponse(res, "Payment fetched successfully.", payment);
    } catch (error) {
      next(error);
    }
  }

  /* ------------------------------------------------------------------------ */
  /* Update                                                                   */
  /* ------------------------------------------------------------------------ */

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const payment = await paymentService.update(
        String(req.params.id),

        req.body,
      );

      return successResponse(res, "Payment updated successfully.", payment);
    } catch (error) {
      next(error);
    }
  }

  /* ------------------------------------------------------------------------ */
  /* Delete                                                                   */
  /* ------------------------------------------------------------------------ */

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      await paymentService.delete(String(req.params.id));

      return successResponse(res, "Payment deleted successfully.");
    } catch (error) {
      next(error);
    }
  }

  /* ------------------------------------------------------------------------ */
  /* Receiver Details                                                         */
  /* ------------------------------------------------------------------------ */

  async getReceiverDetails(req: Request, res: Response, next: NextFunction) {
    try {
      const details = await paymentService.getReceiverDetails();

      return successResponse(
        res,
        "Payment receiver details fetched successfully.",
        details,
      );
    } catch (error) {
      next(error);
    }
  }

  /* ------------------------------------------------------------------------ */
  /* Verify                                                                   */
  /* ------------------------------------------------------------------------ */

  async verify(req: Request, res: Response, next: NextFunction) {
    try {
      if (!req.user) {
        throw new Error("Authenticated user not found.");
      }

      const payment = await paymentService.verify(
        String(req.params.id),

        req.user.userId,
      );

      return successResponse(res, "Payment verified successfully.", payment);
    } catch (error) {
      next(error);
    }
  }

  /* ------------------------------------------------------------------------ */
  /* Reject                                                                   */
  /* ------------------------------------------------------------------------ */

  async reject(req: Request, res: Response, next: NextFunction) {
    try {
      const payment = await paymentService.reject(String(req.params.id));

      return successResponse(res, "Payment rejected successfully.", payment);
    } catch (error) {
      next(error);
    }
  }
}

/* -------------------------------------------------------------------------- */
/* Cloudinary Upload                                                          */
/* -------------------------------------------------------------------------- */

function uploadReceiptToCloudinary(buffer: Buffer): Promise<string> {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      {
        folder: "software-house-crm/payments",

        resource_type: "image",

        type: "upload",

        use_filename: false,
      },

      (error, result) => {
        if (error) {
          reject(error);
          return;
        }

        if (!result?.secure_url) {
          reject(new Error("Cloudinary upload did not return a secure URL."));

          return;
        }

        resolve(result.secure_url);
      },
    );

    uploadStream.end(buffer);
  });
}

export const paymentController = new PaymentController();
