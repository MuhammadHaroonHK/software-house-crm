import { z } from "zod";

export const addProjectMemberSchema = z.object({
  params: z.object({
    projectId: z.uuid(),
  }),

  body: z.object({
    userId: z.uuid(),
  }),
});

export const removeProjectMemberSchema = z.object({
  params: z.object({
    projectId: z.uuid(),
    userId: z.uuid(),
  }),
});

export const getProjectMembersSchema = z.object({
  params: z.object({
    projectId: z.uuid(),
  }),
});