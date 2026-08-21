"use client";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  AlertCircle,
  Loader2,
  X,
} from "lucide-react";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import DashboardLayout from "@/components/dashboard/DashboardLayout";

import InvoiceFormModal from "@/components/invoices/InvoiceFormModal";
import InvoiceItemsEditor from "@/components/invoices/InvoiceItemsEditor";

import { useCurrentUser } from "@/features/auth/hooks/useAuth";
import { authStorage } from "@/features/auth/services/auth-storage";

import {
  useCreateInvoice,
  useDeleteInvoice,
  useInvoices,
  useSendInvoice,
  useUpdateInvoice,
} from "@/features/invoices/hooks/useInvoices";

import InvoicesFilters from "@/features/invoices/components/InvoicesFilters";
import InvoicesHeader from "@/features/invoices/components/InvoicesHeader";
import InvoicesPagination from "@/features/invoices/components/InvoicesPagination";

import InvoicesTable, {
  InvoiceTablePermissions,
} from "@/features/invoices/components/InvoicesTable";

import { useQuotations } from "@/features/quotations/hooks/useQuotations";

import type {
  CreateInvoicePayload,
  Invoice,
  InvoiceStatus,
  UpdateInvoicePayload,
} from "@/features/invoices/types/invoice.types";

const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 400;

