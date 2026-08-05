import { departmentRepository } from "./department.repository";

export class DepartmentService {
  async create(name: string, description?: string) {
    // Check if department already exists
    const existingDepartment = await departmentRepository.findByName(name);

    if (existingDepartment) {
      throw new Error("Department already exists.");
    }

    // Create department
    return departmentRepository.create(name, description);
  }
}

export const departmentService = new DepartmentService();