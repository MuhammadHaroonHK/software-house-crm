import bcrypt from "bcrypt";
import { UserRepository } from "./user.repository";
import { CreateUserDTO } from "./user.types";

const userRepository = new UserRepository();

export class UserService {
  async createUser(data: CreateUserDTO) {
    // Check if email already exists
    const existingUser = await userRepository.findByEmail(data.email);

    if (existingUser) {
      throw new Error("Email already exists.");
    }

    // Check if role exists
    const role = await userRepository.findRoleByName(data.role);

    if (!role) {
      throw new Error("Role not found.");
    }

    // Check department (optional)
    let department = null;

    if (data.departmentId) {
      department = await userRepository.findDepartmentById(
        data.departmentId
      );

      if (!department) {
        throw new Error("Department not found.");
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
}