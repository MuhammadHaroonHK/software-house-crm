"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import {
  projectMemberService,
} from "../services/projectMember.service";

import type {
  AddProjectMemberPayload,
} from "../types/projectMember.types";

export const PROJECT_MEMBERS_QUERY_KEY = [
  "project-members",
] as const;

export function useProjectMembers(
  projectId?: string
) {
  return useQuery({
    queryKey: [
      ...PROJECT_MEMBERS_QUERY_KEY,
      projectId,
    ],

    queryFn: () =>
      projectMemberService.getMembers(
        projectId as string
      ),

    enabled: Boolean(projectId),

    staleTime: 30 * 1000,

    refetchOnWindowFocus: false,
  });
}

export function useAddProjectMember() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      data,
    }: {
      projectId: string;
      data: AddProjectMemberPayload;
    }) =>
      projectMemberService.addMember(
        projectId,
        data
      ),

    onSuccess: (
      _response,
      variables
    ) => {
      queryClient.invalidateQueries({
        queryKey: [
          ...PROJECT_MEMBERS_QUERY_KEY,
          variables.projectId,
        ],
      });
    },
  });
}

export function useRemoveProjectMember() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: ({
      projectId,
      userId,
    }: {
      projectId: string;
      userId: string;
    }) =>
      projectMemberService.removeMember(
        projectId,
        userId
      ),

    onSuccess: (
      _response,
      variables
    ) => {
      queryClient.invalidateQueries({
        queryKey: [
          ...PROJECT_MEMBERS_QUERY_KEY,
          variables.projectId,
        ],
      });
    },
  });
}