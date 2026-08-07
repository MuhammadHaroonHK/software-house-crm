import { AppError } from "../../utils/AppError";
import { UserRole, UserStatus } from "@prisma/client";
import { ProjectMemberRepository } from "./projectMember.repository";

const projectMemberRepository =
  new ProjectMemberRepository();

export class ProjectMemberService {
  async addMember(
    projectId: string,
    userId: string
  ) {
    // Check project
    const project =
      await projectMemberRepository.findProjectById(
        projectId
      );

    if (!project) {
      throw new AppError(404, "Project not found.");
    }

    // Check user
    const user =
      await projectMemberRepository.findUserById(
        userId
      );

    if (!user) {
      throw new AppError(404, "User not found.");
    }

    // User must be active
    if (user.status !== UserStatus.ACTIVE) {
      throw new AppError(
        400,
        "Inactive users cannot be assigned to projects."
      );
    }

    // Allowed roles
    if (
      user.role.name !== UserRole.EMPLOYEE &&
      user.role.name !== UserRole.PROJECT_MANAGER
    ) {
      throw new AppError(
        400,
        "Only employees and project managers can be assigned."
      );
    }

    // Duplicate check
    const existing =
      await projectMemberRepository.isProjectMember(
        projectId,
        userId
      );

    if (existing) {
      throw new AppError(
        409,
        "User is already assigned to this project."
      );
    }

    return projectMemberRepository.addMember(
      projectId,
      userId
    );
  }

  async findMembers(projectId: string) {
    const project =
      await projectMemberRepository.findProjectById(
        projectId
      );

    if (!project) {
      throw new AppError(404, "Project not found.");
    }

    return projectMemberRepository.findMembers(
      projectId
    );
  }

  async removeMember(
    projectId: string,
    userId: string
  ) {
    const project =
      await projectMemberRepository.findProjectById(
        projectId
      );

    if (!project) {
      throw new AppError(404, "Project not found.");
    }

    const member =
      await projectMemberRepository.isProjectMember(
        projectId,
        userId
      );

    if (!member) {
      throw new AppError(
        404,
        "Project member not found."
      );
    }

    await projectMemberRepository.removeMember(
      projectId,
      userId
    );
  }
}

export const projectMemberService =
  new ProjectMemberService();