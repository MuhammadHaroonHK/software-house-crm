import {
  TaskPriority,
  TaskStatus,
} from "@prisma/client";

export interface CreateTaskDTO {
  projectId: string;
  assignedToId: string;

  title: string;
  description?: string;

  priority?: TaskPriority;
  status?: TaskStatus;

  dueDate?: string;
}

export interface UpdateTaskDTO {
  assignedToId?: string;

  title?: string;
  description?: string;

  priority?: TaskPriority;
  status?: TaskStatus;

  dueDate?: string | null;
}