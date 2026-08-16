"use client";

import type { Company, UpdateCompanyPayload } from "@/features/company/types/company.types";

interface CompanyGeneralFormProps {
  company: Company;
  onChange: (data: Partial<UpdateCompanyPayload>) => void;
  disabled?: boolean;
}

export default function CompanyGeneralForm({
  company,
  onChange,
  disabled = false,
}: CompanyGeneralFormProps) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-6 py-4">
        <h2 className="text-base font-semibold text-slate-900">
          General Information
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Manage your company&apos;s basic information.
        </p>
      </div>

      <div className="grid gap-5 p-6 sm:grid-cols-2">
        <Field
          label="Company Name"
          required
          value={company.companyName}
          disabled={disabled}
          onChange={(value) =>
            onChange({ companyName: value })
          }
        />

        <Field
          label="Company Email"
          type="email"
          required
          value={company.companyEmail}
          disabled={disabled}
          onChange={(value) =>
            onChange({ companyEmail: value })
          }
        />

        <Field
          label="Company Phone"
          value={company.companyPhone ?? ""}
          disabled={disabled}
          onChange={(value) =>
            onChange({ companyPhone: value })
          }
        />

        <Field
          label="Website"
          type="url"
          value={company.website ?? ""}
          disabled={disabled}
          onChange={(value) =>
            onChange({ website: value })
          }
        />

        <div className="sm:col-span-2">
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Company Address
          </label>

          <textarea
            value={company.companyAddress ?? ""}
            disabled={disabled}
            onChange={(event) =>
              onChange({
                companyAddress: event.target.value,
              })
            }
            rows={3}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 disabled:cursor-not-allowed disabled:bg-slate-50"
          />
        </div>

        <Field
          label="Logo URL"
          value={company.logo ?? ""}
          disabled={disabled}
          onChange={(value) =>
            onChange({ logo: value })
          }
          placeholder="https://..."
        />
      </div>
    </section>
  );
}

interface FieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required = false,
  disabled = false,
  placeholder,
}: FieldProps) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}{" "}
        {required && (
          <span className="text-red-500">*</span>
        )}
      </label>

      <input
        type={type}
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:border-slate-500 focus:ring-1 focus:ring-slate-500 disabled:cursor-not-allowed disabled:bg-slate-50"
      />
    </div>
  );
}