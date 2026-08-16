"use client";

import type {
  Company,
  UpdateCompanyPayload,
} from "@/features/company/types/company.types";

interface CompanyBankingFormProps {
  company: Company;
  onChange: (data: Partial<UpdateCompanyPayload>) => void;
  disabled?: boolean;
}

export default function CompanyBankingForm({
  company,
  onChange,
  disabled = false,
}: CompanyBankingFormProps) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white">
      <div className="border-b border-slate-200 px-6 py-4">
        <h2 className="text-base font-semibold text-slate-900">
          Banking & Payment Information
        </h2>

        <p className="mt-1 text-sm text-slate-500">
          Manage banking and payment details used by the company.
        </p>
      </div>

      <div className="grid gap-5 p-6 sm:grid-cols-2">
        <Field
          label="Bank Name"
          value={company.bankName ?? ""}
          disabled={disabled}
          onChange={(value) =>
            onChange({ bankName: value })
          }
        />

        <Field
          label="Account Title"
          value={company.accountTitle ?? ""}
          disabled={disabled}
          onChange={(value) =>
            onChange({ accountTitle: value })
          }
        />

        <Field
          label="Account Number"
          value={company.accountNumber ?? ""}
          disabled={disabled}
          onChange={(value) =>
            onChange({ accountNumber: value })
          }
        />

        <Field
          label="IBAN"
          value={company.iban ?? ""}
          disabled={disabled}
          onChange={(value) =>
            onChange({ iban: value })
          }
        />

        <Field
          label="EasyPaisa Number"
          value={company.easyPaisaNumber ?? ""}
          disabled={disabled}
          onChange={(value) =>
            onChange({ easyPaisaNumber: value })
          }
        />

        <Field
          label="JazzCash Number"
          value={company.jazzCashNumber ?? ""}
          disabled={disabled}
          onChange={(value) =>
            onChange({ jazzCashNumber: value })
          }
        />
      </div>
    </section>
  );
}

interface FieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  disabled?: boolean;
}

function Field({
  label,
  value,
  onChange,
  disabled = false,
}: FieldProps) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}
      </label>

      <input
        type="text"
        value={value}
        disabled={disabled}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500 disabled:cursor-not-allowed disabled:bg-slate-50"
      />
    </div>
  );
}