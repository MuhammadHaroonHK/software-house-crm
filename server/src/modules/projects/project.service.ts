import { AppError } from "../../utils/AppError";
import { ProjectRepository } from "./project.repository";
import {
  CreateProjectDTO,
  UpdateProjectDTO,
} from "./project.types";
import {
  ProjectStatus,
  UserRole,
} from "@prisma/client";
import { getPagination } from "../../utils/pagination";

const projectRepository = new ProjectRepository();

export class ProjectService {
  async create(data: CreateProjectDTO) {
    // Check client
    const client =
      await projectRepository.findClientById(
        data.clientId
      );

    if (!client) {
      throw new AppError(
        404,
        "Client not found."
      );
    }

    // Check manager
    const manager =
      await projectRepository.findManagerById(
        data.managerId
      );

    if (!manager) {
      throw new AppError(
        404,
        "Project manager not found."
      );
    }

    // Only PROJECT_MANAGER can be assigned
    const isProjectManager =
      await projectRepository.isProjectManager(
        data.managerId
      );

    if (!isProjectManager) {
      throw new AppError(
        400,
        "Selected user is not a project manager."
      );
    }

    // New projects ALWAYS start in PLANNING
    return projectRepository.create(
  {
    name: data.name,
    description: data.description,

    ...(data.startDate && {
      startDate: new Date(data.startDate),
    }),

    ...(data.endDate && {
      endDate: new Date(data.endDate),
    }),

    ...(data.budget !== undefined && {
      budget: data.budget,
    }),

    status: ProjectStatus.PLANNING,

    client: {
      connect: {
        id: data.clientId,
      },
    },

    manager: {
      connect: {
        id: data.managerId,
      },
    },
  },
  data.managerId
);
  }

