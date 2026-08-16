"use client";

import type {
  Company,
  UpdateCompanyPayload,
} from "@/features/company/types/company.types";

interface CompanyGeneralFormProps {
  company: Company;
  errors?: Record<string, string>;
  onChange: (
    data: Partial<UpdateCompanyPayload>
  ) => void;
  disabled?: boolean;
}

export default function CompanyGeneralForm({
  company,
  errors = {},
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
          error={errors.companyName}
          disabled={disabled}
          onChange={(value) =>
            onChange({
              companyName: value,
            })
          }
        />

        <Field
          label="Company Email"
          type="email"
          required
          value={company.companyEmail}
          error={errors.companyEmail}
          disabled={disabled}
          onChange={(value) =>
            onChange({
              companyEmail: value,
            })
          }
        />

        <Field
          label="Company Phone"
          value={company.companyPhone ?? ""}
          error={errors.companyPhone}
          disabled={disabled}
          onChange={(value) =>
            onChange({
              companyPhone: value,
            })
          }
        />

        <Field
          label="Website"
          type="url"
          value={company.website ?? ""}
          error={errors.website}
          disabled={disabled}
          onChange={(value) =>
            onChange({
              website: value,
            })
          }
          placeholder="https://example.com"
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
                companyAddress:
                  event.target.value,
              })
            }
            rows={3}
            className={`w-full rounded-lg border bg-white px-3 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:ring-1 disabled:cursor-not-allowed disabled:bg-slate-50 ${
              errors.companyAddress
                ? "border-red-400 focus:border-red-500 focus:ring-red-500"
                : "border-slate-300 focus:border-slate-500 focus:ring-slate-500"
            }`}
          />

          {errors.companyAddress && (
            <p className="mt-1 text-xs text-red-500">
              {errors.companyAddress}
            </p>
          )}
        </div>

        <Field
          label="Logo URL"
          value={company.logo ?? ""}
          error={errors.logo}
          disabled={disabled}
          onChange={(value) =>
            onChange({
              logo: value,
            })
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
  error?: string;
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required = false,
  disabled = false,
  placeholder,
  error,
}: FieldProps) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}{" "}
        {required && (
          <span className="text-red-500">
            *
          </span>
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
        className={`h-10 w-full rounded-lg border bg-white px-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:ring-1 disabled:cursor-not-allowed disabled:bg-slate-50 ${
          error
            ? "border-red-400 focus:border-red-500 focus:ring-red-500"
            : "border-slate-300 focus:border-slate-500 focus:ring-slate-500"
        }`}
      />

      {error && (
        <p className="mt-1 text-xs text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}