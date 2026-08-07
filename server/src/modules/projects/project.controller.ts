import { Request, Response, NextFunction } from "express";
import { ProjectService } from "./project.service";
import { successResponse } from "../../utils/apiResponse";
import { ProjectStatus } from "@prisma/client";

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

  async findAll(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const result = await projectService.findAll({
      page: req.query.page
        ? Number(req.query.page)
        : undefined,

      limit: req.query.limit
        ? Number(req.query.limit)
        : undefined,

      search: req.query.search as string,

      status: req.query.status as ProjectStatus,

      clientId: req.query.clientId as string,

      managerId: req.query.managerId as string,

      sortBy: req.query.sortBy as string,

      sortOrder: req.query.sortOrder as
        | "asc"
        | "desc",
    });

    return successResponse(
      res,
      "Projects fetched successfully.",
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

    const project =
      await projectService.findById(id);

    return successResponse(
      res,
      "Project fetched successfully.",
      project
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

    const project =
      await projectService.update(
        id,
        req.body
      );

    return successResponse(
      res,
      "Project updated successfully.",
      project
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

    await projectService.delete(id);

    return successResponse(
      res,
      "Project deleted successfully."
    );
  } catch (error) {
    next(error);
  }
}
}

export const projectController = new ProjectController();