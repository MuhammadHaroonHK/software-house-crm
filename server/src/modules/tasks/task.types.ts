import {
  TaskPriority,
} from "@prisma/client";

export interface CreateTaskDTO {
  projectId: string;
  assignedToId: string;

  title: string;
  description?: string;

  priority?: TaskPriority;
  dueDate?: string;
}

export interface UpdateTaskDTO {
  assignedToId?: string;

  title?: string;
  description?: string;

  priority?: TaskPriority;

  dueDate?: string | null;
}