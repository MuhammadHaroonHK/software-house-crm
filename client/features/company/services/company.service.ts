import api from "@/lib/api";

import type {
  ApiResponse,
  Company,
  UpdateCompanyPayload,
} from "../types/company.types";

export const companyService = {
  async getCompany(): Promise<ApiResponse<Company>> {
    const response =
      await api.get<ApiResponse<Company>>(
        "/company"
      );

    return response.data;
  },

  async updateCompany(
    payload: UpdateCompanyPayload
  ): Promise<ApiResponse<Company>> {
    const response =
      await api.patch<ApiResponse<Company>>(
        "/company",
        payload
      );

    return response.data;
  },
};