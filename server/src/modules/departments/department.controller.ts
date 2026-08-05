import { Request, Response, NextFunction } from "express";
import { departmentService } from "./department.service";
import { successResponse } from "../../utils/apiResponse";

export class DepartmentController {
  async create(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const { name, description } = req.body;

      const department = await departmentService.create(
        name,
        description
      );

      return successResponse(
        res,
        "Department created successfully.",
        department,
        201
      );
    } catch (error) {
      next(error);
    }
  }
}

export const departmentController = new DepartmentController();