export default function InvoicesPage() {
  const router = useRouter();

  /* ------------------------------------------------------------------------ */
  /* Supporting quotations                                                     */
  /* ------------------------------------------------------------------------ */

  const {
    data: quotationsData,
  } = useQuotations({
    limit: 100,
    status: "ACCEPTED",
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  /* ------------------------------------------------------------------------ */
  /* Local state                                                              */
  /* ------------------------------------------------------------------------ */

  const [mounted, setMounted] =
    useState(false);

  const [page, setPage] =
    useState(1);

  const [searchInput, setSearchInput] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [quotationId, setQuotationId] =
    useState("");

  const [status, setStatus] =
    useState<InvoiceStatus | "">("");

  const [isFormOpen, setIsFormOpen] =
    useState(false);

  const [editingInvoice, setEditingInvoice] =
    useState<Invoice | null>(null);

  const [itemsInvoice, setItemsInvoice] =
    useState<Invoice | null>(null);

  const [viewingInvoice, setViewingInvoice] =
    useState<Invoice | null>(null);

  const [deleteInvoice, setDeleteInvoice] =
    useState<Invoice | null>(null);

  const [sendInvoice, setSendInvoice] =
    useState<Invoice | null>(null);

  const [paymentInvoice, setPaymentInvoice] =
    useState<Invoice | null>(null);

  const [formError, setFormError] =
    useState<string | null>(null);

  /* ------------------------------------------------------------------------ */
  /* Auth                                                                     */
  /* ------------------------------------------------------------------------ */

  const {
    data: user,
    isLoading: isUserLoading,
    isError: isUserError,
  } = useCurrentUser();

  /* ------------------------------------------------------------------------ */
  /* Invoices                                                                 */
  /* ------------------------------------------------------------------------ */

  const {
    data,
    isLoading: isInvoicesLoading,
    isFetching,
    isError: isInvoicesError,
    refetch,
  } = useInvoices({
    page,
    limit: PAGE_SIZE,
    search:
      search || undefined,
    quotationId:
      quotationId || undefined,
    status:
      status || undefined,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  /* ------------------------------------------------------------------------ */
  /* Mutations                                                                */
  /* ------------------------------------------------------------------------ */

  const createInvoice =
    useCreateInvoice();

  const updateInvoice =
    useUpdateInvoice();

  const sendInvoiceMutation =
    useSendInvoice();

  const deleteInvoiceMutation =
    useDeleteInvoice();

  /* ------------------------------------------------------------------------ */
  /* Mount / auth                                                             */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) {
      return;
    }

    if (!authStorage.getToken()) {
      router.replace("/login");
    }
  }, [mounted, router]);

  useEffect(() => {
    if (!mounted || !isUserError) {
      return;
    }

    authStorage.removeToken();
    router.replace("/login");
  }, [
    mounted,
    isUserError,
    router,
  ]);

  /* ------------------------------------------------------------------------ */
  /* Search debounce                                                          */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearch(
        searchInput.trim(),
      );

      setPage(1);
    }, SEARCH_DEBOUNCE_MS);

    return () =>
      clearTimeout(timeout);
  }, [searchInput]);

  /* ------------------------------------------------------------------------ */
  /* Filters                                                                  */
  /* ------------------------------------------------------------------------ */

  const handleQuotationChange = (
    value: string,
  ) => {
    setQuotationId(value);
    setPage(1);
  };

  const handleStatusChange = (
    value: InvoiceStatus | "",
  ) => {
    setStatus(value);
    setPage(1);
  };

  const resetFilters = () => {
    setQuotationId("");
    setStatus("");
    setSearchInput("");
    setSearch("");
    setPage(1);
  };

  /* ------------------------------------------------------------------------ */
  /* Form                                                                     */
  /* ------------------------------------------------------------------------ */

  const openCreateForm = () => {
    setEditingInvoice(null);
    setFormError(null);
    setIsFormOpen(true);
  };

  const openEditForm = (
    invoice: Invoice,
  ) => {
    setEditingInvoice(invoice);
    setFormError(null);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    if (
      createInvoice.isPending ||
      updateInvoice.isPending
    ) {
      return;
    }

    setIsFormOpen(false);
    setEditingInvoice(null);
    setFormError(null);
  };

  const handleCreate = async (
    payload: CreateInvoicePayload,
  ) => {
    setFormError(null);

    try {
      const response =
        await createInvoice.mutateAsync(
          payload,
        );

      toast.success(
        response.message ||
          "Invoice created successfully.",
      );

      setIsFormOpen(false);
      setEditingInvoice(null);
      setPage(1);
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        "Failed to create invoice.";

      setFormError(message);
      toast.error(message);

      throw error;
    }
  };

  const handleUpdate = async (
    payload: UpdateInvoicePayload,
  ) => {
    if (!editingInvoice) {
      return;
    }

    setFormError(null);

    try {
      const response =
        await updateInvoice.mutateAsync({
          id: editingInvoice.id,
          data: payload,
        });

      toast.success(
        response.message ||
          "Invoice updated successfully.",
      );

      setIsFormOpen(false);
      setEditingInvoice(null);
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        "Failed to update invoice.";

      setFormError(message);
      toast.error(message);

      throw error;
    }
  };

  /* ------------------------------------------------------------------------ */
  /* Send                                                                     */
  /* ------------------------------------------------------------------------ */

  const handleSend = async () => {
    if (!sendInvoice) {
      return;
    }

    try {
      const response =
        await sendInvoiceMutation.mutateAsync(
          sendInvoice.id,
        );

      toast.success(
        response.message ||
          "Invoice sent successfully.",
      );

      setSendInvoice(null);
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        "Failed to send invoice.";

      toast.error(message);
    }
  };

  /* ------------------------------------------------------------------------ */
  /* Delete                                                                   */
  /* ------------------------------------------------------------------------ */

  const handleDelete = async () => {
    if (!deleteInvoice) {
      return;
    }

    try {
      const response =
        await deleteInvoiceMutation.mutateAsync(
          deleteInvoice.id,
        );

      toast.success(
        response.message ||
          "Invoice deleted successfully.",
      );

      setDeleteInvoice(null);

      if (
        data?.data.length === 1 &&
        page > 1
      ) {
        setPage(
          (previous) =>
            previous - 1,
        );
      }
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        "Failed to delete invoice.";

      toast.error(message);
    }
  };

/* ------------------------------------------------------------------------ */
/* Permissions                                                              */
/* ------------------------------------------------------------------------ */

const canAccessInvoices =
  user?.role === "SUPER_ADMIN" ||
  user?.role === "PROJECT_MANAGER" ||
  user?.role === "CLIENT";

const canManageInvoices =
  user?.role === "SUPER_ADMIN" ||
  user?.role === "PROJECT_MANAGER";

const canCreateInvoice =
  canManageInvoices;

