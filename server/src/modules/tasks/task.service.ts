import { AppError } from "../../utils/AppError";
import { getPagination } from "../../utils/pagination";
import { TaskRepository } from "./task.repository";
import {
  CreateTaskDTO,
  UpdateTaskDTO,
} from "./task.types";
import {
  TaskPriority,
  TaskStatus,
  UserRole,
} from "@prisma/client";


const taskRepository = new TaskRepository();

export class TaskService {
  async create(data: CreateTaskDTO) {
    // Check project
    const project =
      await taskRepository.findProjectById(
        data.projectId
      );

    if (!project) {
      throw new AppError(
        404,
        "Project not found."
      );
    }

    // Check assigned user
    const user =
      await taskRepository.findUserById(
        data.assignedToId
      );

    if (!user) {
      throw new AppError(
        404,
        "Assigned user not found."
      );
    }

    // Check membership
    const isMember =
      await taskRepository.isProjectMember(
        data.projectId,
        data.assignedToId
      );

    if (!isMember) {
      throw new AppError(
        400,
        "Assigned user is not a member of this project."
      );
    }

    return taskRepository.create({
      title: data.title,

      description: data.description,

      ...(data.priority && {
        priority: data.priority,
      }),

      ...(data.dueDate && {
        dueDate: new Date(data.dueDate),
      }),

      project: {
        connect: {
          id: data.projectId,
        },
      },

      assignedTo: {
        connect: {
          id: data.assignedToId,
        },
      },
    });
  }

  async findAll(query: {
    page?: number;
    limit?: number;
    search?: string;
    projectId?: string;
    assignedToId?: string;
    priority?: TaskPriority;
    status?: TaskStatus;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }) {
    const pagination =
      getPagination(query);

    const { tasks, total } =
      await taskRepository.findAll(
        pagination.skip,
        pagination.limit,
        pagination.search,
        query.projectId,
        query.assignedToId,
        query.priority,
        query.status,
        pagination.sortBy,
        pagination.sortOrder
      );

    return {
      data: tasks,

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

  async findById(id: string) {
    const task =
      await taskRepository.findById(id);

    if (!task) {
      throw new AppError(
        404,
        "Task not found."
      );
    }

    return task;
  }

  async update(
    id: string,
    data: UpdateTaskDTO
  ) {
    const task =
      await taskRepository.findById(id);

    if (!task) {
      throw new AppError(
        404,
        "Task not found."
      );
    }

    let assignedUserData = {};

    if (data.assignedToId) {
      const user =
        await taskRepository.findUserById(
          data.assignedToId
        );

      if (!user) {
        throw new AppError(
          404,
          "Assigned user not found."
        );
      }

      const isMember =
        await taskRepository.isProjectMember(
          task.projectId,
          data.assignedToId
        );

      if (!isMember) {
        throw new AppError(
          400,
          "Assigned user is not a member of this project."
        );
      }

      assignedUserData = {
        assignedTo: {
          connect: {
            id: data.assignedToId,
          },
        },
      };
    }

    return taskRepository.update(id, {
      ...(data.title && {
        title: data.title,
      }),

      ...(data.description !==
        undefined && {
        description:
          data.description,
      }),

      ...(data.priority && {
        priority: data.priority,
      }),

      ...(data.dueDate !==
        undefined && {
        dueDate: data.dueDate
          ? new Date(data.dueDate)
          : null,
      }),

      ...assignedUserData,
    });
  }

  async delete(id: string) {
    const task =
      await taskRepository.findById(id);

    if (!task) {
      throw new AppError(
        404,
        "Task not found."
      );
    }

    await taskRepository.delete(id);
  }

  async updateStatus(
  id: string,
  status: TaskStatus,
  actorRole: UserRole
) {
  const task =
    await taskRepository.findById(id);

  if (!task) {
    throw new AppError(
      404,
      "Task not found."
    );
  }

  const currentStatus =
    task.status;

  if (
    currentStatus ===
    TaskStatus.COMPLETED
  ) {
    throw new AppError(
      400,
      "Completed tasks cannot be modified."
    );
  }

  const isProjectManager =
    actorRole ===
      UserRole.PROJECT_MANAGER ||
    actorRole ===
      UserRole.SUPER_ADMIN;

  // Only managers can complete tasks
  if (
    status === TaskStatus.COMPLETED &&
    !isProjectManager
  ) {
    throw new AppError(
      403,
      "Only project managers can complete tasks."
    );
  }

  const validTransitions: Record<
    TaskStatus,
    TaskStatus[]
  > = {
    [TaskStatus.TODO]: [
      TaskStatus.IN_PROGRESS,
    ],

    [TaskStatus.IN_PROGRESS]: [
      TaskStatus.IN_REVIEW,
    ],

    [TaskStatus.IN_REVIEW]: [
      TaskStatus.COMPLETED,
    ],

    [TaskStatus.COMPLETED]: [],
  };

  const allowedNextStatuses =
    validTransitions[currentStatus];

  if (
    !allowedNextStatuses.includes(status)
  ) {
    throw new AppError(
      400,
      `Task cannot move from ${currentStatus} to ${status}.`
    );
  }

  const completedAt =
    status === TaskStatus.COMPLETED
      ? new Date()
      : null;

  return taskRepository.update(
    id,
    {
      status,
      completedAt,
    }
  );
}
}

export const taskService =
  new TaskService();