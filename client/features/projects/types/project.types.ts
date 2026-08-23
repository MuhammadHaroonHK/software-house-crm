export type ProjectStatus =
  | "PLANNING"
  | "IN_PROGRESS"
  | "ON_HOLD"
  | "COMPLETED"
  | "CANCELLED";

export interface ProjectClient {
  id: string;
  companyName: string;
}

export interface ProjectManager {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
}

export interface Project {
  id: string;

  clientId: string;
  managerId: string;

  name: string;
  description: string | null;

  startDate: string | null;
  endDate: string | null;

  /**
   * Prisma Decimal values are serialized
   * by the API as strings.
   */
  budget: string | number | null;

  status: ProjectStatus;

  createdAt: string;
  updatedAt: string;

  client?: ProjectClient;
  manager?: ProjectManager;
}

export interface ProjectPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface ProjectListResponse {
  success: boolean;
  message: string;
  data: Project[];
  meta: ProjectPagination;
}

export interface ProjectResponse {
  success: boolean;
  message: string;
  data: Project;
}

export interface ProjectMutationResponse {
  success: boolean;
  message: string;
  data: Project | null;
}

export interface CreateProjectPayload {
  clientId: string;
  managerId: string;

  name: string;
  description?: string;

  startDate?: string;
  endDate?: string;

  budget?: number;
}

export interface UpdateProjectPayload {
  clientId?: string;

  name?: string;
  description?: string;

  startDate?: string | null;
  endDate?: string | null;

  budget?: number;
}

export interface ChangeProjectManagerPayload {
  managerId: string;
}

export interface ChangeProjectStatusPayload {
  status: ProjectStatus;
}

export interface ProjectQueryParams {
  page?: number;
  limit?: number;
  search?: string;

  status?: ProjectStatus;
  clientId?: string;
  managerId?: string;

  sortBy?: string;
  sortOrder?: "asc" | "desc";
}
