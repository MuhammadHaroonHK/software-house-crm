import { Request, Response, NextFunction } from "express";
import { clientService } from "./client.service";
import { successResponse } from "../../utils/apiResponse";
import { toClientResponse } from "./client.mapper";

export class ClientController {
  async create(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const client = await clientService.create(req.body);

      return successResponse(
        res,
        "Client created successfully.",
        toClientResponse(client),
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
      const result = await clientService.findAll({
        page: req.query.page
          ? Number(req.query.page)
          : undefined,

        limit: req.query.limit
          ? Number(req.query.limit)
          : undefined,

        search: req.query.search as string,

        sortBy: req.query.sortBy as string,

        sortOrder: req.query.sortOrder as
          | "asc"
          | "desc",
      });

      return successResponse(
        res,
        "Clients fetched successfully.",
        result.data.map(toClientResponse),
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
      const client = await clientService.findById(
        String(req.params.id)
      );

      return successResponse(
        res,
        "Client fetched successfully.",
        toClientResponse(client)
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
      const client = await clientService.update(
        String(req.params.id),
        req.body
      );

      return successResponse(
        res,
        "Client updated successfully.",
        toClientResponse(client)
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
      await clientService.delete(
        String(req.params.id)
      );

      return successResponse(
        res,
        "Client deleted successfully."
      );
    } catch (error) {
      next(error);
    }
  }
}

export const clientController =
  new ClientController();