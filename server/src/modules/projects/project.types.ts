import { ProjectStatus } from "@prisma/client";

export interface CreateProjectDTO {
  clientId: string;
  managerId: string;

  name: string;
  description?: string;

  startDate?: string;
  endDate?: string;

  budget?: number;
}

export interface UpdateProjectDTO {
  clientId?: string;

  name?: string;
  description?: string;

  startDate?: string | null;
  endDate?: string | null;

  budget?: number | null;
}

export interface ChangeProjectManagerDTO {
  managerId: string;
}