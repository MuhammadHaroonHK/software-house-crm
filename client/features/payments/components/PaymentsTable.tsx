"use client";

import {
  Banknote,
  CheckCircle2,
  Clock3,
  Eye,
  Loader2,
  XCircle,
} from "lucide-react";

import type {
  Payment,
  PaymentMethod,
  PaymentStatus,
} from "@/features/payments/types/payment.types";

export interface PaymentTablePermissions {
  canVerify: boolean;
  canReject: boolean;
  canView: boolean;
  canCreate: boolean;
}

interface PaymentsTableProps {
  payments: Payment[];
  isFetching?: boolean;
  search?: string;

  getPermissions: (
    payment: Payment,
  ) => PaymentTablePermissions;

  onView: (
    payment: Payment,
  ) => void;

  onVerify: (
    payment: Payment,
  ) => void;

  onReject: (
    payment: Payment,
  ) => void;
}

export default function PaymentsTable({
  payments,
  isFetching = false,
  search = "",
  getPermissions,
  onView,
  onVerify,
  onReject,
}: PaymentsTableProps) {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="flex items-center justify-between border-b border-slate-200 px-6 py-5">
        <div>
          <h2 className="text-lg font-semibold text-slate-900">
            Payment Records
          </h2>

          <p className="mt-1 text-sm text-slate-500">
            {payments.length}{" "}
            {payments.length === 1
              ? "payment"
              : "payments"}{" "}
            shown.
          </p>
        </div>

        {isFetching && (
          <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
        )}
      </div>

      {payments.length === 0 ? (
        <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
            <Banknote className="h-6 w-6 text-slate-500" />
          </div>

          <h3 className="mt-4 text-sm font-semibold text-slate-900">
            {search
              ? "No payments found"
              : "No payments yet"}
          </h3>

          <p className="mt-1 max-w-sm text-sm text-slate-500">
            {search
              ? "Try changing your search or filters."
              : "Payment records will appear here."}
          </p>
        </div>
      ) : (
        <>
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <TableHeader>
                    Payment
                  </TableHeader>

                  <TableHeader>
                    Invoice
                  </TableHeader>

                  <TableHeader>
                    Client
                  </TableHeader>

                  <TableHeader>
                    Amount
                  </TableHeader>

                  <TableHeader>
                    Method
                  </TableHeader>

                  <TableHeader>
                    Status
                  </TableHeader>

                  <TableHeader align="right">
                    Actions
                  </TableHeader>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {payments.map(
                  (payment) => {
                    const permissions =
                      getPermissions(
                        payment,
                      );

                    return (
                      <tr
                        key={payment.id}
                        className="transition hover:bg-slate-50"
                      >
                        <td className="px-6 py-4">
                          <button
                            type="button"
                            onClick={() =>
                              onView(
                                payment,
                              )
                            }
                            className="flex min-w-0 items-center gap-3 text-left"
                          >
                            <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                              <Banknote className="h-4 w-4 text-slate-600" />
                            </div>

                            <div className="min-w-0">
                              <p className="max-w-[180px] truncate text-sm font-medium text-slate-900">
                                {formatCurrency(
                                  payment.amount,
                                )}
                              </p>

                              <p className="mt-0.5 max-w-[180px] truncate text-xs text-slate-400">
                                {formatDate(
                                  payment.paymentDate ??
                                    payment.createdAt,
                                )}
                              </p>
                            </div>
                          </button>
                        </td>

                        <td className="px-6 py-4">
                          <p className="text-sm font-medium text-slate-800">
                            {
                              payment
                                .invoice
                                .invoiceNumber
                            }
                          </p>

                          <p className="mt-0.5 text-xs text-slate-400">
                            {
                              payment
                                .invoice
                                .quotation
                                .quotationNumber
                            }
                          </p>
                        </td>

                        <td className="px-6 py-4">
                          <p className="max-w-[180px] truncate text-sm text-slate-700">
                            {
                              payment
                                .invoice
                                .quotation
                                .client
                                .companyName
                            }
                          </p>

                          <p className="mt-0.5 max-w-[180px] truncate text-xs text-slate-400">
                            {
                              payment
                                .invoice
                                .quotation
                                .project
                                ?.name ??
                              "No project"
                            }
                          </p>
                        </td>

                        <td className="px-6 py-4">
                          <p className="text-sm font-semibold text-slate-900">
                            {formatCurrency(
                              payment.amount,
                            )}
                          </p>
                        </td>

                        <td className="px-6 py-4">
                          <span className="text-sm text-slate-600">
                            {formatPaymentMethod(
                              payment.paymentMethod,
                            )}
                          </span>
                        </td>

                        <td className="px-6 py-4">
                          <PaymentStatusBadge
                            status={
                              payment.status
                            }
                          />
                        </td>

                        <td className="px-6 py-4">
                          <PaymentActions
                            payment={payment}
                            permissions={
                              permissions
                            }
                            onView={
                              onView
                            }
                            onVerify={
                              onVerify
                            }
                            onReject={
                              onReject
                            }
                          />
                        </td>
                      </tr>
                    );
                  },
                )}
              </tbody>
            </table>
          </div>

          <div className="divide-y divide-slate-100 md:hidden">
            {payments.map(
              (payment) => {
                const permissions =
                  getPermissions(
                    payment,
                  );

                return (
                  <div
                    key={payment.id}
                    className="p-4"
                  >
                    <div className="flex items-start justify-between gap-4">
                      <button
                        type="button"
                        onClick={() =>
                          onView(
                            payment,
                          )
                        }
                        className="flex min-w-0 items-center gap-3 text-left"
                      >
                        <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                          <Banknote className="h-5 w-5 text-slate-600" />
                        </div>

                        <div className="min-w-0">
                          <h3 className="truncate text-sm font-semibold text-slate-900">
                            {formatCurrency(
                              payment.amount,
                            )}
                          </h3>

                          <p className="mt-1 truncate text-xs text-slate-400">
                            {
                              payment
                                .invoice
                                .invoiceNumber
                            }
                          </p>
                        </div>
                      </button>

                      <PaymentActions
                        payment={payment}
                        permissions={
                          permissions
                        }
                        onView={onView}
                        onVerify={
                          onVerify
                        }
                        onReject={
                          onReject
                        }
                      />
                    </div>

                    <div className="mt-4 flex flex-wrap items-center gap-2">
                      <PaymentStatusBadge
                        status={
                          payment.status
                        }
                      />

                      <span className="rounded-full bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-600">
                        {formatPaymentMethod(
                          payment.paymentMethod,
                        )}
                      </span>
                    </div>

                    <div className="mt-4 grid grid-cols-2 gap-3">
                      <MobileDetail
                        label="Client"
                        value={
                          payment
                            .invoice
                            .quotation
                            .client
                            .companyName
                        }
                      />

                      <MobileDetail
                        label="Date"
                        value={formatDate(
                          payment.paymentDate ??
                            payment.createdAt,
                        )}
                      />

                      <MobileDetail
                        label="Invoice Balance"
                        value={formatCurrency(
                          payment
                            .invoice
                            .balanceDue,
                        )}
                      />

                      <MobileDetail
                        label="Reference"
                        value={
                          payment.referenceNumber ??
                          "No reference"
                        }
                      />
                    </div>
                  </div>
                );
              },
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

interface PaymentActionsProps {
  payment: Payment;
  permissions: PaymentTablePermissions;

  onView: (
    payment: Payment,
  ) => void;

  onVerify: (
    payment: Payment,
  ) => void;

  onReject: (
    payment: Payment,
  ) => void;
}

function PaymentActions({
  payment,
  permissions,
  onView,
  onVerify,
  onReject,
}: PaymentActionsProps) {
  return (
    <div className="flex justify-end gap-1">
      {permissions.canView && (
        <button
          type="button"
          onClick={() =>
            onView(payment)
          }
          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
          title="View payment"
          aria-label="View payment"
        >
          <Eye className="h-4 w-4" />
        </button>
      )}

      {permissions.canVerify &&
        payment.status ===
          "PENDING" && (
          <button
            type="button"
            onClick={() =>
              onVerify(payment)
            }
            className="flex h-9 w-9 items-center justify-center rounded-lg text-emerald-600 transition hover:bg-emerald-50 hover:text-emerald-700"
            title="Verify payment"
            aria-label="Verify payment"
          >
            <CheckCircle2 className="h-4 w-4" />
          </button>
        )}

      {permissions.canReject &&
        payment.status ===
          "PENDING" && (
          <button
            type="button"
            onClick={() =>
              onReject(payment)
            }
            className="flex h-9 w-9 items-center justify-center rounded-lg text-red-500 transition hover:bg-red-50 hover:text-red-700"
            title="Reject payment"
            aria-label="Reject payment"
          >
            <XCircle className="h-4 w-4" />
          </button>
        )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Status                                                                     */
/* -------------------------------------------------------------------------- */

function PaymentStatusBadge({
  status,
}: {
  status: PaymentStatus;
}) {
  const config =
    getPaymentStatusConfig(
      status,
    );

  if (!config) {
    return null;
  }

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

function getPaymentStatusConfig(
  status: PaymentStatus,
) {
  switch (status) {
    case "PENDING":
      return {
        label: "Pending",
        icon: Clock3,
        className:
          "bg-amber-50 text-amber-700",
      };

    case "COMPLETED":
      return {
        label: "Completed",
        icon: CheckCircle2,
        className:
          "bg-emerald-50 text-emerald-700",
      };

    case "FAILED":
      return {
        label: "Failed",
        icon: XCircle,
        className:
          "bg-red-50 text-red-700",
      };

    case "REFUNDED":
      return {
        label: "Refunded",
        icon: XCircle,
        className:
          "bg-slate-100 text-slate-600",
      };

    default:
      return undefined;
  }
}

/* -------------------------------------------------------------------------- */
/* Small components                                                           */
/* -------------------------------------------------------------------------- */

function TableHeader({
  children,
  align = "left",
}: {
  children: React.ReactNode;
  align?: "left" | "right";
}) {
  return (
    <th
      className={`px-6 py-3 text-${align} text-xs font-semibold uppercase tracking-wide text-slate-500`}
    >
      {children}
    </th>
  );
}

function MobileDetail({
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

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function formatPaymentMethod(
  method: PaymentMethod,
) {
  switch (method) {
    case "BANK_TRANSFER":
      return "Bank Transfer";

    case "EASYPAISA":
      return "EasyPaisa";

    case "JAZZCASH":
      return "JazzCash";

    case "CASH":
      return "Cash";

    default:
      return method;
  }
}

function formatDate(
  value: string,
) {
  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime(),
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
    },
  ).format(date);
}

function formatCurrency(
  value: string | number,
) {
  const amount =
    Number(value);

  if (
    !Number.isFinite(
      amount,
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
    },
  ).format(amount);
}