import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import env from "../../config/env";
import { authRepository } from "./auth.repository";
import { LoginDTO, LoginResponse } from "./auth.types";

export class AuthService {
  async login(data: LoginDTO): Promise<LoginResponse> {
    // Find user
    const user = await authRepository.findUserByEmail(data.email);

    if (!user) {
      throw new Error("Invalid email or password.");
    }

    // Compare password
    const isPasswordCorrect = await bcrypt.compare(
      data.password,
      user.password
    );

    if (!isPasswordCorrect) {
      throw new Error("Invalid email or password.");
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
      }
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
    throw new Error("User not found.");
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