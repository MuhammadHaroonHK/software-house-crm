import { AppError } from "../../utils/AppError";
import {
  UserRole,
  UserStatus,
  ProjectStatus,
} from "@prisma/client";
import { ProjectMemberRepository } from "./projectMember.repository";

const projectMemberRepository =
  new ProjectMemberRepository();

export class ProjectMemberService {
  async addMember(
    projectId: string,
    userId: string,
    actorId: string,
    actorRole: UserRole
  ) {
    // Check project
    const project =
      await projectMemberRepository.findProjectById(
        projectId
      );

    if (!project) {
      throw new AppError(
        404,
        "Project not found."
      );
    }

    // Completed/cancelled projects cannot be modified
    if (
      project.status === ProjectStatus.COMPLETED ||
      project.status === ProjectStatus.CANCELLED
    ) {
      throw new AppError(
        400,
        "Members cannot be added to a completed or cancelled project."
      );
    }

    // Only project manager or super admin can manage members
    if (
      actorRole !== UserRole.SUPER_ADMIN &&
      project.managerId !== actorId
    ) {
      throw new AppError(
        403,
        "Only the project manager can manage project members."
      );
    }

    // Check user
    const user =
      await projectMemberRepository.findUserById(
        userId
      );

    if (!user) {
      throw new AppError(
        404,
        "User not found."
      );
    }

    // User must be active
    if (user.status !== UserStatus.ACTIVE) {
      throw new AppError(
        400,
        "Inactive users cannot be assigned to projects."
      );
    }

    // Only employees can be project members
    if (user.role.name !== UserRole.EMPLOYEE) {
      throw new AppError(
        400,
        "Only employees can be assigned as project members."
      );
    }

    // Prevent duplicate membership
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

  async findMembers(
    projectId: string,
    actorId: string,
    actorRole: UserRole
  ) {
    // Check project
    const project =
      await projectMemberRepository.findProjectById(
        projectId
      );

    if (!project) {
      throw new AppError(
        404,
        "Project not found."
      );
    }

    // Super admin can view all projects
    if (actorRole === UserRole.SUPER_ADMIN) {
      return projectMemberRepository.findMembers(
        projectId
      );
    }

    // Project manager can view their own project
    if (project.managerId === actorId) {
      return projectMemberRepository.findMembers(
        projectId
      );
    }

    // Assigned employees can view their project team
    const isMember =
      await projectMemberRepository.isProjectMember(
        projectId,
        actorId
      );

    if (!isMember) {
      throw new AppError(
        403,
        "You are not a member of this project."
      );
    }

    return projectMemberRepository.findMembers(
      projectId
    );
  }

  async removeMember(
    projectId: string,
    userId: string,
    actorId: string,
    actorRole: UserRole
  ) {
    // Check project
    const project =
      await projectMemberRepository.findProjectById(
        projectId
      );

    if (!project) {
      throw new AppError(
        404,
        "Project not found."
      );
    }

    // Completed/cancelled projects cannot be modified
    if (
      project.status === ProjectStatus.COMPLETED ||
      project.status === ProjectStatus.CANCELLED
    ) {
      throw new AppError(
        400,
        "Members cannot be removed from a completed or cancelled project."
      );
    }

    // Only project manager or super admin can manage members
    if (
      actorRole !== UserRole.SUPER_ADMIN &&
      project.managerId !== actorId
    ) {
      throw new AppError(
        403,
        "Only the project manager can manage project members."
      );
    }

    // Check membership
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

    // Do not remove members who still have active tasks
    const activeTaskCount =
      await projectMemberRepository.countActiveTasks(
        projectId,
        userId
      );

    if (activeTaskCount > 0) {
      throw new AppError(
        409,
        "Project member cannot be removed because they still have active tasks. Reassign or complete their tasks first."
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