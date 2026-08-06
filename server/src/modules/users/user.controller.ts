import { Request, Response, NextFunction } from "express";
import { UserService } from "./user.service";
import { successResponse } from "../../utils/apiResponse";
import { toUserResponse } from "./user.mapper";
import { UserRole, UserStatus } from "@prisma/client";

const userService = new UserService();

export class UserController {
  async createUser(req: Request, res: Response, next: NextFunction) {
    try {
      const user = await userService.createUser(req.body);

      return successResponse(
        res,
        "User created successfully.",
        toUserResponse(user),
        201,
      );
    } catch (error) {
      next(error);
    }
  }

  async findAll(req: Request, res: Response, next: NextFunction) {
  try {
    const {
      page,
      limit,
      search,
      role,
      status,
      departmentId,
      sortBy,
      sortOrder,
    } = req.query as {
      page: string;
      limit: string;
      search?: string;
      role?: UserRole;
      status?: UserStatus;
      departmentId?: string;
      sortBy: string;
      sortOrder: "asc" | "desc";
    };

    const result = await userService.findAll({
      page: page ? Number(page) : 1,
      limit: limit ? Number(limit) : 10,
      search,
      role,
      status,
      departmentId,
      sortBy: sortBy ?? "createdAt",
      sortOrder: sortOrder ?? "desc",
    });

    return successResponse(
  res,
  "Users fetched successfully.",
  result.users.map(toUserResponse),
  200,
  {
    page: result.page,
    limit: result.limit,
    total: result.total,
    totalPages: result.totalPages,
  }
);
  } catch (error) {
    next(error);
  }
}

async findById(req: Request, res: Response, next: NextFunction) {
  try {
    const id = String(req.params.id);

    const user = await userService.findById(id);

    return successResponse(
      res,
      "User fetched successfully.",
      toUserResponse(user)
    );
  } catch (error) {
    next(error);
  }
}

async updateUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const id = String(req.params.id);

    const user = await userService.updateUser(
      id,
      req.body
    );

    return successResponse(
      res,
      "User updated successfully.",
      toUserResponse(user)
    );
  } catch (error) {
    next(error);
  }
}

async updateStatus(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const id = String(req.params.id);

    const { status } = req.body;

    const user = await userService.updateStatus(
      id,
      status
    );

    return successResponse(
      res,
      "User status updated successfully.",
      toUserResponse(user)
    );
  } catch (error) {
    next(error);
  }
}

async deleteUser(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const id = String(req.params.id);

    await userService.deleteUser(
      id,
      req.user!.userId
    );

    return successResponse(
      res,
      "User deleted successfully."
    );
  } catch (error) {
    next(error);
  }
}

async getProfile(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const user = await userService.getProfile(
      req.user!.userId
    );

    return successResponse(
      res,
      "Profile fetched successfully.",
      toUserResponse(user)
    );
  } catch (error) {
    next(error);
  }
}

async updateProfile(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const user = await userService.updateProfile(
      req.user!.userId,
      req.body
    );

    return successResponse(
      res,
      "Profile updated successfully.",
      toUserResponse(user)
    );
  } catch (error) {
    next(error);
  }
}

async changePassword(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    await userService.changePassword(
      req.user!.userId,
      req.body
    );

    return successResponse(
      res,
      "Password changed successfully."
    );
  } catch (error) {
    next(error);
  }
}
}

export const userController = new UserController();
