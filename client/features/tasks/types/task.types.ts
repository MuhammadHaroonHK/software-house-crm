export type TaskPriority = "LOW" | "MEDIUM" | "HIGH" | "URGENT";

export type TaskStatus = "TODO" | "IN_PROGRESS" | "IN_REVIEW" | "COMPLETED";

export interface TaskProject {
  id: string;
  name: string;
  status: "PLANNING" | "IN_PROGRESS" | "ON_HOLD" | "COMPLETED" | "CANCELLED";
  managerId: string;
}

export interface TaskAssignedUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;

  role: {
    id: string;
    name: "SUPER_ADMIN" | "PROJECT_MANAGER" | "EMPLOYEE" | "CLIENT";
  };
}

export interface Task {
  id: string;

  projectId: string;
  assignedToId: string;

  title: string;
  description: string | null;

  priority: TaskPriority;
  status: TaskStatus;

  dueDate: string | null;
  completedAt: string | null;

  createdAt: string;
  updatedAt: string;

  project: TaskProject;
  assignedTo: TaskAssignedUser;
}

export interface TaskPagination {
  page: number;
  limit: number;
  total: number;
  totalPages: number;
}

export interface TaskListResponse {
  success: boolean;
  message: string;
  data: Task[];
  meta: TaskPagination;
}

export interface TaskResponse {
  success: boolean;
  message: string;
  data: Task;
}

export interface TaskMutationResponse {
  success: boolean;
  message: string;
  data: Task | null;
}

export interface CreateTaskPayload {
  projectId: string;
  assignedToId: string;

  title: string;
  description?: string;

  priority?: TaskPriority;
  dueDate?: string;
}

export interface UpdateTaskPayload {
  assignedToId?: string;

  title?: string;
  description?: string;

  priority?: TaskPriority;
  dueDate?: string | null;
}

export interface UpdateTaskStatusPayload {
  status: TaskStatus;
}

export interface TaskQueryParams {
  page?: number;
  limit?: number;

  search?: string;

  projectId?: string;
  assignedToId?: string;

  priority?: TaskPriority;
  status?: TaskStatus;

  sortBy?: string;
  sortOrder?: "asc" | "desc";
}
