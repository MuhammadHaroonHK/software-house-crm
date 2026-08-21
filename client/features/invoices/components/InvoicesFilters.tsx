"use client";

import { RotateCcw } from "lucide-react";

import type {
  Invoice,
  InvoiceStatus,
} from "../types/invoice.types";

interface InvoiceQuotationOption {
  id: string;
  quotationNumber: string;
  client?: {
    companyName: string;
  };
}

interface InvoicesFiltersProps {
  quotations: InvoiceQuotationOption[];

  quotationId: string;
  status: InvoiceStatus | "";

  onQuotationChange: (value: string) => void;
  onStatusChange: (value: InvoiceStatus | "") => void;
  onReset: () => void;
}

const statuses: {
  value: InvoiceStatus;
  label: string;
}[] = [
  { value: "DRAFT", label: "Draft" },
  { value: "SENT", label: "Sent" },
  { value: "PARTIALLY_PAID", label: "Partially Paid" },
  { value: "PAID", label: "Paid" },
  { value: "OVERDUE", label: "Overdue" },
];

export default function InvoicesFilters({
  quotations,
  quotationId,
  status,
  onQuotationChange,
  onStatusChange,
  onReset,
}: InvoicesFiltersProps) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
        <div className="flex-1">
          <label
            htmlFor="invoiceQuotationFilter"
            className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-400"
          >
            Quotation
          </label>

          <select
            id="invoiceQuotationFilter"
            value={quotationId}
            onChange={(event) =>
              onQuotationChange(event.target.value)
            }
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          >
            <option value="">All quotations</option>

            {quotations.map((quotation) => (
              <option
                key={quotation.id}
                value={quotation.id}
              >
                {quotation.quotationNumber}
                {quotation.client?.companyName
                  ? ` — ${quotation.client.companyName}`
                  : ""}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1">
          <label
            htmlFor="invoiceStatusFilter"
            className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-400"
          >
            Status
          </label>

          <select
            id="invoiceStatusFilter"
            value={status}
            onChange={(event) =>
              onStatusChange(
                event.target.value as InvoiceStatus | "",
              )
            }
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          >
            <option value="">All statuses</option>

            {statuses.map((item) => (
              <option
                key={item.value}
                value={item.value}
              >
                {item.label}
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-end">
          <button
            type="button"
            onClick={onReset}
            className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 lg:w-auto"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </button>
        </div>
      </div>
    </section>
  );
}