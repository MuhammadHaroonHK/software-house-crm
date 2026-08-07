import { Request, Response, NextFunction } from "express";
import { ProjectService } from "./project.service";
import { successResponse } from "../../utils/apiResponse";

const projectService = new ProjectService();

export class ProjectController {
  async create(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const project = await projectService.create(req.body);

      return successResponse(
        res,
        "Project created successfully.",
        project,
        201
      );
    } catch (error) {
      next(error);
    }
  }
}

export const projectController = new ProjectController();