import { Request, Response, NextFunction } from "express";
import { departmentService } from "./department.service";
import { successResponse } from "../../utils/apiResponse";

export class DepartmentController {
  async create(req: Request, res: Response, next: NextFunction) {
    try {
      const { name, description } = req.body;

      const department = await departmentService.create(name, description);

      return successResponse(
        res,
        "Department created successfully.",
        department,
        201,
      );
    } catch (error) {
      next(error);
    }
  }

  async findAll(req: Request, res: Response, next: NextFunction) {
    try {
      const result = await departmentService.findAll({
        page: req.query.page ? Number(req.query.page) : undefined,
        limit: req.query.limit ? Number(req.query.limit) : undefined,
        search: req.query.search as string,
        sortBy: req.query.sortBy as string,
        sortOrder: req.query.sortOrder as "asc" | "desc",
      });

      return res.status(200).json({
        success: true,
        message: "Departments fetched successfully.",
        data: result.data,
        meta: result.meta,
      });
    } catch (error) {
      next(error);
    }
  }

  async findById(req: Request, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);

      const department = await departmentService.findById(id);

      return successResponse(
        res,
        "Department fetched successfully.",
        department,
      );
    } catch (error) {
      next(error);
    }
  }

  async update(req: Request, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);

      const department = await departmentService.update(id, req.body);

      return successResponse(
        res,
        "Department updated successfully.",
        department,
      );
    } catch (error) {
      next(error);
    }
  }

  async delete(req: Request, res: Response, next: NextFunction) {
    try {
      const id = String(req.params.id);

      await departmentService.delete(id);

      return successResponse(res, "Department deleted successfully.");
    } catch (error) {
      next(error);
    }
  }
}

export const departmentController = new DepartmentController();
