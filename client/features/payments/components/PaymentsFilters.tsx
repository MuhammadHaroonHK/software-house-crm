"use client";

import { RotateCcw } from "lucide-react";

import type {
  PaymentInvoice,
  PaymentMethod,
  PaymentStatus,
} from "@/features/payments/types/payment.types";

interface PaymentsFiltersProps {
  invoices: PaymentInvoice[];

  invoiceId: string;
  status: PaymentStatus | "";
  paymentMethod: PaymentMethod | "";

  onInvoiceChange: (
    value: string,
  ) => void;

  onStatusChange: (
    value: PaymentStatus | "",
  ) => void;

  onPaymentMethodChange: (
    value: PaymentMethod | "",
  ) => void;

  onReset: () => void;
}

const STATUS_OPTIONS: {
  value: PaymentStatus;
  label: string;
}[] = [
  {
    value: "PENDING",
    label: "Pending",
  },
  {
    value: "COMPLETED",
    label: "Completed",
  },
  {
    value: "FAILED",
    label: "Failed",
  },
  {
    value: "REFUNDED",
    label: "Refunded",
  },
];

const PAYMENT_METHOD_OPTIONS: {
  value: PaymentMethod;
  label: string;
}[] = [
  {
    value: "BANK_TRANSFER",
    label: "Bank Transfer",
  },
  {
    value: "EASYPAISA",
    label: "EasyPaisa",
  },
  {
    value: "JAZZCASH",
    label: "JazzCash",
  },
  {
    value: "CASH",
    label: "Cash",
  },
];

export default function PaymentsFilters({
  invoices,
  invoiceId,
  status,
  paymentMethod,
  onInvoiceChange,
  onStatusChange,
  onPaymentMethodChange,
  onReset,
}: PaymentsFiltersProps) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
        <div className="flex-1">
          <label
            htmlFor="paymentInvoiceFilter"
            className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500"
          >
            Invoice
          </label>

          <select
            id="paymentInvoiceFilter"
            value={invoiceId}
            onChange={(event) =>
              onInvoiceChange(
                event.target.value,
              )
            }
            className={selectClass()}
          >
            <option value="">
              All invoices
            </option>

            {invoices.map((invoice) => (
              <option
                key={invoice.id}
                value={invoice.id}
              >
                {invoice.invoiceNumber}
              </option>
            ))}
          </select>
        </div>

        <div className="flex-1">
          <label
            htmlFor="paymentStatusFilter"
            className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500"
          >
            Status
          </label>

          <select
            id="paymentStatusFilter"
            value={status}
            onChange={(event) =>
              onStatusChange(
                event.target.value as
                  | PaymentStatus
                  | "",
              )
            }
            className={selectClass()}
          >
            <option value="">
              All statuses
            </option>

            {STATUS_OPTIONS.map(
              (option) => (
                <option
                  key={option.value}
                  value={option.value}
                >
                  {option.label}
                </option>
              ),
            )}
          </select>
        </div>

        <div className="flex-1">
          <label
            htmlFor="paymentMethodFilter"
            className="mb-1.5 block text-xs font-medium uppercase tracking-wide text-slate-500"
          >
            Method
          </label>

          <select
            id="paymentMethodFilter"
            value={paymentMethod}
            onChange={(event) =>
              onPaymentMethodChange(
                event.target.value as
                  | PaymentMethod
                  | "",
              )
            }
            className={selectClass()}
          >
            <option value="">
              All methods
            </option>

            {PAYMENT_METHOD_OPTIONS.map(
              (option) => (
                <option
                  key={option.value}
                  value={option.value}
                >
                  {option.label}
                </option>
              ),
            )}
          </select>
        </div>

        <button
          type="button"
          onClick={onReset}
          className="inline-flex items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
        >
          <RotateCcw className="h-4 w-4" />
          Reset
        </button>
      </div>
    </section>
  );
}

function selectClass() {
  return "w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200";
}