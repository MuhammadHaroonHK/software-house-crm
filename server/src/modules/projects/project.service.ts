import { AppError } from "../../utils/AppError";
import { ProjectRepository } from "./project.repository";
import { CreateProjectDTO, UpdateProjectDTO } from "./project.types";
import { ProjectStatus } from "@prisma/client";
import { getPagination } from "../../utils/pagination";

const projectRepository = new ProjectRepository();

export class ProjectService {
  async create(data: CreateProjectDTO) {
    // Check client
    const client = await projectRepository.findClientById(data.clientId);

    if (!client) {
      throw new AppError(404, "Client not found.");
    }

    // Check manager
    const manager = await projectRepository.findManagerById(data.managerId);

    if (!manager) {
      throw new AppError(404, "Project manager not found.");
    }

    // Validate manager role
    const isProjectManager = await projectRepository.isProjectManager(
      data.managerId,
    );

    if (!isProjectManager) {
      throw new AppError(400, "Selected user is not a project manager.");
    }

    // Create project
    return projectRepository.create({
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

      ...(data.status && {
        status: data.status,
      }),

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
    });
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
  data: UpdateProjectDTO
) {
  const project = await projectRepository.findById(id);

  if (!project) {
    throw new AppError(404, "Project not found.");
  }

  if (data.clientId) {
    const client =
      await projectRepository.findClientById(
        data.clientId
      );

    if (!client) {
      throw new AppError(404, "Client not found.");
    }
  }

  if (data.managerId) {
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
  }

  return projectRepository.update(id, {
    ...(data.name && {
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

    ...(data.status && {
      status: data.status,
    }),

    ...(data.clientId && {
      client: {
        connect: {
          id: data.clientId,
        },
      },
    }),

    ...(data.managerId && {
      manager: {
        connect: {
          id: data.managerId,
        },
      },
    }),
  });
}

async delete(id: string) {
  const project =
    await projectRepository.findById(id);

  if (!project) {
    throw new AppError(404, "Project not found.");
  }

  const [
    members,
    tasks,
    meetings,
    quotations,
  ] = await Promise.all([
    projectRepository.countMembers(id),
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
      "Project cannot be deleted because related records exist."
    );
  }

  await projectRepository.delete(id);
}
}
