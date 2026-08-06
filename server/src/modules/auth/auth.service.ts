import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import env from "../../config/env";
import { authRepository } from "./auth.repository";
import { LoginDTO, LoginResponse } from "./auth.types";
import { AppError } from "../../utils/AppError";
import { UserStatus } from "@prisma/client";

export class AuthService {
  async login(data: LoginDTO): Promise<LoginResponse> {
    // Find user
    // Find user
    const user = await authRepository.findUserByEmail(data.email);

    if (!user) {
      throw new AppError(401, "Invalid email or password.");
    }

    // Check account status
    if (user.status !== UserStatus.ACTIVE) {
      throw new AppError(
        403,
        "Your account is inactive. Please contact the administrator.",
      );
    }

    // Compare password
    const isPasswordCorrect = await bcrypt.compare(
      data.password,
      user.password,
    );

    if (!isPasswordCorrect) {
      throw new AppError(401, "Invalid email or password.");
    }

    // Generate JWT
    const accessToken = jwt.sign(
      {
        userId: user.id,
        role: user.role.name,
      },
      env.JWT_ACCESS_SECRET,
      {
        expiresIn: "7d",
      },
    );

    return {
      accessToken,
      user: {
        id: user.id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        role: user.role.name,
      },
    };
  }

  async me(userId: string) {
    const user = await authRepository.findUserById(userId);

    if (!user) {
      if (!user) {
        throw new AppError(404, "User not found.");
      }
    }

    return {
      id: user.id,
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      phone: user.phone,
      profileImage: user.profileImage,
      status: user.status,
      role: user.role.name,
      department: user.department?.name ?? null,
    };
  }
}

export const authService = new AuthService();
