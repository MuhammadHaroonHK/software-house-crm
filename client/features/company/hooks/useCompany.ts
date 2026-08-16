"use client";

import {
  useMutation,
  useQuery,
  useQueryClient,
} from "@tanstack/react-query";

import { companyService } from "../services/company.service";

import type {
  UpdateCompanyPayload,
} from "../types/company.types";

export const COMPANY_QUERY_KEY = [
  "company",
] as const;

export function useCompany() {
  return useQuery({
    queryKey: COMPANY_QUERY_KEY,

    queryFn: async () => {
      const response =
        await companyService.getCompany();

      return response.data;
    },

    staleTime: 5 * 60 * 1000,

    refetchOnWindowFocus: false,

    retry: false,
  });
}

export function useUpdateCompany() {
  const queryClient =
    useQueryClient();

  return useMutation({
    mutationFn: (
      data: UpdateCompanyPayload
    ) =>
      companyService.updateCompany(data),

    onSuccess: async () => {
      await queryClient.invalidateQueries({
        queryKey: COMPANY_QUERY_KEY,
      });
    },
  });
}