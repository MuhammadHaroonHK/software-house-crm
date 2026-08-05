import prisma from "../../lib/prisma";

export class DepartmentRepository {
  async create(name: string, description?: string) {
    return prisma.department.create({
      data: {
        name,
        description,
      },
    });
  }

  async findByName(name: string) {
    return prisma.department.findUnique({
      where: {
        name,
      },
    });
  }

  async findById(id: string) {
    return prisma.department.findUnique({
      where: {
        id,
      },
    });
  }

  async findAll(
    skip: number,
    limit: number,
    search: string,
    sortBy: string,
    sortOrder: "asc" | "desc",
  ) {
    const where = search
      ? {
          OR: [
            {
              name: {
                contains: search,
                mode: "insensitive" as const,
              },
            },
            {
              description: {
                contains: search,
                mode: "insensitive" as const,
              },
            },
          ],
        }
      : {};

    const [departments, total] = await Promise.all([
      prisma.department.findMany({
        where,
        skip,
        take: limit,
        orderBy: {
          [sortBy]: sortOrder,
        },
      }),

      prisma.department.count({
        where,
      }),
    ]);

    return {
      departments,
      total,
    };
  }

  async update(
    id: string,
    data: {
      name?: string;
      description?: string;
    },
  ) {
    return prisma.department.update({
      where: {
        id,
      },
      data,
    });
  }

  async delete(id: string) {
    return prisma.department.delete({
      where: {
        id,
      },
    });
  }

  async countUsers(id: string) {
    return prisma.user.count({
      where: {
        departmentId: id,
      },
    });
  }
}

export const departmentRepository = new DepartmentRepository();
