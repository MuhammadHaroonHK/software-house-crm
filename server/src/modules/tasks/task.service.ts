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
  UserStatus,
  ProjectStatus,
} from "@prisma/client";

const taskRepository =
  new TaskRepository();

export class TaskService {
  private ensureProjectManager(
    projectManagerId: string,
    actorId: string,
    actorRole: UserRole
  ) {
    if (actorRole === UserRole.SUPER_ADMIN) {
      return;
    }

    if (
      actorRole !== UserRole.PROJECT_MANAGER ||
      projectManagerId !== actorId
    ) {
      throw new AppError(
        403,
        "Only the project manager can manage this task."
      );
    }
  }

  private ensureProjectActive(
    status: ProjectStatus
  ) {
    if (
      status === ProjectStatus.COMPLETED ||
      status === ProjectStatus.CANCELLED
    ) {
      throw new AppError(
        400,
        "Tasks cannot be modified for a completed or cancelled project."
      );
    }
  }

  private ensureEmployee(
    user: {
      status: UserStatus;
      role: {
        name: UserRole;
      };
    }
  ) {
    if (user.status !== UserStatus.ACTIVE) {
      throw new AppError(
        400,
        "Inactive users cannot be assigned tasks."
      );
    }

    if (
      user.role.name !== UserRole.EMPLOYEE
    ) {
      throw new AppError(
        400,
        "Only employees can be assigned tasks."
      );
    }
  }

  async create(
    data: CreateTaskDTO,
    actorId: string,
    actorRole: UserRole
  ) {
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

    this.ensureProjectActive(
      project.status
    );

    this.ensureProjectManager(
      project.managerId,
      actorId,
      actorRole
    );

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

    this.ensureEmployee(user);

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

  actorId: string;
  actorRole: UserRole;
}) {
  const pagination =
    getPagination(query);

  /*
   * Employees can only see their own
   * assigned tasks.
   */
  let assignedToId =
    query.assignedToId;

  if (
    query.actorRole ===
    UserRole.EMPLOYEE
  ) {
    assignedToId =
      query.actorId;
  }

  /*
   * Project Managers can only see tasks
   * belonging to projects they manage.
   *
   * This restriction is passed to the
   * repository so filtering happens before
   * pagination.
   */
  let managerId:
    | string
    | undefined;

  if (
    query.actorRole ===
    UserRole.PROJECT_MANAGER
  ) {
    managerId =
      query.actorId;
  }

  const {
    tasks,
    total,
  } =
    await taskRepository.findAll(
      pagination.skip,
      pagination.limit,
      pagination.search,
      query.projectId,
      assignedToId,
      query.priority,
      query.status,
      managerId,
      pagination.sortBy,
      pagination.sortOrder
    );

  return {
    data: tasks,

    meta: {
      page: pagination.page,
      limit: pagination.limit,
      total,

      totalPages:
        Math.ceil(
          total /
            pagination.limit
        ),
    },
  };
}

  async findById(
    id: string,
    actorId: string,
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

    if (
      actorRole === UserRole.SUPER_ADMIN
    ) {
      return task;
    }

    if (
      actorRole ===
      UserRole.PROJECT_MANAGER
    ) {
      if (
        task.project.managerId !==
        actorId
      ) {
        throw new AppError(
          403,
          "You do not have access to this task."
        );
      }

      return task;
    }

    if (
      actorRole === UserRole.EMPLOYEE
    ) {
      if (
        task.assignedTo.id !== actorId
      ) {
        throw new AppError(
          403,
          "You do not have access to this task."
        );
      }

      return task;
    }

    throw new AppError(
      403,
      "You do not have access to this task."
    );
  }

  async update(
    id: string,
    data: UpdateTaskDTO,
    actorId: string,
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

    if (
      task.status ===
      TaskStatus.COMPLETED
    ) {
      throw new AppError(
        400,
        "Completed tasks cannot be modified."
      );
    }

    this.ensureProjectActive(
      task.project.status
    );

    this.ensureProjectManager(
      task.project.managerId,
      actorId,
      actorRole
    );

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

      this.ensureEmployee(user);

      const isMember =
        await taskRepository.isProjectMember(
          task.project.id,
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

    return taskRepository.update(
      id,
      {
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
      }
    );
  }

  async delete(
    id: string,
    actorId: string,
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

    if (
      task.status ===
      TaskStatus.COMPLETED
    ) {
      throw new AppError(
        400,
        "Completed tasks cannot be deleted."
      );
    }

    this.ensureProjectActive(
      task.project.status
    );

    this.ensureProjectManager(
      task.project.managerId,
      actorId,
      actorRole
    );

    await taskRepository.delete(id);
  }

  async updateStatus(
    id: string,
    status: TaskStatus,
    actorId: string,
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

    if (
      task.status ===
      TaskStatus.COMPLETED
    ) {
      throw new AppError(
        400,
        "Completed tasks cannot be modified."
      );
    }

    this.ensureProjectActive(
      task.project.status
    );

    /*
     * PROJECT MANAGER / SUPER ADMIN
     * --------------------------------
     * Manager can approve/complete tasks.
     */
    if (
      actorRole ===
        UserRole.PROJECT_MANAGER ||
      actorRole === UserRole.SUPER_ADMIN
    ) {
      this.ensureProjectManager(
        task.project.managerId,
        actorId,
        actorRole
      );

      if (
        status !==
        TaskStatus.COMPLETED
      ) {
        throw new AppError(
          403,
          "Project managers can only complete tasks after review."
        );
      }

      if (
        task.status !==
        TaskStatus.IN_REVIEW
      ) {
        throw new AppError(
          400,
          "Only tasks in review can be completed."
        );
      }

      return taskRepository.update(
        id,
        {
          status:
            TaskStatus.COMPLETED,

          completedAt: new Date(),
        }
      );
    }

    /*
     * EMPLOYEE
     * --------------------------------
     * Employee can only update their own
     * assigned task.
     */
    if (
      actorRole === UserRole.EMPLOYEE
    ) {
      if (
        task.assignedTo.id !== actorId
      ) {
        throw new AppError(
          403,
          "You can only update your own assigned tasks."
        );
      }

      if (
        status ===
          TaskStatus.IN_PROGRESS &&
        task.status === TaskStatus.TODO
      ) {
        return taskRepository.update(
          id,
          {
            status:
              TaskStatus.IN_PROGRESS,
          }
        );
      }

      if (
        status ===
          TaskStatus.IN_REVIEW &&
        task.status ===
          TaskStatus.IN_PROGRESS
      ) {
        return taskRepository.update(
          id,
          {
            status:
              TaskStatus.IN_REVIEW,
          }
        );
      }

      throw new AppError(
        400,
        `Task cannot move from ${task.status} to ${status}.`
      );
    }

    throw new AppError(
      403,
      "You are not allowed to update task status."
    );
  }
}

export const taskService =
  new TaskService();