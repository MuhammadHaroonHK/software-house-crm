import { ProjectStatus } from "@prisma/client";

export interface CreateProjectDTO {
  clientId: string;
  managerId: string;

  name: string;
  description?: string;

  startDate?: string;
  endDate?: string;

  budget?: number;

  status?: ProjectStatus;
}

export interface UpdateProjectDTO {
  clientId?: string;
  managerId?: string;

  name?: string;
  description?: string;

  startDate?: string | null;
  endDate?: string | null;

  budget?: number | null;

  status?: ProjectStatus;
}
