import bcrypt from "bcrypt";
import { UserRepository } from "./user.repository";
import { UserRole, UserStatus } from "@prisma/client";
import { AppError } from "../../utils/AppError";
import {
  CreateUserDTO,
  UpdateUserDTO,
  UpdateProfileDTO,
  ChangePasswordDTO,
} from "./user.types";

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

    // Validate client assignment
let client = null;

if (data.role === UserRole.CLIENT) {
  if (!data.clientId) {
    throw new AppError(
      400,
      "Client is required when creating a CLIENT user."
    );
  }

  client = await userRepository.findClientById(
    data.clientId
  );

  if (!client) {
    throw new AppError(404, "Client not found.");
  }
} else if (data.clientId) {
  throw new AppError(
    400,
    "Only CLIENT users can be assigned to a client."
  );
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

      ...(client && {
    client: {
      connect: {
        id: client.id,
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

  let clientData = {};

if (data.clientId !== undefined || data.role !== undefined) {
  const newRole = data.role ?? existingUser.role.name;

  if (newRole === UserRole.CLIENT) {
    if (data.clientId !== undefined) {
      if (data.clientId === null) {
        throw new AppError(
          400,
          "Client is required for a CLIENT user."
        );
      }

      const client = await userRepository.findClientById(
        data.clientId
      );

      if (!client) {
        throw new AppError(404, "Client not found.");
      }

      clientData = {
        client: {
          connect: {
            id: client.id,
          },
        },
      };
    }
  } else {
    if (data.clientId) {
      throw new AppError(
        400,
        "Only CLIENT users can be assigned to a client."
      );
    }

    clientData = {
      client: {
        disconnect: true,
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

    ...clientData,
  });
}

async updateStatus(
  id: string,
  status: UserStatus
) {
  const user = await userRepository.findById(id);

  if (!user) {
    throw new AppError(404, "User not found.");
  }

  return userRepository.updateStatus(id, status);
}

async getProfile(userId: string) {
  const user = await userRepository.findById(userId);

  if (!user) {
    throw new AppError(404, "User not found.");
  }

  return user;
}

async updateProfile(
  userId: string,
  data: UpdateProfileDTO
) {
  const existingUser = await userRepository.findById(userId);

  if (!existingUser) {
    throw new AppError(404, "User not found.");
  }

  // Check email uniqueness
  if (data.email) {
    const emailExists = await userRepository.findByEmailExceptId(
      data.email,
      userId
    );

    if (emailExists) {
      throw new AppError(409, "Email already exists.");
    }
  }

  return userRepository.update(userId, {
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
  });
}

async changePassword(
  userId: string,
  data: ChangePasswordDTO
) {
  const user = await userRepository.findById(userId);

  if (!user) {
    throw new AppError(404, "User not found.");
  }

  const passwordMatched = await bcrypt.compare(
    data.currentPassword,
    user.password
  );

  if (!passwordMatched) {
    throw new AppError(
      400,
      "Current password is incorrect."
    );
  }

  const samePassword = await bcrypt.compare(
    data.newPassword,
    user.password
  );

  if (samePassword) {
    throw new AppError(
      400,
      "New password must be different from the current password."
    );
  }

  const hashedPassword = await bcrypt.hash(
    data.newPassword,
    10
  );

  await userRepository.updatePassword(
    userId,
    hashedPassword
  );
}

async deleteUser(
  id: string,
  currentUserId: string
) {
  if (id === currentUserId) {
    throw new AppError(
      400,
      "You cannot delete your own account."
    );
  }

  const user = await userRepository.findById(id);

  if (!user) {
    throw new AppError(
      404,
      "User not found."
    );
  }

  await userRepository.delete(id);
}
}