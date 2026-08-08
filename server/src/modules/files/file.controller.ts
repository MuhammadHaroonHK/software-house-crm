import {
  Request,
  Response,
  NextFunction,
} from "express";
import { FileService } from "./file.service";
import { successResponse } from "../../utils/apiResponse";

const fileService = new FileService();

export class FileController {
  async create(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const file =
        await fileService.create({
          ...req.body,
          uploadedById:
            req.user?.userId ??
            req.body.uploadedById,
        });

      return successResponse(
        res,
        "File created successfully.",
        file,
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
      const files =
        await fileService.findAll(
          req.query as {
            page?: number;
            limit?: number;
            search?: string;
            uploadedById?: string;
            module?: any;
            referenceId?: string;
            fileType?: any;
            sortBy?: string;
            sortOrder?: "asc" | "desc";
          }
        );

      return successResponse(
        res,
        "Files fetched successfully.",
        files.data,
        200,
        files.meta
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
      const file =
        await fileService.findById(
          String(req.params.id)
        );

      return successResponse(
        res,
        "File fetched successfully.",
        file
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
      const file =
        await fileService.update(
          String(req.params.id),
          req.body
        );

      return successResponse(
        res,
        "File updated successfully.",
        file
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
      await fileService.delete(
        String(req.params.id)
      );

      return successResponse(
        res,
        "File deleted successfully."
      );
    } catch (error) {
      next(error);
    }
  }
}

export const fileController =
  new FileController();