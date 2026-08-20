import {
  Request,
  Response,
  NextFunction,
} from "express";

import {
  QuotationStatus,
} from "@prisma/client";

import { successResponse } from "../../utils/apiResponse";

import {
  QuotationService,
} from "./quotation.service";

const quotationService =
  new QuotationService();

export class QuotationController {
  /* ------------------------------------------------------------------------ */
  /* Authenticated User                                                       */
  /* ------------------------------------------------------------------------ */

  private getAuthenticatedUser(
    req: Request
  ) {
    if (!req.user) {
      throw new Error(
        "Authenticated user not found."
      );
    }

    return req.user;
  }

  /* ------------------------------------------------------------------------ */
  /* Create                                                                   */
  /* ------------------------------------------------------------------------ */

  async create(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const user =
        this.getAuthenticatedUser(
          req
        );

      quotationService.ensureInternalQuotationUser(
        user.role
      );

      const quotation =
        await quotationService.create(
          req.body
        );

      return successResponse(
        res,
        "Quotation created successfully.",
        quotation,
        201
      );
    } catch (
      error
    ) {
      next(error);
    }
  }

  /* ------------------------------------------------------------------------ */
  /* Find All                                                                 */
  /* ------------------------------------------------------------------------ */

  async findAll(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const user =
        this.getAuthenticatedUser(
          req
        );

      const result =
        await quotationService.findAll(
          {
            page:
              req.query.page
                ? Number(
                    req.query.page
                  )
                : undefined,

            limit:
              req.query.limit
                ? Number(
                    req.query.limit
                  )
                : undefined,

            search:
              req.query.search as string,

            clientId:
              req.query.clientId as string,

            projectId:
              req.query.projectId as string,

            status:
              req.query.status as QuotationStatus,

            sortBy:
              req.query.sortBy as string,

            sortOrder:
              req.query.sortOrder as
                | "asc"
                | "desc",
          },

          user.userId,

          user.role
        );

      return successResponse(
        res,
        "Quotations fetched successfully.",
        result.data,
        200,
        result.meta
      );
    } catch (
      error
    ) {
      next(error);
    }
  }

  /* ------------------------------------------------------------------------ */
  /* Find By ID                                                               */
  /* ------------------------------------------------------------------------ */

  async findById(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const user =
        this.getAuthenticatedUser(
          req
        );

      const quotation =
        await quotationService.findById(
          String(
            req.params.id
          ),
          user.userId,
          user.role
        );

      return successResponse(
        res,
        "Quotation fetched successfully.",
        quotation
      );
    } catch (
      error
    ) {
      next(error);
    }
  }

  /* ------------------------------------------------------------------------ */
  /* Update                                                                   */
  /* ------------------------------------------------------------------------ */

  async update(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const user =
        this.getAuthenticatedUser(
          req
        );

      quotationService.ensureInternalQuotationUser(
        user.role
      );

      const quotation =
        await quotationService.update(
          String(
            req.params.id
          ),
          req.body
        );

      return successResponse(
        res,
        "Quotation updated successfully.",
        quotation
      );
    } catch (
      error
    ) {
      next(error);
    }
  }

  /* ------------------------------------------------------------------------ */
  /* Send                                                                     */
  /* ------------------------------------------------------------------------ */

  async send(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const user =
        this.getAuthenticatedUser(
          req
        );

      quotationService.ensureInternalQuotationUser(
        user.role
      );

      const quotation =
        await quotationService.send(
          String(
            req.params.id
          )
        );

      return successResponse(
        res,
        "Quotation sent successfully.",
        quotation
      );
    } catch (
      error
    ) {
      next(error);
    }
  }

  /* ------------------------------------------------------------------------ */
  /* Accept                                                                   */
  /* ------------------------------------------------------------------------ */

  async accept(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const user =
        this.getAuthenticatedUser(
          req
        );

      const quotation =
        await quotationService.accept(
          String(
            req.params.id
          ),
          user.userId,
          user.role
        );

      return successResponse(
        res,
        "Quotation accepted successfully.",
        quotation
      );
    } catch (
      error
    ) {
      next(error);
    }
  }

  /* ------------------------------------------------------------------------ */
  /* Reject                                                                   */
  /* ------------------------------------------------------------------------ */

  async reject(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const user =
        this.getAuthenticatedUser(
          req
        );

      const quotation =
        await quotationService.reject(
          String(
            req.params.id
          ),
          user.userId,
          user.role
        );

      return successResponse(
        res,
        "Quotation rejected successfully.",
        quotation
      );
    } catch (
      error
    ) {
      next(error);
    }
  }

  /* ------------------------------------------------------------------------ */
  /* Expire                                                                   */
  /* ------------------------------------------------------------------------ */

  async expire(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const user =
        this.getAuthenticatedUser(
          req
        );

      quotationService.ensureInternalQuotationUser(
        user.role
      );

      const quotation =
        await quotationService.expire(
          String(
            req.params.id
          )
        );

      return successResponse(
        res,
        "Quotation expired successfully.",
        quotation
      );
    } catch (
      error
    ) {
      next(error);
    }
  }

  /* ------------------------------------------------------------------------ */
  /* Delete                                                                   */
  /* ------------------------------------------------------------------------ */

  async delete(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const user =
        this.getAuthenticatedUser(
          req
        );

      quotationService.ensureInternalQuotationUser(
        user.role
      );

      await quotationService.delete(
        String(
          req.params.id
        )
      );

      return successResponse(
        res,
        "Quotation deleted successfully."
      );
    } catch (
      error
    ) {
      next(error);
    }
  }
}

export const quotationController =
  new QuotationController();