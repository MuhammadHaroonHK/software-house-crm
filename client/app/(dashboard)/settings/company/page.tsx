"use client";

import { useEffect, useState } from "react";

import DashboardLayout from "@/components/dashboard/DashboardLayout";

import { useCurrentUser } from "@/features/auth/hooks/useAuth";

import {
  useCompany,
  useUpdateCompany,
} from "@/features/company/hooks/useCompany";

import type {
  Company,
  UpdateCompanyPayload,
} from "@/features/company/types/company.types";

import CompanyGeneralForm from "@/components/company/CompanyGeneralForm";
import CompanyBankingForm from "@/components/company/CompanyBankingForm";
import CompanyPreferencesForm from "@/components/company/CompanyPreferencesForm";

export default function CompanySettingsPage() {
  const {
    data: currentUser,
    isLoading: currentUserLoading,
  } = useCurrentUser();

  const {
    data: company,
    isLoading: companyLoading,
    isError: companyError,
    error: companyQueryError,
  } = useCompany();

  const updateMutation = useUpdateCompany();

  const [form, setForm] =
    useState<Company | null>(null);

  const [saveError, setSaveError] =
    useState<string | null>(null);

  const [successMessage, setSuccessMessage] =
    useState<string | null>(null);

  /*
   * Keep local form state synchronized
   * with the company returned by the API.
   */
  useEffect(() => {
    if (company) {
      setForm(company);
    }
  }, [company]);

  /*
   * Update only the changed fields.
   */
  const handleChange = (
    changes: Partial<UpdateCompanyPayload>
  ) => {
    setForm((current) => {
      if (!current) {
        return current;
      }

      return {
        ...current,
        ...changes,
      };
    });

    setSaveError(null);
    setSuccessMessage(null);
  };

  /*
   * Extract a useful error message from
   * the Axios/backend response.
   */
  const getErrorMessage = (
    error: unknown
  ): string => {
    if (
      typeof error === "object" &&
      error !== null &&
      "response" in error
    ) {
      const response = (
        error as {
          response?: {
            data?: {
              message?: string;
            };
          };
        }
      ).response;

      if (response?.data?.message) {
        return response.data.message;
      }
    }

    if (error instanceof Error) {
      return error.message;
    }

    return "Something went wrong. Please try again.";
  };

  /*
   * Save company settings.
   */
  const handleSave = async () => {
    if (!form) {
      return;
    }

    setSaveError(null);
    setSuccessMessage(null);

    const payload: UpdateCompanyPayload = {
      companyName:
        form.companyName.trim(),

      companyEmail:
        form.companyEmail.trim(),

      companyPhone:
        form.companyPhone?.trim() || undefined,

      companyAddress:
        form.companyAddress?.trim() || undefined,

      website:
        form.website?.trim() || undefined,

      logo:
        form.logo?.trim() || undefined,

      bankName:
        form.bankName?.trim() || undefined,

      accountTitle:
        form.accountTitle?.trim() || undefined,

      accountNumber:
        form.accountNumber?.trim() || undefined,

      iban:
        form.iban?.trim() || undefined,

      easyPaisaNumber:
        form.easyPaisaNumber?.trim() || undefined,

      jazzCashNumber:
        form.jazzCashNumber?.trim() || undefined,

      currency:
        form.currency.trim(),

      timezone:
        form.timezone.trim(),
    };

    try {
      const response =
        await updateMutation.mutateAsync(
          payload
        );

      /*
       * Use the backend response as the
       * latest source of truth.
       */
      if (response.data) {
        setForm(response.data);
      }

      setSuccessMessage(
        response.message ||
          "Company settings updated successfully."
      );
    } catch (error) {
      setSaveError(
        getErrorMessage(error)
      );
    }
  };

  /*
   * Current user loading.
   */
  if (currentUserLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-sm text-slate-500">
          Loading...
        </div>
      </main>
    );
  }

  /*
   * Authentication guard.
   */
  if (!currentUser) {
    return null;
  }

  /*
   * Company loading.
   */
  if (companyLoading) {
    return (
      <DashboardLayout user={currentUser}>
        <div className="flex min-h-[400px] items-center justify-center">
          <div className="text-sm text-slate-500">
            Loading company settings...
          </div>
        </div>
      </DashboardLayout>
    );
  }

  /*
   * Company fetch error.
   */
  if (companyError || !company || !form) {
    return (
      <DashboardLayout user={currentUser}>
        <div className="rounded-xl border border-red-200 bg-red-50 p-5">
          <h2 className="text-sm font-semibold text-red-700">
            Failed to load company settings
          </h2>

          <p className="mt-1 text-sm text-red-600">
            {getErrorMessage(
              companyQueryError
            )}
          </p>
        </div>
      </DashboardLayout>
    );
  }

  const isSaving =
    updateMutation.isPending;

  return (
    <DashboardLayout user={currentUser}>
      <div className="space-y-6">
        {/* Page Header */}
        <div>
          <h1 className="text-xl font-semibold text-slate-900">
            Company Settings
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Manage your company information,
            banking details, and preferences.
          </p>
        </div>

        {/* Backend validation / save error */}
        {saveError && (
          <div className="rounded-xl border border-red-200 bg-red-50 px-5 py-4">
            <p className="text-sm font-medium text-red-700">
              Unable to save changes
            </p>

            <p className="mt-1 text-sm text-red-600">
              {saveError}
            </p>
          </div>
        )}

        {/* Success message */}
        {successMessage && (
          <div className="rounded-xl border border-green-200 bg-green-50 px-5 py-4">
            <p className="text-sm font-medium text-green-700">
              {successMessage}
            </p>
          </div>
        )}

        {/* General Information */}
        <CompanyGeneralForm
          company={form}
          onChange={handleChange}
          disabled={isSaving}
        />

        {/* Banking Information */}
        <CompanyBankingForm
          company={form}
          onChange={handleChange}
          disabled={isSaving}
        />

        {/* Preferences */}
        <CompanyPreferencesForm
          company={form}
          onChange={handleChange}
          disabled={isSaving}
        />

        {/* Save Button */}
        <div className="flex justify-end">
          <button
            type="button"
            onClick={handleSave}
            disabled={isSaving}
            className="rounded-lg bg-slate-900 px-5 py-2.5 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSaving
              ? "Saving..."
              : "Save Changes"}
          </button>
        </div>
      </div>
    </DashboardLayout>
  );
}