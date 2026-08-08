import { NotificationType } from "@prisma/client";

export interface CreateNotificationDTO {
  userId: string;
  title: string;
  message: string;
  type: NotificationType;
}

export interface UpdateNotificationDTO {
  title?: string;
  message?: string;
  type?: NotificationType;
  isRead?: boolean;
}

export interface NotificationQuery {
  page?: number;
  limit?: number;
  userId?: string;
  type?: NotificationType;
  isRead?: boolean;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}