  async findAll(query: {
    page?: number;
    limit?: number;
    search?: string;
    status?: ProjectStatus;
    clientId?: string;
    managerId?: string;
    sortBy?: string;
    sortOrder?: "asc" | "desc";
  }) {
    const pagination = getPagination(query);

    const { projects, total } =
      await projectRepository.findAll(
        pagination.skip,
        pagination.limit,
        pagination.search,
        query.status,
        query.clientId,
        query.managerId,
        pagination.sortBy,
        pagination.sortOrder
      );

    return {
      data: projects,

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
    const project =
      await projectRepository.findById(id);

    if (!project) {
      throw new AppError(
        404,
        "Project not found."
      );
    }

    return project;
  }

  async update(
    id: string,
    data: UpdateProjectDTO,
    actorId: string
  ) {
    const project =
      await projectRepository.findById(id);

    if (!project) {
      throw new AppError(
        404,
        "Project not found."
      );
    }

    // Completed/cancelled projects are immutable
    if (
      project.status === ProjectStatus.COMPLETED ||
      project.status === ProjectStatus.CANCELLED
    ) {
      throw new AppError(
        400,
        `Project cannot be modified because it is ${project.status.toLowerCase()}.`
      );
    }

    // Project manager can only update their own projects
    if (
      project.manager.id !== actorId
    ) {
      const actor =
        await projectRepository.findManagerById(
          actorId
        );

      if (
        !actor ||
        actor.role.name !== UserRole.SUPER_ADMIN
      ) {
        throw new AppError(
          403,
          "You are not authorized to update this project."
        );
      }
    }

    // Validate client
    if (data.clientId) {
      const client =
        await projectRepository.findClientById(
          data.clientId
        );

      if (!client) {
        throw new AppError(
          404,
          "Client not found."
        );
      }

      // Client cannot be changed once project has started
      if (
        project.status !==
        ProjectStatus.PLANNING
      ) {
        throw new AppError(
          400,
          "Client cannot be changed after the project has started."
        );
      }
    }

    // Validate dates against EXISTING project dates
    const newStartDate =
      data.startDate !== undefined
        ? data.startDate
          ? new Date(data.startDate)
          : null
        : project.startDate;

    const newEndDate =
      data.endDate !== undefined
        ? data.endDate
          ? new Date(data.endDate)
          : null
        : project.endDate;

    if (
      newStartDate &&
      newEndDate &&
      newEndDate < newStartDate
    ) {
      throw new AppError(
        400,
        "End date must be after start date."
      );
    }

    return projectRepository.update(
      id,
      {
        ...(data.name !== undefined && {
          name: data.name,
        }),

        ...(data.description !== undefined && {
          description: data.description,
        }),

        ...(data.startDate !== undefined && {
          startDate: data.startDate
            ? new Date(data.startDate)
            : null,
        }),

        ...(data.endDate !== undefined && {
          endDate: data.endDate
            ? new Date(data.endDate)
            : null,
        }),

        ...(data.budget !== undefined && {
          budget: data.budget,
        }),

        ...(data.clientId && {
          client: {
            connect: {
              id: data.clientId,
            },
          },
        }),
      }
    );
  }

  async changeManager(
    id: string,
    managerId: string,
    actorId: string
  ) {
    const project =
      await projectRepository.findById(id);

    if (!project) {
      throw new AppError(
        404,
        "Project not found."
      );
    }

    const actor =
      await projectRepository.findManagerById(
        actorId
      );

    if (
      !actor ||
      actor.role.name !== UserRole.SUPER_ADMIN
    ) {
      throw new AppError(
        403,
        "Only a super admin can change the project manager."
      );
    }

    if (
      project.status === ProjectStatus.COMPLETED ||
      project.status === ProjectStatus.CANCELLED
    ) {
      throw new AppError(
        400,
        `Project manager cannot be changed because the project is ${project.status.toLowerCase()}.`
      );
    }

    if (project.manager.id === managerId) {
      throw new AppError(
        400,
        "The selected user is already the project manager."
      );
    }

    const manager =
      await projectRepository.findManagerById(
        managerId
      );

    if (!manager) {
      throw new AppError(
        404,
        "Project manager not found."
      );
    }

    if (
      manager.role.name !==
      UserRole.PROJECT_MANAGER
    ) {
      throw new AppError(
        400,
        "Selected user is not a project manager."
      );
    }

    return projectRepository.updateManager(
      id,
      managerId
    );
  }

  async changeStatus(
    id: string,
    newStatus: ProjectStatus,
    actorId: string
  ) {
    const project =
      await projectRepository.findById(id);

    if (!project) {
      throw new AppError(
        404,
        "Project not found."
      );
    }

    // Authorization
    const actor =
      await projectRepository.findManagerById(
        actorId
      );

    if (!actor) {
      throw new AppError(
        404,
        "User not found."
      );
    }

    const isSuperAdmin =
      actor.role.name === UserRole.SUPER_ADMIN;

    const isProjectManager =
      project.manager.id === actorId;

    if (
      !isSuperAdmin &&
      !isProjectManager
    ) {
      throw new AppError(
        403,
        "You are not authorized to change this project's status."
      );
    }

    const currentStatus =
      project.status;

    if (currentStatus === newStatus) {
      throw new AppError(
        400,
        `Project is already ${newStatus.toLowerCase()}.`
      );
    }

    // Terminal states
    if (
      currentStatus === ProjectStatus.COMPLETED ||
      currentStatus === ProjectStatus.CANCELLED
    ) {
      throw new AppError(
        400,
        `Project cannot transition from ${currentStatus.toLowerCase()}.`
      );
    }

    const allowedTransitions:
      Record<
        ProjectStatus,
        ProjectStatus[]
      > = {
      [ProjectStatus.PLANNING]: [
        ProjectStatus.IN_PROGRESS,
        ProjectStatus.CANCELLED,
      ],

      [ProjectStatus.IN_PROGRESS]: [
        ProjectStatus.ON_HOLD,
        ProjectStatus.COMPLETED,
        ProjectStatus.CANCELLED,
      ],

      [ProjectStatus.ON_HOLD]: [
        ProjectStatus.IN_PROGRESS,
        ProjectStatus.COMPLETED,
        ProjectStatus.CANCELLED,
      ],

      [ProjectStatus.COMPLETED]: [],

      [ProjectStatus.CANCELLED]: [],
    };

    const allowed =
      allowedTransitions[currentStatus];

    if (
      !allowed.includes(newStatus)
    ) {
      throw new AppError(
        400,
        `Invalid project status transition from ${currentStatus} to ${newStatus}.`
      );
    }

    return projectRepository.updateStatus(
      id,
      newStatus
    );
  }

  async delete(id: string) {
    const project =
      await projectRepository.findById(id);

    if (!project) {
      throw new AppError(
        404,
        "Project not found."
      );
    }

    if (
      project.status === ProjectStatus.COMPLETED ||
      project.status === ProjectStatus.CANCELLED
    ) {
      throw new AppError(
        400,
        "Completed or cancelled projects cannot be deleted."
      );
    }

    const [
  members,
  tasks,
  meetings,
  quotations,
] = await Promise.all([
  projectRepository.countMembers(
    id,
    project.manager.id
  ),
  projectRepository.countTasks(id),
  projectRepository.countMeetings(id),
  projectRepository.countQuotations(id),
]);

    if (
      members > 0 ||
      tasks > 0 ||
      meetings > 0 ||
      quotations > 0
    ) {
      throw new AppError(
        409,
        "Project cannot be deleted because related records exist. Cancel the project instead."
      );
    }

    await projectRepository.delete(id);
  }
}

export const projectService =
  new ProjectService();