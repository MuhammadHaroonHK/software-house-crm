import bcrypt from "bcrypt";
import { UserRepository } from "./user.repository";
import { CreateUserDTO, UpdateUserDTO } from "./user.types";
import { UserRole, UserStatus } from "@prisma/client";
import { AppError } from "../../utils/AppError";

const userRepository = new UserRepository();

export class UserService {
  async createUser(data: CreateUserDTO) {
    // Check if email already exists
    const existingUser = await userRepository.findByEmail(data.email);

    if (existingUser) {
      throw new AppError(409, "Email already exists.");
    }

    // Check if role exists
    const role = await userRepository.findRoleByName(data.role);

    if (!role) {
      throw new AppError(404, "Role not found.");
    }

    // Check department (optional)
    let department = null;

    if (data.departmentId) {
      department = await userRepository.findDepartmentById(
        data.departmentId
      );

      if (!department) {
        throw new AppError(404, "Department not found.");
      }
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(data.password, 10);

    // Create user
    const user = await userRepository.create({
      firstName: data.firstName,
      lastName: data.lastName,
      email: data.email,
      password: hashedPassword,
      phone: data.phone,

      role: {
        connect: {
          id: role.id,
        },
      },

      ...(department && {
        department: {
          connect: {
            id: department.id,
          },
        },
      }),
    });

    return user;
  }

  async findAll(params: {
  page: number;
  limit: number;
  search?: string;
  role?: UserRole;
  status?: UserStatus;
  departmentId?: string;
  sortBy: string;
  sortOrder: "asc" | "desc";
}) {
  const { users, total } = await userRepository.findAll(
    params.page,
    params.limit,
    params.search,
    params.role,
    params.status,
    params.departmentId,
    params.sortBy,
    params.sortOrder
  );

  return {
    users,
    total,
    page: params.page,
    limit: params.limit,
    totalPages: Math.ceil(total / params.limit),
  };
}

async findById(id: string) {
  const user = await userRepository.findById(id);

  if (!user) {
    throw new AppError(404, "User not found.");
  }

  return user;
}

async updateUser(id: string, data: UpdateUserDTO) {
  // Check user exists
  const existingUser = await userRepository.findById(id);

  if (!existingUser) {
    throw new AppError(404, "User not found.");
  }

  // Check email uniqueness
  if (data.email) {
    const emailExists = await userRepository.findByEmailExceptId(
      data.email,
      id
    );

    if (emailExists) {
      throw new AppError(409, "Email already exists.");
    }
  }

  let roleData = {};

  if (data.role) {
    const role = await userRepository.findRoleByName(data.role);

    if (!role) {
      throw new AppError(404, "Role not found.");
    }

    roleData = {
      role: {
        connect: {
          id: role.id,
        },
      },
    };
  }

  let departmentData = {};

  if (data.departmentId !== undefined) {
    if (data.departmentId === null) {
      departmentData = {
        department: {
          disconnect: true,
        },
      };
    } else {
      const department = await userRepository.findDepartmentById(
        data.departmentId
      );

      if (!department) {
        throw new AppError(404, "Department not found.");
      }

      departmentData = {
        department: {
          connect: {
            id: department.id,
          },
        },
      };
    }
  }

  return userRepository.update(id, {
    ...(data.firstName && {
      firstName: data.firstName,
    }),

    ...(data.lastName && {
      lastName: data.lastName,
    }),

    ...(data.email && {
      email: data.email,
    }),

    ...(data.phone !== undefined && {
      phone: data.phone,
    }),

    ...roleData,

    ...departmentData,
  });
}
}