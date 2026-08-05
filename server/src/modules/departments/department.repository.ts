import prisma from "../../lib/prisma";

export class DepartmentRepository {
  async findByName(name: string) {
    return prisma.department.findUnique({
      where: {
        name,
      },
    });
  }

  async create(name: string, description?: string) {
    return prisma.department.create({
      data: {
        name,
        description,
      },
    });
  }
}

export const departmentRepository = new DepartmentRepository();