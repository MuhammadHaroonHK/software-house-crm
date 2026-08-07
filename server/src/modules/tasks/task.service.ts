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

      ...(data.status && {
        status: data.status,
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

    let completedAtData = {};

    if (data.status) {
      if (
        data.status ===
        TaskStatus.COMPLETED
      ) {
        completedAtData = {
          completedAt: new Date(),
        };
      } else {
        completedAtData = {
          completedAt: null,
        };
      }
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

      ...(data.status && {
        status: data.status,
      }),

      ...(data.dueDate !==
        undefined && {
        dueDate: data.dueDate
          ? new Date(data.dueDate)
          : null,
      }),

      ...assignedUserData,

      ...completedAtData,
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
}

export const taskService =
  new TaskService();