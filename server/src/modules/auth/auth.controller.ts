import { Request, Response, NextFunction } from "express";
import { authService } from "./auth.service";
import { successResponse } from "../../utils/apiResponse";

export class AuthController {
  async login(
    req: Request,
    res: Response,
    next: NextFunction
  ) {
    try {
      const result = await authService.login(req.body);

      return successResponse(
        res,
        "Login successful.",
        result
      );
    } catch (error) {
      next(error);
    }
  }

  async me(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    const result = await authService.me(req.user!.userId);

    return successResponse(
      res,
      "User profile fetched successfully.",
      result
    );
  } catch (error) {
    next(error);
  }
}
}

export const authController = new AuthController();