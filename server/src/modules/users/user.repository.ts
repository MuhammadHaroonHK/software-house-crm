import prisma from "../../lib/prisma";
import { Prisma, User, UserRole, UserStatus } from "@prisma/client";

export class UserRepository {
  async findByEmail(email: string): Promise<User | null> {
    return prisma.user.findUnique({
      where: { email },
    });
  }

  async create(data: Prisma.UserCreateInput) {
  return prisma.user.create({
    data,
    include: {
      role: {
        select: {
          id: true,
          name: true,
        },
      },
      department: {
        select: {
          id: true,
          name: true,
        },
      },
    },
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

async findAll(
  page: number,
  limit: number,
  search?: string,
  role?: UserRole,
  status?: UserStatus,
  departmentId?: string,
  sortBy: string = "createdAt",
  sortOrder: "asc" | "desc" = "desc"
) {
  const skip = (page - 1) * limit;

  const where: Prisma.UserWhereInput = {
    ...(search && {
      OR: [
        {
          firstName: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          lastName: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          email: {
            contains: search,
            mode: "insensitive",
          },
        },
        {
          phone: {
            contains: search,
            mode: "insensitive",
          },
        },
      ],
    }),

    ...(role && {
      role: {
        name: role,
      },
    }),

    ...(status && {
      status,
    }),

    ...(departmentId && {
      departmentId,
    }),
  };

  const [users, total] = await Promise.all([
    prisma.user.findMany({
      where,
      skip,
      take: limit,

      include: {
        role: {
          select: {
            id: true,
            name: true,
          },
        },

        department: {
          select: {
            id: true,
            name: true,
          },
        },
      },

      orderBy: {
        [sortBy]: sortOrder,
      },
    }),

    prisma.user.count({
      where,
    }),
  ]);

  return {
    users,
    total,
  };
}

async findById(id: string) {
  return prisma.user.findUnique({
    where: {
      id,
    },

    include: {
      role: {
        select: {
          id: true,
          name: true,
        },
      },

      department: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
}

async update(
  id: string,
  data: Prisma.UserUpdateInput
) {
  return prisma.user.update({
    where: {
      id,
    },

    data,

    include: {
      role: {
        select: {
          id: true,
          name: true,
        },
      },

      department: {
        select: {
          id: true,
          name: true,
        },
      },
    },
  });
}

async findByEmailExceptId(
  email: string,
  id: string
) {
  return prisma.user.findFirst({
    where: {
      email,
      NOT: {
        id,
      },
    },
  });
}

async findRoleById(id: string) {
  return prisma.role.findUnique({
    where: {
      id,
    },
  });
}
}