export interface ProjectMemberUser {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  status: "ACTIVE" | "INACTIVE";
  role: {
    id: string;
    name:
      | "SUPER_ADMIN"
      | "PROJECT_MANAGER"
      | "EMPLOYEE"
      | "CLIENT";
  };
}

export interface ProjectMember {
  projectId: string;
  userId: string;
  joinedAt: string;
  user: ProjectMemberUser;
}

export interface ProjectMembersResponse {
  success: boolean;
  message: string;
  data: ProjectMember[];
}

export interface ProjectMemberMutationResponse {
  success: boolean;
  message: string;
  data: ProjectMember | null;
}

export interface AddProjectMemberPayload {
  userId: string;
}