const getPermissions = (
  invoice: Invoice,
): InvoiceTablePermissions => {
  /*
   * CLIENT:
   * Can view invoices and payment-related information,
   * but cannot modify invoice records.
   */
  if (user?.role === "CLIENT") {
    return {
      canEdit: false,
      canManageItems: false,
      canSend: false,
      canDelete: false,
      canManagePayments: false,
    };
  }

  /*
   * Internal users:
   * SUPER_ADMIN / PROJECT_MANAGER can manage invoices
   * according to the invoice status workflow.
   */
  if (!canManageInvoices) {
    return {
      canEdit: false,
      canManageItems: false,
      canSend: false,
      canDelete: false,
      canManagePayments: false,
    };
  }

  const isDraft =
    invoice.status === "DRAFT";

  const canManagePayments =
    invoice.status !== "DRAFT";

  return {
    canEdit: isDraft,
    canManageItems: isDraft,
    canSend: isDraft,
    canDelete: isDraft,
    canManagePayments,
  };
};

  /* ------------------------------------------------------------------------ */
  /* Next invoice number                                                      */
  /* ------------------------------------------------------------------------ */

  const nextInvoiceNumber =
    useMemo(() => {
      const currentInvoices =
        data?.data ?? [];

      let maxNumber = 999;

      for (const invoice of currentInvoices) {
        const match =
          /^INV-(\d+)$/.exec(
            invoice.invoiceNumber,
          );

        if (!match) {
          continue;
        }

        const number =
          Number(match[1]);

        if (
          Number.isFinite(number) &&
          number > maxNumber
        ) {
          maxNumber = number;
        }
      }

      return `INV-${maxNumber + 1}`;
    }, [data?.data]);

  /* ------------------------------------------------------------------------ */
  /* Initial loading                                                          */
  /* ------------------------------------------------------------------------ */

  if (!mounted) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading invoices...
        </div>
      </main>
    );
  }

  if (isUserLoading || !user) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading...
        </div>
      </main>
    );
  }

  /* ------------------------------------------------------------------------ */
  /* Authorization                                                            */
  /* ------------------------------------------------------------------------ */

  if (!canAccessInvoices) {
    return (
      <DashboardLayout user={user}>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="max-w-md rounded-xl border border-red-200 bg-red-50 p-6 text-center">
            <AlertCircle className="mx-auto h-8 w-8 text-red-500" />

            <h2 className="mt-3 text-lg font-semibold text-red-700">
              Access Denied
            </h2>

            <p className="mt-1 text-sm text-red-600">
              You do not have permission to manage invoices.
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  /* ------------------------------------------------------------------------ */
  /* Loading / error                                                          */
  /* ------------------------------------------------------------------------ */

  if (
    isInvoicesLoading &&
    !data
  ) {
    return (
      <DashboardLayout user={user}>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading invoices...
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (
    isInvoicesError ||
    !data
  ) {
    return (
      <DashboardLayout user={user}>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
            <AlertCircle className="mx-auto h-8 w-8 text-red-500" />

            <h2 className="mt-3 text-lg font-semibold text-red-700">
              Unable to load invoices
            </h2>

            <p className="mt-1 text-sm text-red-600">
              Something went wrong while loading invoices.
            </p>

            <button
              type="button"
              onClick={() =>
                refetch()
              }
              className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              Try Again
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  /* ------------------------------------------------------------------------ */
  /* Data                                                                     */
  /* ------------------------------------------------------------------------ */

  const invoices =
    data.data;

  const meta =
    data.meta;

  const acceptedQuotations =
    quotationsData?.data ?? [];

  return (
    <DashboardLayout user={user}>
      <div className="mx-auto max-w-7xl space-y-6">
        <InvoicesHeader
          search={searchInput}
          onSearchChange={
            setSearchInput
          }
          onCreate={
            openCreateForm
          }
          canCreate={
            canCreateInvoice
          }
        />

        <InvoicesFilters
          quotations={acceptedQuotations}
          quotationId={
            quotationId
          }
          status={status}
          onQuotationChange={
            handleQuotationChange
          }
          onStatusChange={
            handleStatusChange
          }
          onReset={
            resetFilters
          }
        />

        <InvoicesTable
          invoices={invoices}
          search={search}
          isFetching={isFetching}
          getPermissions={
            getPermissions
          }
          onView={
            setViewingInvoice
          }
          onEdit={
            openEditForm
          }
          onManageItems={
            setItemsInvoice
          }
          onSend={
            setSendInvoice
          }
          onDelete={
            setDeleteInvoice
          }
          onManagePayments={
            setPaymentInvoice
          }
        />

        <InvoicesPagination
          page={meta.page}
          totalPages={
            meta.totalPages
          }
          isFetching={
            isFetching
          }
          onPageChange={
            setPage
          }
        />
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Create / Edit                                                     */}
      {/* ------------------------------------------------------------------ */}

      <InvoiceFormModal
        open={isFormOpen}
        invoice={
          editingInvoice
        }
        quotations={
          acceptedQuotations
        }
        nextInvoiceNumber={
          nextInvoiceNumber
        }
        isSubmitting={
          createInvoice.isPending ||
          updateInvoice.isPending
        }
        error={
          formError
        }
        onClose={
          closeForm
        }
        onCreate={
          handleCreate
        }
        onUpdate={
          handleUpdate
        }
      />

      {/* ------------------------------------------------------------------ */}
      {/* Items                                                              */}
      {/* ------------------------------------------------------------------ */}

      <InvoiceItemsEditor
        invoice={itemsInvoice}
        onClose={() =>
          setItemsInvoice(null)
        }
      />

      {/* ------------------------------------------------------------------ */}
      {/* View                                                               */}
      {/* ------------------------------------------------------------------ */}

      {viewingInvoice && (
        <InvoiceView
          invoice={
            viewingInvoice
          }
          onClose={() =>
            setViewingInvoice(
              null,
            )
          }
          onManageItems={() => {
            setViewingInvoice(
              null,
            );

            if (
              viewingInvoice.status ===
              "DRAFT"
            ) {
              setItemsInvoice(
                viewingInvoice,
              );
            }
          }}
          onManagePayments={() => {
            setViewingInvoice(
              null,
            );

            setPaymentInvoice(
              viewingInvoice,
            );
          }}
        />
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Send confirmation                                                  */}
      {/* ------------------------------------------------------------------ */}

      {sendInvoice && (
        <ConfirmDialog
          title="Send invoice?"
          description={`Send ${sendInvoice.invoiceNumber} to the client? Only a complete draft invoice should be sent.`}
          confirmLabel="Send Invoice"
          processing={
            sendInvoiceMutation.isPending
          }
          onCancel={() =>
            setSendInvoice(null)
          }
          onConfirm={
            handleSend
          }
        />
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Delete confirmation                                                */}
      {/* ------------------------------------------------------------------ */}

      {deleteInvoice && (
        <ConfirmDialog
          title="Delete invoice?"
          description={`Delete ${deleteInvoice.invoiceNumber}? Only draft invoices can be deleted.`}
          confirmLabel="Delete Invoice"
          danger
          processing={
            deleteInvoiceMutation.isPending
          }
          onCancel={() =>
            setDeleteInvoice(null)
          }
          onConfirm={
            handleDelete
          }
        />
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Payments                                                            */}
      {/* ------------------------------------------------------------------ */}

      {paymentInvoice && (
        <PaymentWorkflowPlaceholder
          invoice={
            paymentInvoice
          }
          onClose={() =>
            setPaymentInvoice(null)
          }
        />
      )}
    </DashboardLayout>
  );
}

/* -------------------------------------------------------------------------- */
/* Invoice view                                                               */
/* -------------------------------------------------------------------------- */

function InvoiceView({
  invoice,
  onClose,
  onManageItems,
  onManagePayments,
}: {
  invoice: Invoice;
  onClose: () => void;
  onManageItems: () => void;
  onManagePayments: () => void;
}) {
  const isDraft =
    invoice.status === "DRAFT";

  return (
    <div className="fixed inset-0 z-[110] flex items-start justify-center overflow-y-auto bg-slate-900/40 p-4 sm:p-6">
      <div className="my-4 flex w-full max-w-3xl flex-col overflow-hidden rounded-xl bg-white shadow-xl sm:my-8">
        <div className="flex shrink-0 items-start justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              {invoice.invoiceNumber}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Invoice details
            </p>
          </div>

          <button
            type="button"
            onClick={
              onClose
            }
            className="rounded-lg px-3 py-2 text-sm text-slate-500 transition hover:bg-slate-100"
          >
            Close
          </button>
        </div>

        <div className="max-h-[calc(100vh-8rem)] overflow-y-auto p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <DetailCard
              label="Client"
              value={
                invoice.quotation
                  ?.client
                  ?.companyName ??
                "Unknown client"
              }
            />

            <DetailCard
              label="Quotation"
              value={
                invoice.quotation
                  ?.quotationNumber ??
                "N/A"
              }
            />

            <DetailCard
              label="Project"
              value={
                invoice.quotation
                  ?.project
                  ?.name ??
                "No project"
              }
            />

            <DetailCard
              label="Status"
              value={formatStatus(
                invoice.status,
              )}
            />

            <DetailCard
              label="Issue Date"
              value={formatDate(
                invoice.issueDate,
              )}
            />

            <DetailCard
              label="Due Date"
              value={formatDate(
                invoice.dueDate,
              )}
            />
          </div>

          <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div className="space-y-3">
              <SummaryRow
                label="Subtotal"
                value={formatCurrency(
                  invoice.subtotal,
                )}
              />

              <SummaryRow
                label="Discount"
                value={`- ${formatCurrency(
                  invoice.discount,
                )}`}
              />

              <SummaryRow
                label="Tax"
                value={formatCurrency(
                  invoice.tax,
                )}
              />

              <div className="border-t border-slate-200 pt-3">
                <SummaryRow
                  label="Total"
                  value={formatCurrency(
                    invoice.totalAmount,
                  )}
                  strong
                />
              </div>

              <SummaryRow
                label="Amount Paid"
                value={formatCurrency(
                  invoice.amountPaid,
                )}
              />

              <SummaryRow
                label="Balance Due"
                value={formatCurrency(
                  invoice.balanceDue,
                )}
              />
            </div>
          </div>

          <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Notes
            </p>

            <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">
              {invoice.notes ||
                "No notes provided."}
            </p>
          </div>
        </div>

        <div className="flex shrink-0 flex-wrap justify-end gap-3 border-t border-slate-200 px-6 py-4">
          {isDraft && (
            <button
              type="button"
              onClick={
                onManageItems
              }
              className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Manage Items
            </button>
          )}

          {!isDraft && (
            <button
              type="button"
              onClick={
                onManagePayments
              }
              className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50"
            >
              Payments
            </button>
          )}

          <button
            type="button"
            onClick={
              onClose
            }
            className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Confirm dialog                                                             */
/* -------------------------------------------------------------------------- */

function ConfirmDialog({
  title,
  description,
  confirmLabel,
  processing,
  danger = false,
  onCancel,
  onConfirm,
}: {
  title: string;
  description: string;
  confirmLabel: string;
  processing?: boolean;
  danger?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[140] flex items-center justify-center bg-slate-900/40 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold text-slate-900">
              {title}
            </h3>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              {description}
            </p>
          </div>

          <button
            type="button"
            onClick={
              onCancel
            }
            disabled={processing}
            className="rounded-lg p-1.5 text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 disabled:opacity-50"
            aria-label="Close dialog"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={
              onCancel
            }
            disabled={processing}
            className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={
              onConfirm
            }
            disabled={processing}
            className={`inline-flex items-center gap-2 rounded-lg px-4 py-2.5 text-sm font-medium text-white transition disabled:cursor-not-allowed disabled:opacity-60 ${
              danger
                ? "bg-red-600 hover:bg-red-700"
                : "bg-slate-900 hover:bg-slate-800"
            }`}
          >
            {processing && (
              <Loader2 className="h-4 w-4 animate-spin" />
            )}

            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Payment placeholder                                                        */
/* -------------------------------------------------------------------------- */

function PaymentWorkflowPlaceholder({
  invoice,
  onClose,
}: {
  invoice: Invoice;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[130] flex items-center justify-center bg-slate-900/40 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <h3 className="text-lg font-semibold text-slate-900">
          Payment Workflow
        </h3>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          Payment management for{" "}
          <span className="font-medium text-slate-700">
            {invoice.invoiceNumber}
          </span>{" "}
          will use the payment module.
        </p>

        <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <div className="space-y-2">
            <SummaryRow
              label="Invoice Total"
              value={formatCurrency(
                invoice.totalAmount,
              )}
            />

            <SummaryRow
              label="Amount Paid"
              value={formatCurrency(
                invoice.amountPaid,
              )}
            />

            <SummaryRow
              label="Balance Due"
              value={formatCurrency(
                invoice.balanceDue,
              )}
              strong
            />
          </div>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={
              onClose
            }
            className="rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white hover:bg-slate-800"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function DetailCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 truncate text-sm font-medium text-slate-800">
        {value}
      </p>
    </div>
  );
}

function SummaryRow({
  label,
  value,
  strong = false,
}: {
  label: string;
  value: string;
  strong?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-4">
      <span
        className={
          strong
            ? "text-sm font-semibold text-slate-900"
            : "text-sm text-slate-500"
        }
      >
        {label}
      </span>

      <span
        className={
          strong
            ? "text-lg font-bold text-slate-900"
            : "text-sm font-medium text-slate-700"
        }
      >
        {value}
      </span>
    </div>
  );
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

function formatStatus(
  status: InvoiceStatus,
) {
  switch (status) {
    case "DRAFT":
      return "Draft";

    case "SENT":
      return "Sent";

    case "PARTIALLY_PAID":
      return "Partially Paid";

    case "PAID":
      return "Paid";

    case "OVERDUE":
      return "Overdue";
  }
}