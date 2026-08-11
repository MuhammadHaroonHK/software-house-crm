import { Request, Response, NextFunction } from "express";
import { successResponse } from "../../utils/apiResponse";
import { projectMemberService } from "./projectMember.service";

export class ProjectMemberController {
  async addMember(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const projectId = String(req.params.projectId);
    const { userId } = req.body;

    if (!req.user) {
      throw new Error("Authenticated user not found.");
    }

    const member =
      await projectMemberService.addMember(
        projectId,
        userId,
        req.user.userId,
        req.user.role
      );

    return successResponse(
      res,
      "Project member added successfully.",
      member,
      201
    );
  } catch (error) {
    next(error);
  }
}

async findMembers(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const projectId = String(req.params.projectId);

    if (!req.user) {
      throw new Error("Authenticated user not found.");
    }

    const members =
      await projectMemberService.findMembers(
        projectId,
        req.user.userId,
        req.user.role
      );

    return successResponse(
      res,
      "Project members fetched successfully.",
      members
    );
  } catch (error) {
    next(error);
  }
}

async removeMember(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const projectId = String(req.params.projectId);
    const userId = String(req.params.userId);

    if (!req.user) {
      throw new Error("Authenticated user not found.");
    }

    await projectMemberService.removeMember(
      projectId,
      userId,
      req.user.userId,
      req.user.role
    );

    return successResponse(
      res,
      "Project member removed successfully."
    );
  } catch (error) {
    next(error);
  }
}
}

export const projectMemberController =
  new ProjectMemberController();