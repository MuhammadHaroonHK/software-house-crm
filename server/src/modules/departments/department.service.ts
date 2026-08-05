import { departmentRepository } from "./department.repository";
import { AppError } from "../../utils/AppError";

export class DepartmentService {
  async create(name: string, description?: string) {
    const existingDepartment = await departmentRepository.findByName(name);

    if (existingDepartment) {
      throw new AppError(409, "Department already exists.");
    }

    return departmentRepository.create(name, description);
  }

  async findAll() {
    return departmentRepository.findAll();
  }

  async findById(id: string) {
    const department = await departmentRepository.findById(id);

    if (!department) {
      throw new AppError(404, "Department not found.");
    }

    return department;
  }

  async update(
    id: string,
    data: {
      name?: string;
      description?: string;
    },
  ) {
    const department = await departmentRepository.findById(id);

    if (!department) {
      throw new AppError(404, "Department not found.");
    }

    if (data.name) {
      const existing = await departmentRepository.findByName(data.name);

      if (existing && existing.id !== id) {
        throw new AppError(409, "Department already exists.");
      }
    }

    return departmentRepository.update(id, data);
  }

  async delete(id: string) {
    const department = await departmentRepository.findById(id);

    if (!department) {
      throw new AppError(404, "Department not found.");
    }

    const usersCount = await departmentRepository.countUsers(id);

    if (usersCount > 0) {
      throw new AppError(
        409,
        "Department cannot be deleted because users are assigned to it.",
      );
    }

    await departmentRepository.delete(id);

    return;
  }
}

export const departmentService = new DepartmentService();
