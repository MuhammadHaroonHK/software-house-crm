import {
  Request,
  Response,
  NextFunction,
} from "express";

import { NotificationType } from "@prisma/client";

import { NotificationService } from "./notification.service";
import { successResponse } from "../../utils/apiResponse";

const notificationService =
  new NotificationService();

export class NotificationController {

    private getCurrentUser(req: Request) {
  if (!req.user) {
    throw new Error("Authenticated user not found.");
  }

  return req.user;
}
  async create(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const notification =
        await notificationService.create(
          req.body
        );

      return successResponse(
        res,
        "Notification created successfully.",
        notification,
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
      const {
        page,
        limit,
        search,
        userId,
        type,
        isRead,
        sortBy,
        sortOrder,
      } = req.query;

      const result =
        await notificationService.findAll(
          {
            page: page
              ? Number(page)
              : undefined,

            limit: limit
              ? Number(limit)
              : undefined,

            search: search
              ? String(search)
              : undefined,

            userId: userId
              ? String(userId)
              : undefined,

            type: type
              ? (String(
                  type
                ) as NotificationType)
              : undefined,

            isRead:
              isRead !== undefined
                ? String(isRead) ===
                  "true"
                : undefined,

            sortBy: sortBy
              ? String(sortBy)
              : undefined,

            sortOrder:
              sortOrder === "asc" ||
              sortOrder === "desc"
                ? sortOrder
                : undefined,
          },

          this.getCurrentUser(req)
        );

      return successResponse(
        res,
        "Notifications fetched successfully.",
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
      const notification =
        await notificationService.findById(
          String(req.params.id),
          this.getCurrentUser(req)
        );

      return successResponse(
        res,
        "Notification fetched successfully.",
        notification
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
      const notification =
        await notificationService.update(
          String(req.params.id),
          req.body
        );

      return successResponse(
        res,
        "Notification updated successfully.",
        notification
      );
    } catch (error) {
      next(error);
    }
  }

  async markAsRead(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const notification =
        await notificationService.markAsRead(
          String(req.params.id),
          this.getCurrentUser(req)
        );

      return successResponse(
        res,
        "Notification marked as read successfully.",
        notification
      );
    } catch (error) {
      next(error);
    }
  }

  async markAllAsRead(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const result =
        await notificationService.markAllAsRead(
          String(req.params.userId),
          this.getCurrentUser(req)
        );

      return successResponse(
        res,
        "All notifications marked as read successfully.",
        result
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
      await notificationService.delete(
        String(req.params.id)
      );

      return successResponse(
        res,
        "Notification deleted successfully."
      );
    } catch (error) {
      next(error);
    }
  }
}

export const notificationController =
  new NotificationController();