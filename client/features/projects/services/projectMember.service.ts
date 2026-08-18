import api from "@/lib/api";

import type {
  AddProjectMemberPayload,
  ProjectMemberMutationResponse,
  ProjectMembersResponse,
} from "../types/projectMember.types";

export const projectMemberService = {
  async getMembers(
    projectId: string
  ): Promise<ProjectMembersResponse> {
    const response =
      await api.get<ProjectMembersResponse>(
        `/projects/${projectId}/members`
      );

    return response.data;
  },

  async addMember(
    projectId: string,
    data: AddProjectMemberPayload
  ): Promise<ProjectMemberMutationResponse> {
    const response =
      await api.post<ProjectMemberMutationResponse>(
        `/projects/${projectId}/members`,
        data
      );

    return response.data;
  },

  async removeMember(
    projectId: string,
    userId: string
  ): Promise<ProjectMemberMutationResponse> {
    const response =
      await api.delete<ProjectMemberMutationResponse>(
        `/projects/${projectId}/members/${userId}`
      );

    return response.data;
  },
};