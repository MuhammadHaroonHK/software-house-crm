"use client";

import type {
  Company,
  UpdateCompanyPayload,
} from "@/features/company/types/company.types";

interface CompanyPreferencesFormProps {
  company: Company;
  errors?: Record<string, string>;
  onChange: (
    data: Partial<UpdateCompanyPayload>
  ) => void;
  disabled?: boolean;
}

export default function CompanyPreferencesForm({
  company,
  errors = {},
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
        <SelectField
          label="Currency"
          value={company.currency}
          error={errors.currency}
          disabled={disabled}
          onChange={(value) =>
            onChange({ currency: value })
          }
          options={[
            ["PKR", "PKR - Pakistani Rupee"],
            ["USD", "USD - US Dollar"],
            ["EUR", "EUR - Euro"],
            ["GBP", "GBP - British Pound"],
          ]}
        />

        <SelectField
          label="Timezone"
          value={company.timezone}
          error={errors.timezone}
          disabled={disabled}
          onChange={(value) =>
            onChange({ timezone: value })
          }
          options={[
            ["Asia/Karachi", "Asia/Karachi"],
            ["UTC", "UTC"],
            ["Asia/Dubai", "Asia/Dubai"],
            ["Europe/London", "Europe/London"],
            [
              "America/New_York",
              "America/New_York",
            ],
          ]}
        />
      </div>
    </section>
  );
}

interface SelectFieldProps {
  label: string;
  value: string;
  options: [string, string][];
  onChange: (value: string) => void;
  disabled?: boolean;
  error?: string;
}

function SelectField({
  label,
  value,
  options,
  onChange,
  disabled = false,
  error,
}: SelectFieldProps) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
      </label>

      <select
        value={value}
        disabled={disabled}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className={`h-10 w-full rounded-lg border bg-white px-3 text-sm text-slate-900 outline-none focus:ring-1 disabled:cursor-not-allowed disabled:bg-slate-50 ${
          error
            ? "border-red-400 focus:border-red-500 focus:ring-red-500"
            : "border-slate-300 focus:border-slate-500 focus:ring-slate-500"
        }`}
      >
        {options.map(([optionValue, label]) => (
          <option
            key={optionValue}
            value={optionValue}
          >
            {label}
          </option>
        ))}
      </select>

      {error && (
        <p className="mt-1 text-xs text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}