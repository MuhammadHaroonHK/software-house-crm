"use client";

import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  CreditCard,
  Eye,
  FileText,
  Loader2,
  Pencil,
  ReceiptText,
  Send,
  Trash2,
  Clock3,
  AlertCircle,
} from "lucide-react";

import type {
  Invoice,
  InvoiceStatus,
} from "../types/invoice.types";

export interface InvoiceTablePermissions {
  canEdit: boolean;
  canManageItems: boolean;
  canSend: boolean;
  canDelete: boolean;
  canManagePayments: boolean;
}

interface InvoicesTableProps {
  invoices: Invoice[];
  isFetching?: boolean;
  search?: string;

  getPermissions: (
    invoice: Invoice,
  ) => InvoiceTablePermissions;

  onView: (invoice: Invoice) => void;
  onEdit: (invoice: Invoice) => void;
  onManageItems: (invoice: Invoice) => void;
  onSend: (invoice: Invoice) => void;
  onDelete: (invoice: Invoice) => void;
  onManagePayments: (invoice: Invoice) => void;
}

export default function InvoicesTable({
  invoices,
  isFetching = false,
  search = "",
  getPermissions,
  onView,
  onEdit,
  onManageItems,
  onSend,
  onDelete,
  onManagePayments,
}: InvoicesTableProps) {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-6 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              All Invoices
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {invoices.length}{" "}
              {invoices.length === 1
                ? "invoice"
                : "invoices"}{" "}
              shown.
            </p>
          </div>

          {isFetching && (
            <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
          )}
        </div>
      </div>

      {invoices.length === 0 ? (
        <div className="flex min-h-[320px] flex-col items-center justify-center px-6 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
            <ReceiptText className="h-6 w-6 text-slate-500" />
          </div>

          <h3 className="mt-4 text-sm font-semibold text-slate-900">
            {search ? "No invoices found" : "No invoices yet"}
          </h3>

          <p className="mt-1 max-w-sm text-sm text-slate-500">
            {search
              ? "Try changing your search or filters."
              : "Create an invoice from an accepted quotation to get started."}
          </p>
        </div>
      ) : (
        <>
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Invoice
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Client
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Due Date
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Amount
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Status
                  </th>

                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {invoices.map((invoice) => {
                  const permissions =
                    getPermissions(invoice);

                  return (
                    <tr
                      key={invoice.id}
                      className="transition hover:bg-slate-50"
                    >
                      <td className="px-6 py-4">
                        <button
                          type="button"
                          onClick={() =>
                            onView(invoice)
                          }
                          className="flex min-w-0 items-center gap-3 text-left"
                        >
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                            <FileText className="h-4 w-4 text-slate-600" />
                          </div>

                          <div className="min-w-0">
                            <p className="max-w-[180px] truncate text-sm font-medium text-slate-900">
                              {invoice.invoiceNumber}
                            </p>

                            <p className="mt-0.5 max-w-[180px] truncate text-xs text-slate-400">
                              {invoice.quotation
                                ?.quotationNumber ??
                                "No quotation"}
                            </p>
                          </div>
                        </button>
                      </td>

                      <td className="px-6 py-4">
                        <div className="min-w-0">
                          <p className="max-w-[190px] truncate text-sm text-slate-700">
                            {invoice.quotation
                              ?.client
                              ?.companyName ??
                              "Unknown client"}
                          </p>

                          <p className="mt-0.5 max-w-[190px] truncate text-xs text-slate-400">
                            {invoice.quotation
                              ?.project
                              ?.name ??
                              "No project"}
                          </p>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <CalendarDays className="h-3.5 w-3.5 text-slate-400" />
                          {formatDate(
                            invoice.dueDate,
                          )}
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <div>
                          <p className="text-sm font-semibold text-slate-900">
                            {formatCurrency(
                              invoice.totalAmount,
                            )}
                          </p>

                          <p className="mt-0.5 text-xs text-slate-400">
                            Due:{" "}
                            {formatCurrency(
                              invoice.balanceDue,
                            )}
                          </p>
                        </div>
                      </td>

                      <td className="px-6 py-4">
                        <InvoiceStatusBadge
                          status={invoice.status}
                        />
                      </td>

                      <td className="px-6 py-4">
                        <InvoiceActions
                          invoice={invoice}
                          permissions={permissions}
                          onView={onView}
                          onEdit={onEdit}
                          onManageItems={
                            onManageItems
                          }
                          onSend={onSend}
                          onDelete={onDelete}
                          onManagePayments={
                            onManagePayments
                          }
                        />
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="divide-y divide-slate-100 md:hidden">
            {invoices.map((invoice) => {
              const permissions =
                getPermissions(invoice);

              return (
                <div
                  key={invoice.id}
                  className="p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <button
                      type="button"
                      onClick={() =>
                        onView(invoice)
                      }
                      className="flex min-w-0 items-center gap-3 text-left"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                        <FileText className="h-5 w-5 text-slate-600" />
                      </div>

                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-semibold text-slate-900">
                          {invoice.invoiceNumber}
                        </h3>

                        <p className="mt-1 truncate text-xs text-slate-400">
                          {invoice.quotation
                            ?.client
                            ?.companyName ??
                            "Unknown client"}
                        </p>
                      </div>
                    </button>

                    <InvoiceActions
                      invoice={invoice}
                      permissions={permissions}
                      onView={onView}
                      onEdit={onEdit}
                      onManageItems={
                        onManageItems
                      }
                      onSend={onSend}
                      onDelete={onDelete}
                      onManagePayments={
                        onManagePayments
                      }
                    />
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <InvoiceStatusBadge
                      status={invoice.status}
                    />
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <SummaryField
                      label="Total"
                      value={formatCurrency(
                        invoice.totalAmount,
                      )}
                    />

                    <SummaryField
                      label="Balance Due"
                      value={formatCurrency(
                        invoice.balanceDue,
                      )}
                    />

                    <SummaryField
                      label="Due Date"
                      value={formatDate(
                        invoice.dueDate,
                      )}
                    />

                    <SummaryField
                      label="Quotation"
                      value={
                        invoice.quotation
                          ?.quotationNumber ??
                        "N/A"
                      }
                    />
                  </div>
                </div>
              );
            })}
          </div>
        </>
      )}
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Actions                                                                    */
/* -------------------------------------------------------------------------- */

interface InvoiceActionsProps {
  invoice: Invoice;
  permissions: InvoiceTablePermissions;

  onView: (invoice: Invoice) => void;
  onEdit: (invoice: Invoice) => void;
  onManageItems: (invoice: Invoice) => void;
  onSend: (invoice: Invoice) => void;
  onDelete: (invoice: Invoice) => void;
  onManagePayments: (invoice: Invoice) => void;
}

function InvoiceActions({
  invoice,
  permissions,
  onView,
  onEdit,
  onManageItems,
  onSend,
  onDelete,
  onManagePayments,
}: InvoiceActionsProps) {
  return (
    <div className="flex justify-end gap-1">
      <ActionButton
        label="View invoice"
        onClick={() => onView(invoice)}
        icon={<Eye className="h-4 w-4" />}
      />

      {permissions.canEdit && (
        <ActionButton
          label="Edit draft"
          onClick={() => onEdit(invoice)}
          icon={<Pencil className="h-4 w-4" />}
        />
      )}

      {permissions.canManageItems && (
        <ActionButton
          label="Manage items"
          onClick={() =>
            onManageItems(invoice)
          }
          icon={<ReceiptText className="h-4 w-4" />}
        />
      )}

      {permissions.canSend && (
        <ActionButton
          label="Send invoice"
          onClick={() => onSend(invoice)}
          icon={<Send className="h-4 w-4" />}
        />
      )}

      {permissions.canManagePayments && (
        <ActionButton
          label={
            invoice.status === "DRAFT"
              ? "Payments unavailable for draft"
              : "Manage payments"
          }
          onClick={() =>
            onManagePayments(invoice)
          }
          icon={
            <CreditCard className="h-4 w-4" />
          }
          disabled={
            invoice.status === "DRAFT"
          }
        />
      )}

      {permissions.canDelete && (
        <ActionButton
          label="Delete draft"
          onClick={() => onDelete(invoice)}
          icon={
            <Trash2 className="h-4 w-4" />
          }
          danger
        />
      )}
    </div>
  );
}

function ActionButton({
  label,
  onClick,
  icon,
  danger = false,
  disabled = false,
}: {
  label: string;
  onClick: () => void;
  icon: React.ReactNode;
  danger?: boolean;
  disabled?: boolean;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      title={label}
      aria-label={label}
      disabled={disabled}
      className={`flex h-9 w-9 items-center justify-center rounded-lg transition disabled:cursor-not-allowed disabled:opacity-40 ${
        danger
          ? "text-red-500 hover:bg-red-50 hover:text-red-700"
          : "text-slate-500 hover:bg-slate-100 hover:text-slate-900"
      }`}
    >
      {icon}
    </button>
  );
}

/* -------------------------------------------------------------------------- */
/* Status                                                                     */
/* -------------------------------------------------------------------------- */

function InvoiceStatusBadge({
  status,
}: {
  status: InvoiceStatus;
}) {
  const config =
    getStatusConfig(status);

  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${config.className}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {config.label}
    </span>
  );
}

function getStatusConfig(
  status: InvoiceStatus,
) {
  switch (status) {
    case "DRAFT":
      return {
        label: "Draft",
        icon: FileText,
        className:
          "bg-slate-100 text-slate-700",
      };

    case "SENT":
      return {
        label: "Sent",
        icon: Send,
        className:
          "bg-blue-50 text-blue-700",
      };

    case "PARTIALLY_PAID":
      return {
        label: "Partially Paid",
        icon: CreditCard,
        className:
          "bg-amber-50 text-amber-700",
      };

    case "PAID":
      return {
        label: "Paid",
        icon: CheckCircle2,
        className:
          "bg-emerald-50 text-emerald-700",
      };

    case "OVERDUE":
      return {
        label: "Overdue",
        icon: AlertCircle,
        className:
          "bg-red-50 text-red-700",
      };
  }
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function SummaryField({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 p-3">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 truncate text-sm font-medium text-slate-800">
        {value}
      </p>
    </div>
  );
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "N/A";
  }

  return new Intl.DateTimeFormat(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    },
  ).format(date);
}

function formatCurrency(
  value: string | number,
) {
  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return "PKR 0.00";
  }

  return new Intl.NumberFormat(
    "en-PK",
    {
      style: "currency",
      currency: "PKR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    },
  ).format(amount);
}