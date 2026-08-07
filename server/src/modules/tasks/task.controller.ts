import { Request, Response, NextFunction } from "express";
import { TaskService } from "./task.service";
import { successResponse } from "../../utils/apiResponse";
import {
  TaskPriority,
  TaskStatus,
} from "@prisma/client";

const taskService = new TaskService();

export class TaskController {
  async create(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const task =
        await taskService.create(req.body);

      return successResponse(
        res,
        "Task created successfully.",
        task,
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
        await taskService.findAll({
          page: req.query.page
            ? Number(req.query.page)
            : undefined,

          limit: req.query.limit
            ? Number(req.query.limit)
            : undefined,

          search:
            req.query.search as string,

          projectId:
            req.query.projectId as string,

          assignedToId:
            req.query.assignedToId as string,

          priority:
            req.query.priority as TaskPriority,

          status:
            req.query.status as TaskStatus,

          sortBy:
            req.query.sortBy as string,

          sortOrder:
            req.query.sortOrder as
              | "asc"
              | "desc",
        });

      return successResponse(
        res,
        "Tasks fetched successfully.",
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

      const task =
        await taskService.findById(id);

      return successResponse(
        res,
        "Task fetched successfully.",
        task
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

      const task =
        await taskService.update(
          id,
          req.body
        );

      return successResponse(
        res,
        "Task updated successfully.",
        task
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

      await taskService.delete(id);

      return successResponse(
        res,
        "Task deleted successfully."
      );
    } catch (error) {
      next(error);
    }
  }
}

export const taskController =
  new TaskController();