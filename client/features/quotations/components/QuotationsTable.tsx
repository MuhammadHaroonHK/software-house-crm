"use client";

import {
  CheckCircle2,
  Clock3,
  Edit3,
  Eye,
  FileText,
  FileWarning,
  Loader2,
  Send,
  Trash2,
  XCircle,
} from "lucide-react";

import type {
  Quotation,
  QuotationStatus,
} from "../types/quotation.types";

export interface QuotationTablePermissions {
  canEdit: boolean;
  canSend: boolean;
  canAccept: boolean;
  canReject: boolean;
  canExpire: boolean;
  canDelete: boolean;
  canManageItems: boolean;
}

interface QuotationsTableProps {
  quotations: Quotation[];
  isFetching?: boolean;
  search?: string;

  getPermissions: (
    quotation: Quotation
  ) => QuotationTablePermissions;

  onView: (quotation: Quotation) => void;
  onEdit: (quotation: Quotation) => void;
  onManageItems: (
    quotation: Quotation
  ) => void;
  onAction: (
    quotation: Quotation,
    action:
      | "SEND"
      | "ACCEPT"
      | "REJECT"
      | "EXPIRE"
      | "DELETE"
  ) => void;
}

export default function QuotationsTable({
  quotations,
  isFetching = false,
  search = "",
  getPermissions,
  onView,
  onEdit,
  onManageItems,
  onAction,
}: QuotationsTableProps) {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="border-b border-slate-200 px-6 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              All Quotations
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {quotations.length}{" "}
              {quotations.length ===
              1
                ? "quotation"
                : "quotations"}{" "}
              shown.
            </p>
          </div>

          {isFetching && (
            <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
          )}
        </div>
      </div>

      {quotations.length === 0 ? (
        <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
            <FileText className="h-6 w-6 text-slate-500" />
          </div>

          <h3 className="mt-4 text-sm font-semibold text-slate-900">
            {search
              ? "No quotations found"
              : "No quotations yet"}
          </h3>

          <p className="mt-1 max-w-sm text-sm text-slate-500">
            {search
              ? "Try changing your search or filters."
              : "Create your first quotation to get started."}
          </p>
        </div>
      ) : (
        <>
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Quotation
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Client
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Project
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Dates
                  </th>

                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Total
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
                {quotations.map(
                  (quotation) => (
                    <tr
                      key={
                        quotation.id
                      }
                      className="transition hover:bg-slate-50"
                    >
                      <td className="px-6 py-4">
                        <button
                          type="button"
                          onClick={() =>
                            onView(
                              quotation
                            )
                          }
                          className="flex min-w-0 items-center gap-3 text-left"
                        >
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                            <FileText className="h-4 w-4 text-slate-600" />
                          </div>

                          <div className="min-w-0">
                            <p className="truncate text-sm font-medium text-slate-900 hover:text-slate-700">
                              {
                                quotation.quotationNumber
                              }
                            </p>

                            <p className="mt-0.5 text-xs text-slate-400">
                              Issued{" "}
                              {formatDate(
                                quotation.issueDate
                              )}
                            </p>
                          </div>
                        </button>
                      </td>

                      <td className="px-6 py-4">
                        <span className="max-w-[180px] truncate text-sm text-slate-600">
                          {quotation.client
                            ?.companyName ??
                            "No client"}
                        </span>
                      </td>

                      <td className="px-6 py-4">
                        {quotation.project ? (
                          <span className="max-w-[180px] truncate text-sm text-slate-600">
                            {
                              quotation
                                .project
                                .name
                            }
                          </span>
                        ) : (
                          <span className="text-sm text-slate-400">
                            No project
                          </span>
                        )}
                      </td>

                      <td className="px-6 py-4">
                        <div className="space-y-1">
                          <p className="text-xs text-slate-500">
                            Issue:{" "}
                            {formatDate(
                              quotation.issueDate
                            )}
                          </p>

                          <p className="text-xs text-slate-400">
                            Expiry:{" "}
                            {quotation.expiryDate
                              ? formatDate(
                                  quotation.expiryDate
                                )
                              : "None"}
                          </p>
                        </div>
                      </td>

                      <td className="px-6 py-4 text-right">
                        <p className="text-sm font-semibold text-slate-900">
                          {formatCurrency(
                            quotation.totalAmount
                          )}
                        </p>
                      </td>

                      <td className="px-6 py-4">
                        <QuotationStatusBadge
                          status={
                            quotation.status
                          }
                        />
                      </td>

                      <td className="px-6 py-4">
                        <QuotationActions
                          quotation={
                            quotation
                          }
                          permissions={getPermissions(
                            quotation
                          )}
                          onView={
                            onView
                          }
                          onEdit={
                            onEdit
                          }
                          onManageItems={
                            onManageItems
                          }
                          onAction={
                            onAction
                          }
                        />
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>

          <div className="divide-y divide-slate-100 md:hidden">
            {quotations.map(
              (quotation) => (
                <div
                  key={
                    quotation.id
                  }
                  className="p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <button
                      type="button"
                      onClick={() =>
                        onView(
                          quotation
                        )
                      }
                      className="flex min-w-0 items-center gap-3 text-left"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                        <FileText className="h-5 w-5 text-slate-600" />
                      </div>

                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-semibold text-slate-900">
                          {
                            quotation.quotationNumber
                          }
                        </h3>

                        <p className="mt-1 truncate text-xs text-slate-400">
                          {quotation.client
                            ?.companyName ??
                            "No client"}
                        </p>
                      </div>
                    </button>

                    <QuotationActions
                      quotation={
                        quotation
                      }
                      permissions={getPermissions(
                        quotation
                      )}
                      onView={
                        onView
                      }
                      onEdit={
                        onEdit
                      }
                      onManageItems={
                        onManageItems
                      }
                      onAction={
                        onAction
                      }
                    />
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <QuotationStatusBadge
                      status={
                        quotation.status
                      }
                    />

                    <span className="text-sm font-semibold text-slate-800">
                      {formatCurrency(
                        quotation.totalAmount
                      )}
                    </span>
                  </div>

                  <div className="mt-4 grid grid-cols-2 gap-3">
                    <InfoCard
                      label="Project"
                      value={
                        quotation.project
                          ?.name ??
                        "No project"
                      }
                    />

                    <InfoCard
                      label="Expiry"
                      value={
                        quotation.expiryDate
                          ? formatDate(
                              quotation.expiryDate
                            )
                          : "None"
                      }
                    />
                  </div>
                </div>
              )
            )}
          </div>
        </>
      )}
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Actions                                                                    */
/* -------------------------------------------------------------------------- */

function QuotationActions({
  quotation,
  permissions,
  onView,
  onEdit,
  onManageItems,
  onAction,
}: {
  quotation: Quotation;
  permissions: QuotationTablePermissions;

  onView: (quotation: Quotation) => void;
  onEdit: (quotation: Quotation) => void;
  onManageItems: (
    quotation: Quotation
  ) => void;

  onAction: (
    quotation: Quotation,
    action:
      | "SEND"
      | "ACCEPT"
      | "REJECT"
      | "EXPIRE"
      | "DELETE"
  ) => void;
}) {
  return (
    <div className="flex justify-end gap-1">
      <button
        type="button"
        onClick={() =>
          onView(quotation)
        }
        className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900"
        title="View quotation"
      >
        <Eye className="h-4 w-4" />
      </button>

      {permissions.canManageItems && (
        <button
          type="button"
          onClick={() =>
            onManageItems(
              quotation
            )
          }
          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900"
          title="Manage quotation items"
        >
          <FileWarning className="h-4 w-4" />
        </button>
      )}

      {permissions.canEdit && (
        <button
          type="button"
          onClick={() =>
            onEdit(quotation)
          }
          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900"
          title="Edit quotation"
        >
          <Edit3 className="h-4 w-4" />
        </button>
      )}

      {permissions.canSend && (
        <button
          type="button"
          onClick={() =>
            onAction(
              quotation,
              "SEND"
            )
          }
          className="flex h-9 w-9 items-center justify-center rounded-lg text-blue-600 hover:bg-blue-50 hover:text-blue-700"
          title="Send quotation"
        >
          <Send className="h-4 w-4" />
        </button>
      )}

      {permissions.canAccept && (
        <button
          type="button"
          onClick={() =>
            onAction(
              quotation,
              "ACCEPT"
            )
          }
          className="flex h-9 w-9 items-center justify-center rounded-lg text-emerald-600 hover:bg-emerald-50 hover:text-emerald-700"
          title="Accept quotation"
        >
          <CheckCircle2 className="h-4 w-4" />
        </button>
      )}

      {permissions.canReject && (
        <button
          type="button"
          onClick={() =>
            onAction(
              quotation,
              "REJECT"
            )
          }
          className="flex h-9 w-9 items-center justify-center rounded-lg text-red-500 hover:bg-red-50 hover:text-red-700"
          title="Reject quotation"
        >
          <XCircle className="h-4 w-4" />
        </button>
      )}

      {permissions.canExpire && (
        <button
          type="button"
          onClick={() =>
            onAction(
              quotation,
              "EXPIRE"
            )
          }
          className="flex h-9 w-9 items-center justify-center rounded-lg text-amber-600 hover:bg-amber-50 hover:text-amber-700"
          title="Mark quotation expired"
        >
          <Clock3 className="h-4 w-4" />
        </button>
      )}

      {permissions.canDelete && (
        <button
          type="button"
          onClick={() =>
            onAction(
              quotation,
              "DELETE"
            )
          }
          className="flex h-9 w-9 items-center justify-center rounded-lg text-red-500 hover:bg-red-50 hover:text-red-700"
          title="Delete quotation"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Status                                                                     */
/* -------------------------------------------------------------------------- */

function QuotationStatusBadge({
  status,
}: {
  status: QuotationStatus;
}) {
  const config =
    getStatusConfig(status);

  const Icon =
    config.icon;

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
  status: QuotationStatus
) {
  switch (status) {
    case "DRAFT":
      return {
        label: "Draft",
        icon: Edit3,
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

    case "ACCEPTED":
      return {
        label: "Accepted",
        icon: CheckCircle2,
        className:
          "bg-emerald-50 text-emerald-700",
      };

    case "REJECTED":
      return {
        label: "Rejected",
        icon: XCircle,
        className:
          "bg-red-50 text-red-700",
      };

    case "EXPIRED":
      return {
        label: "Expired",
        icon: Clock3,
        className:
          "bg-amber-50 text-amber-700",
      };
  }
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function InfoCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg bg-slate-50 p-3">
      <p className="text-[11px] uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 truncate text-sm font-medium text-slate-700">
        {value}
      </p>
    </div>
  );
}

function formatDate(
  value: string
) {
  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "N/A";
  }

  return new Intl.DateTimeFormat(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    }
  ).format(date);
}

function formatCurrency(
  value: string | number
) {
  const amount =
    Number(value);

  if (
    !Number.isFinite(
      amount
    )
  ) {
    return "PKR 0.00";
  }

  return new Intl.NumberFormat(
    "en-PK",
    {
      style: "currency",
      currency: "PKR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    }
  ).format(amount);
}