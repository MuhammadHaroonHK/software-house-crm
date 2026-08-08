import {
  NotificationType,
  UserRole,
} from "@prisma/client";

import { AppError } from "../../utils/AppError";
import { getPagination } from "../../utils/pagination";

import {
  CreateNotificationDTO,
  UpdateNotificationDTO,
} from "./notification.types";

import { NotificationRepository } from "./notification.repository";

const notificationRepository =
  new NotificationRepository();

export class NotificationService {
  async create(
    data: CreateNotificationDTO
  ) {
    const user =
      await notificationRepository.findUserById(
        data.userId
      );

    if (!user) {
      throw new AppError(
        404,
        "User not found."
      );
    }

    return notificationRepository.create({
      title: data.title,
      message: data.message,
      type: data.type,

      user: {
        connect: {
          id: data.userId,
        },
      },
    });
  }

  async findAll(
    query: {
      page?: number;
      limit?: number;
      search?: string;
      userId?: string;
      type?: NotificationType;
      isRead?: boolean;
      sortBy?: string;
      sortOrder?: "asc" | "desc";
    },
    currentUser: {
      userId: string;
      role: UserRole;
    }
  ) {
    const pagination =
      getPagination(query);

    let notificationUserId =
      query.userId;

    /*
     * EMPLOYEE and CLIENT can only
     * access their own notifications.
     */
    if (
      currentUser.role ===
        UserRole.EMPLOYEE ||
      currentUser.role === UserRole.CLIENT
    ) {
      notificationUserId =
        currentUser.userId;
    }

    /*
     * SUPER_ADMIN and PROJECT_MANAGER
     * can use the userId filter.
     */
    if (
      notificationUserId
    ) {
      const user =
        await notificationRepository.findUserById(
          notificationUserId
        );

      if (!user) {
        throw new AppError(
          404,
          "User not found."
        );
      }
    }

    const {
      notifications,
      total,
    } =
      await notificationRepository.findAll(
        pagination.skip,
        pagination.limit,
        pagination.search,
        notificationUserId,
        query.type,
        query.isRead,
        pagination.sortBy,
        pagination.sortOrder
      );

    return {
      data: notifications,

      meta: {
        page: pagination.page,
        limit: pagination.limit,
        total,
        totalPages: Math.ceil(
          total / pagination.limit
        ),
      },
    };
  }

  async findById(
    id: string,
    currentUser: {
      userId: string;
      role: UserRole;
    }
  ) {
    const notification =
      await notificationRepository.findById(
        id
      );

    if (!notification) {
      throw new AppError(
        404,
        "Notification not found."
      );
    }

    /*
     * EMPLOYEE and CLIENT can only
     * access their own notification.
     */
    if (
      currentUser.role ===
        UserRole.EMPLOYEE ||
      currentUser.role === UserRole.CLIENT
    ) {
      if (
        notification.userId !==
        currentUser.userId
      ) {
        throw new AppError(
          403,
          "You are not allowed to access this notification."
        );
      }
    }

    return notification;
  }

  async update(
    id: string,
    data: UpdateNotificationDTO
  ) {
    const notification =
      await notificationRepository.findById(
        id
      );

    if (!notification) {
      throw new AppError(
        404,
        "Notification not found."
      );
    }

    let readAt:
      | Date
      | null
      | undefined;

    if (data.isRead === true) {
      readAt = notification.readAt
        ? notification.readAt
        : new Date();
    }

    if (data.isRead === false) {
      readAt = null;
    }

    return notificationRepository.update(
      id,
      {
        ...(data.title !==
          undefined && {
          title: data.title,
        }),

        ...(data.message !==
          undefined && {
          message: data.message,
        }),

        ...(data.type !==
          undefined && {
          type: data.type,
        }),

        ...(data.isRead !==
          undefined && {
          isRead: data.isRead,
        }),

        ...(readAt !==
          undefined && {
          readAt,
        }),
      }
    );
  }

  async markAsRead(
    id: string,
    currentUser: {
      userId: string;
      role: UserRole;
    }
  ) {
    const notification =
      await notificationRepository.findById(
        id
      );

    if (!notification) {
      throw new AppError(
        404,
        "Notification not found."
      );
    }

    /*
     * EMPLOYEE and CLIENT can only
     * mark their own notification as read.
     */
    if (
      currentUser.role ===
        UserRole.EMPLOYEE ||
      currentUser.role === UserRole.CLIENT
    ) {
      if (
        notification.userId !==
        currentUser.userId
      ) {
        throw new AppError(
          403,
          "You are not allowed to modify this notification."
        );
      }
    }

    if (notification.isRead) {
      return notification;
    }

    return notificationRepository.update(
      id,
      {
        isRead: true,
        readAt: new Date(),
      }
    );
  }

  async markAllAsRead(
    userId: string,
    currentUser: {
      userId: string;
      role: UserRole;
    }
  ) {
    /*
     * EMPLOYEE and CLIENT can only
     * mark their own notifications as read.
     */
    if (
      currentUser.role ===
        UserRole.EMPLOYEE ||
      currentUser.role === UserRole.CLIENT
    ) {
      userId = currentUser.userId;
    }

    const user =
      await notificationRepository.findUserById(
        userId
      );

    if (!user) {
      throw new AppError(
        404,
        "User not found."
      );
    }

    const result =
      await notificationRepository.markAllAsRead(
        userId
      );

    return {
      updatedCount: result.count,
    };
  }

  async delete(id: string) {
    const notification =
      await notificationRepository.findById(
        id
      );

    if (!notification) {
      throw new AppError(
        404,
        "Notification not found."
      );
    }

    await notificationRepository.delete(id);
  }
}