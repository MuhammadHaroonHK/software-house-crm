import { Request, Response, NextFunction } from "express";
import { successResponse } from "../../utils/apiResponse";
import { contactPersonService } from "./contactPerson.service";

export class ContactPersonController {
  async create(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const contact = await contactPersonService.create(
        req.body
      );

      return successResponse(
        res,
        "Contact person created successfully.",
        contact,
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
        await contactPersonService.findAll({
          page: req.query.page
            ? Number(req.query.page)
            : undefined,
          limit: req.query.limit
            ? Number(req.query.limit)
            : undefined,
          search: req.query.search as string,
          clientId: req.query.clientId as string,
          sortBy: req.query.sortBy as string,
          sortOrder: req.query.sortOrder as
            | "asc"
            | "desc",
        });

      return successResponse(
        res,
        "Contact persons fetched successfully.",
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
        const id = String(req.params.id);
      const contact =
        await contactPersonService.findById(id);

      return successResponse(
        res,
        "Contact person fetched successfully.",
        contact
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
        const id = String(req.params.id);
      const contact =
        await contactPersonService.update(
          id,
          req.body
        );

      return successResponse(
        res,
        "Contact person updated successfully.",
        contact
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
        const id = String(req.params.id);
      await contactPersonService.delete(id);

      return successResponse(
        res,
        "Contact person deleted successfully."
      );
    } catch (error) {
      next(error);
    }
  }
}

export const contactPersonController =
  new ContactPersonController();