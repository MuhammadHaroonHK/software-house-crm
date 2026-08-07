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

      const member =
        await projectMemberService.addMember(
          projectId,
          userId
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

      const members =
        await projectMemberService.findMembers(
          projectId
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

      await projectMemberService.removeMember(
        projectId,
        userId
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