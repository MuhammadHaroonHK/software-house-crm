"use client";

import {
  keepPreviousData,
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { contactPersonService } from "../services/contactPerson.service";

import type {
  ContactPersonQueryParams,
  CreateContactPersonPayload,
  UpdateContactPersonPayload,
} from "../types/contactPerson.types";

export const CONTACT_PERSONS_QUERY_KEY = [
  "contact-persons",
] as const;

export function useContactPersons(
  params?: ContactPersonQueryParams
) {
  return useQuery({
    queryKey: [
      ...CONTACT_PERSONS_QUERY_KEY,
      params,
    ],

    queryFn: () =>
      contactPersonService.getAll(params),

    placeholderData: keepPreviousData,

    staleTime: 30 * 1000,

    refetchOnWindowFocus: false,
  });
}

export function useCreateContactPerson() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (
      data: CreateContactPersonPayload
    ) =>
      contactPersonService.create(data),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey:
          CONTACT_PERSONS_QUERY_KEY,
      });
    },
  });
}

export function useUpdateContactPerson() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: ({
      id,
      data,
    }: {
      id: string;
      data: UpdateContactPersonPayload;
    }) =>
      contactPersonService.update(
        id,
        data
      ),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey:
          CONTACT_PERSONS_QUERY_KEY,
      });
    },
  });
}

export function useDeleteContactPerson() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (id: string) =>
      contactPersonService.delete(id),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey:
          CONTACT_PERSONS_QUERY_KEY,
      });
    },
  });
}