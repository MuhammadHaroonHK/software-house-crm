import { Request, Response, NextFunction } from "express";
import { UserService } from "./user.service";
import { successResponse } from "../../utils/apiResponse";

const userService = new UserService();

export class UserController {
  async createUser(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const user = await userService.createUser(req.body);

      return successResponse(
        res,
        "User created successfully.",
        user,
        201
      );
    } catch (error) {
      next(error);
    }
  }
}

export const userController = new UserController();