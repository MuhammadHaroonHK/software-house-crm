import prisma from "../../lib/prisma";
import { Prisma, User, UserRole } from "@prisma/client";

export class UserRepository {
  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  async create(data: Prisma.UserCreateInput): Promise<User> {
    return prisma.user.create({
      data,
    });
  }

  async findRoleByName(name: UserRole) {
  return prisma.role.findUnique({
    where: { name },
  });
}

async findDepartmentById(id: string) {
  return prisma.department.findUnique({
    where: { id },
  });
}

async findById(id: string): Promise<User | null> {
  return prisma.user.findUnique({
    where: { id },
  });
}

}