"use client";

import type {
  Company,
  UpdateCompanyPayload,
} from "@/features/company/types/company.types";

interface CompanyPreferencesFormProps {
  company: Company;
  onChange: (data: Partial<UpdateCompanyPayload>) => void;
  disabled?: boolean;
}

export default function CompanyPreferencesForm({
  company,
  onChange,
  disabled = false,
}: CompanyPreferencesFormProps) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-6 py-4">
        <h2 className="text-base font-semibold text-slate-900">
          Preferences
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Configure currency and timezone settings.
        </p>
      </div>

      <div className="grid gap-5 p-6 sm:grid-cols-2">
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Currency
          </label>

          <select
            value={company.currency}
            disabled={disabled}
            onChange={(event) =>
              onChange({
                currency: event.target.value,
              })
            }
            className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 disabled:cursor-not-allowed disabled:bg-slate-50"
          >
            <option value="PKR">
              PKR - Pakistani Rupee
            </option>

            <option value="USD">
              USD - US Dollar
            </option>

            <option value="EUR">
              EUR - Euro
            </option>

            <option value="GBP">
              GBP - British Pound
            </option>
          </select>
        </div>

        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Timezone
          </label>

          <select
            value={company.timezone}
            disabled={disabled}
            onChange={(event) =>
              onChange({
                timezone: event.target.value,
              })
            }
            className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 disabled:cursor-not-allowed disabled:bg-slate-50"
          >
            <option value="Asia/Karachi">
              Asia/Karachi
            </option>

            <option value="UTC">
              UTC
            </option>

            <option value="Asia/Dubai">
              Asia/Dubai
            </option>

            <option value="Europe/London">
              Europe/London
            </option>

            <option value="America/New_York">
              America/New_York
            </option>
          </select>
        </div>
      </div>
    </section>
  );
}