import { AppError } from "../../utils/AppError";
import { ProjectRepository } from "./project.repository";
import { CreateProjectDTO } from "./project.types";

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
}
