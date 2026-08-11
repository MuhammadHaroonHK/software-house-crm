import {
  Request,
  Response,
  NextFunction,
} from "express";
import { successResponse } from "../../utils/apiResponse";
import { MeetingService } from "./meeting.service";
import { MeetingStatus } from "@prisma/client";

const meetingService =
  new MeetingService();

export class MeetingController {
  async create(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      if (!req.user) {
        throw new Error(
          "Authenticated user not found."
        );
      }

      const meeting =
        await meetingService.create(
          req.body,
          req.user.userId,
          req.user.role
        );

      return successResponse(
        res,
        "Meeting created successfully.",
        meeting,
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
      if (!req.user) {
        throw new Error(
          "Authenticated user not found."
        );
      }

      const result =
        await meetingService.findAll(
          {
            page: req.query.page
              ? Number(req.query.page)
              : undefined,

            limit: req.query.limit
              ? Number(req.query.limit)
              : undefined,

            search:
              req.query.search as string,

            status:
              req.query.status as MeetingStatus,

            projectId:
              req.query.projectId as string,

            organizerId:
              req.query.organizerId as string,

            sortBy:
              req.query.sortBy as string,

            sortOrder:
              req.query.sortOrder as
                | "asc"
                | "desc",
          },
          req.user.userId,
          req.user.role
        );

      return successResponse(
        res,
        "Meetings fetched successfully.",
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
      if (!req.user) {
        throw new Error(
          "Authenticated user not found."
        );
      }

      const meeting =
        await meetingService.findById(
          String(req.params.id),
          req.user.userId,
          req.user.role
        );

      return successResponse(
        res,
        "Meeting fetched successfully.",
        meeting
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
      if (!req.user) {
        throw new Error(
          "Authenticated user not found."
        );
      }

      const meeting =
        await meetingService.update(
          String(req.params.id),
          req.body,
          req.user.userId,
          req.user.role
        );

      return successResponse(
        res,
        "Meeting updated successfully.",
        meeting
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
      if (!req.user) {
        throw new Error(
          "Authenticated user not found."
        );
      }

      await meetingService.delete(
        String(req.params.id),
        req.user.userId,
        req.user.role
      );

      return successResponse(
        res,
        "Meeting deleted successfully."
      );
    } catch (error) {
      next(error);
    }
  }
}

export const meetingController =
  new MeetingController();