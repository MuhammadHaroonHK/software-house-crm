import prisma from "../../lib/prisma";

export class AuthRepository {
  async findUserByEmail(email: string) {
    return prisma.user.findUnique({
      where: {
        email,
      },
      include: {
        role: true,
        department: true,
      },
    });
  }
}

export const authRepository = new AuthRepository();