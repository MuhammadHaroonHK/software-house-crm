"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  AlertCircle,
  ExternalLink,
  Loader2,
  X,
} from "lucide-react";

import { useRouter } from "next/navigation";
import { toast } from "sonner";

import DashboardLayout from "@/components/dashboard/DashboardLayout";

import PaymentFormModal, {
  type PaymentFormSubmitData,
  type PaymentInvoiceOption,
} from "@/components/payments/PaymentFormModal";

import {
  useCreatePayment,
  usePayments,
  usePaymentReceiverDetails,
  useRejectPayment,
  useVerifyPayment,
} from "@/features/payments/hooks/usePayments";

import PaymentsFilters from "@/features/payments/components/PaymentsFilters";
import PaymentsHeader from "@/features/payments/components/PaymentsHeader";
import PaymentsPagination from "@/features/payments/components/PaymentsPagination";

import PaymentsTable, {
  type PaymentTablePermissions,
} from "@/features/payments/components/PaymentsTable";

import { useInvoices } from "@/features/invoices/hooks/useInvoices";

import { useCurrentUser } from "@/features/auth/hooks/useAuth";

import { authStorage } from "@/features/auth/services/auth-storage";

import type {
  Payment,
  PaymentInvoice,
  PaymentMethod,
  PaymentStatus,
} from "@/features/payments/types/payment.types";

const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 400;

/*
 * Backend API URL.
 *
 * Example:
 * NEXT_PUBLIC_API_URL=http://localhost:5000/api
 *
 * Receipt files are served from:
 * http://localhost:5000/uploads/...
 */
const API_BASE_URL =
  process.env.NEXT_PUBLIC_API_URL ??
  "http://localhost:5000/api";

/* -------------------------------------------------------------------------- */
/* Upload URL helper                                                          */
/* -------------------------------------------------------------------------- */

function getReceiptImageUrl(
  receiptImage: string,
) {
  if (!receiptImage) {
    return "";
  }

  /*
   * Already absolute:
   * https://...
   */
  if (
    receiptImage.startsWith(
      "http://",
    ) ||
    receiptImage.startsWith(
      "https://",
    )
  ) {
    return receiptImage;
  }

  /*
   * Remove /api from the API base URL because uploads
   * are served from /uploads, not /api/uploads.
   *
   * Example:
   * http://localhost:5000/api
   *       ↓
   * http://localhost:5000
   */
  const serverBaseUrl =
    API_BASE_URL.replace(
      /\/api\/?$/,
      "",
    );

  const normalizedPath =
    receiptImage.startsWith("/")
      ? receiptImage
      : `/${receiptImage}`;

  return `${serverBaseUrl}${normalizedPath}`;
}

export default function PaymentsPage() {
  const router = useRouter();

  /* ------------------------------------------------------------------------ */
  /* Supporting invoices                                                      */
  /* ------------------------------------------------------------------------ */

  const {
    data: invoicesData,
  } = useInvoices({
    limit: 100,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  /* ------------------------------------------------------------------------ */
  /* Auth                                                                     */
  /* ------------------------------------------------------------------------ */

  const {
    data: user,
    isLoading: isUserLoading,
    isError: isUserError,
  } = useCurrentUser();

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

  const [invoiceId, setInvoiceId] =
    useState("");

  const [status, setStatus] =
    useState<PaymentStatus | "">("");

  const [paymentMethod, setPaymentMethod] =
    useState<PaymentMethod | "">("");

  const [isFormOpen, setIsFormOpen] =
    useState(false);

  const [viewingPayment, setViewingPayment] =
    useState<Payment | null>(null);

  const [verifyPayment, setVerifyPayment] =
    useState<Payment | null>(null);

  const [rejectPayment, setRejectPayment] =
    useState<Payment | null>(null);

  const [formError, setFormError] =
    useState<string | null>(null);

  /* ------------------------------------------------------------------------ */
  /* Payments                                                                 */
  /* ------------------------------------------------------------------------ */

  const {
    data,
    isLoading: isPaymentsLoading,
    isFetching,
    isError: isPaymentsError,
    refetch,
  } = usePayments({
    page,
    limit: PAGE_SIZE,

    search:
      search || undefined,

    invoiceId:
      invoiceId || undefined,

    status:
      status || undefined,

    paymentMethod:
      paymentMethod || undefined,

    sortBy:
      "createdAt",

    sortOrder:
      "desc",
  });

  /* ------------------------------------------------------------------------ */
  /* Receiver details                                                         */
  /* ------------------------------------------------------------------------ */

  const {
    data: receiverData,
    isLoading:
      isReceiverLoading,
  } =
    usePaymentReceiverDetails();

  /* ------------------------------------------------------------------------ */
  /* Mutations                                                                */
  /* ------------------------------------------------------------------------ */

  const createPayment =
    useCreatePayment();

  const verifyPaymentMutation =
    useVerifyPayment();

  const rejectPaymentMutation =
    useRejectPayment();

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
  }, [
    mounted,
    router,
  ]);

  useEffect(() => {
    if (
      !mounted ||
      !isUserError
    ) {
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
    const timeout =
      setTimeout(() => {
        setSearch(
          searchInput.trim(),
        );

        setPage(1);
      }, SEARCH_DEBOUNCE_MS);

    return () =>
      clearTimeout(timeout);
  }, [
    searchInput,
  ]);

  /* ------------------------------------------------------------------------ */
  /* Filters                                                                  */
  /* ------------------------------------------------------------------------ */

  const handleInvoiceChange = (
    value: string,
  ) => {
    setInvoiceId(value);
    setPage(1);
  };

  const handleStatusChange = (
    value: PaymentStatus | "",
  ) => {
    setStatus(value);
    setPage(1);
  };

  const handlePaymentMethodChange = (
    value: PaymentMethod | "",
  ) => {
    setPaymentMethod(value);
    setPage(1);
  };

  const resetFilters = () => {
    setInvoiceId("");
    setStatus("");
    setPaymentMethod("");
    setSearchInput("");
    setSearch("");
    setPage(1);
  };

  /* ------------------------------------------------------------------------ */
  /* Permissions                                                              */
  /* ------------------------------------------------------------------------ */

  const canAccessPayments =
    user?.role ===
      "SUPER_ADMIN" ||
    user?.role ===
      "PROJECT_MANAGER" ||
    user?.role ===
      "EMPLOYEE" ||
    user?.role ===
      "CLIENT";

  const canManagePayments =
    user?.role ===
      "SUPER_ADMIN" ||
    user?.role ===
      "PROJECT_MANAGER";

  /*
   * Normal CRM workflow:
   *
   * CLIENT
   *   → submits payment
   *   → payment becomes PENDING
   *
   * SUPER_ADMIN / PROJECT_MANAGER
   *   → review payment
   *   → verify or reject
   */
  const canCreatePayment =
    user?.role ===
    "CLIENT";

  const getPermissions = (
    payment: Payment,
  ): PaymentTablePermissions => {
    return {
      canVerify:
        canManagePayments &&
        payment.status ===
          "PENDING",

      canReject:
        canManagePayments &&
        payment.status ===
          "PENDING",

      canView:
        canAccessPayments,

      canCreate:
        canCreatePayment,
    };
  };

  /* ------------------------------------------------------------------------ */
  /* Form                                                                     */
  /* ------------------------------------------------------------------------ */

  const openCreateForm = () => {
    setFormError(null);
    setIsFormOpen(true);
  };

  const closeForm = () => {
    if (
      createPayment.isPending
    ) {
      return;
    }

    setIsFormOpen(false);
    setFormError(null);
  };

  const handleCreate = async (
    payload: PaymentFormSubmitData,
  ) => {
    setFormError(null);

    try {
      const response =
        await createPayment.mutateAsync({
          invoiceId:
            payload.invoiceId,

          amount:
            payload.amount,

          paymentMethod:
            payload.paymentMethod,

          paymentDate:
            payload.paymentDate,

          accountTitle:
            payload.accountTitle,

          accountNumber:
            payload.accountNumber,

          referenceNumber:
            payload.referenceNumber,

          notes:
            payload.notes,

          receiptImage:
            payload.receiptImage ??
            undefined,
        });

      toast.success(
        response.message ||
          "Payment submitted successfully.",
      );

      setIsFormOpen(false);
    } catch (error: any) {
      console.error(
        "PAYMENT CREATE ERROR:",
        error?.response?.data,
      );

      const message =
        error?.response?.data
          ?.message ||
        "Failed to submit payment.";

      setFormError(message);

      toast.error(message);

      return;
    }
  };

  /* ------------------------------------------------------------------------ */
  /* Verify                                                                   */
  /* ------------------------------------------------------------------------ */

  const handleVerify = async () => {
    if (!verifyPayment) {
      return;
    }

    try {
      const response =
        await verifyPaymentMutation.mutateAsync(
          verifyPayment.id,
        );

      toast.success(
        response.message ||
          "Payment verified successfully.",
      );

      setVerifyPayment(null);
      setViewingPayment(null);
    } catch (error: any) {
      toast.error(
        error?.response?.data
          ?.message ||
          "Failed to verify payment.",
      );
    }
  };

  /* ------------------------------------------------------------------------ */
  /* Reject                                                                   */
  /* ------------------------------------------------------------------------ */

  const handleReject = async () => {
    if (!rejectPayment) {
      return;
    }

    try {
      const response =
        await rejectPaymentMutation.mutateAsync(
          rejectPayment.id,
        );

      toast.success(
        response.message ||
          "Payment rejected successfully.",
      );

      setRejectPayment(null);
      setViewingPayment(null);
    } catch (error: any) {
      toast.error(
        error?.response?.data
          ?.message ||
          "Failed to reject payment.",
      );
    }
  };

  /* ------------------------------------------------------------------------ */
  /* Supporting invoice mapping                                              */
  /* ------------------------------------------------------------------------ */

  const invoices =
    invoicesData?.data ??
    [];

  const paymentFilterInvoices: PaymentInvoice[] =
    invoices.map(
      (invoice) => ({
        id:
          invoice.id,

        invoiceNumber:
          invoice.invoiceNumber,

        totalAmount:
          invoice.totalAmount,

        amountPaid:
          invoice.amountPaid,

        balanceDue:
          invoice.balanceDue,

        status:
          invoice.status,

        quotation: {
          id:
            invoice
              .quotation.id,

          quotationNumber:
            invoice
              .quotation
              .quotationNumber,

          client: {
            id:
              invoice
                .quotation
                .client
                ?.id ??
              "",

            companyName:
              invoice
                .quotation
                .client
                ?.companyName ??
              "Unknown client",
          },

          project:
            invoice
              .quotation
              .project
              ? {
                  id:
                    invoice
                      .quotation
                      .project
                      .id,

                  name:
                    invoice
                      .quotation
                      .project
                      .name,
                }
              : null,
        },
      }),
    );

  /* ------------------------------------------------------------------------ */
  /* Initial loading                                                          */
  /* ------------------------------------------------------------------------ */

  if (!mounted) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading payments...
        </div>
      </main>
    );
  }

  if (
    isUserLoading ||
    !user
  ) {
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

  if (
    !canAccessPayments
  ) {
    return (
      <DashboardLayout
        user={user}
      >
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="max-w-md rounded-xl border border-red-200 bg-red-50 p-6 text-center">
            <AlertCircle className="mx-auto h-8 w-8 text-red-500" />

            <h2 className="mt-3 text-lg font-semibold text-red-700">
              Access Denied
            </h2>

            <p className="mt-1 text-sm text-red-600">
              You do not have permission to access payments.
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  /* ------------------------------------------------------------------------ */
  /* Loading                                                                  */
  /* ------------------------------------------------------------------------ */

  if (
    isPaymentsLoading &&
    !data
  ) {
    return (
      <DashboardLayout
        user={user}
      >
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading payments...
          </div>
        </div>
      </DashboardLayout>
    );
  }

  /* ------------------------------------------------------------------------ */
  /* Error                                                                    */
  /* ------------------------------------------------------------------------ */

  if (
    isPaymentsError ||
    !data
  ) {
    return (
      <DashboardLayout
        user={user}
      >
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
            <AlertCircle className="mx-auto h-8 w-8 text-red-500" />

            <h2 className="mt-3 text-lg font-semibold text-red-700">
              Unable to load payments
            </h2>

            <p className="mt-1 text-sm text-red-600">
              Something went wrong while loading payments.
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

  const payments =
    data.data;

  const meta =
    data.meta;

  /*
   * Only invoices with an outstanding balance
   * can receive a new payment.
   *
   * Backend still enforces client ownership.
   */
  const invoiceOptions: PaymentInvoiceOption[] =
    invoices
      .filter(
        (invoice) =>
          invoice.status !==
            "DRAFT" &&
          invoice.status !==
            "PAID" &&
          Number(
            invoice.balanceDue,
          ) > 0,
      )
      .map(
        (invoice) => ({
          id:
            invoice.id,

          invoiceNumber:
            invoice.invoiceNumber,

          totalAmount:
            invoice.totalAmount,

          amountPaid:
            invoice.amountPaid,

          balanceDue:
            invoice.balanceDue,

          status:
            invoice.status,

          quotation: {
            client:
              invoice
                .quotation
                ?.client
                ? {
                    id:
                      invoice
                        .quotation
                        .client
                        .id,

                    companyName:
                      invoice
                        .quotation
                        .client
                        .companyName,
                  }
                : undefined,
          },
        }),
      );

  const receiverDetails =
    receiverData?.data;

  return (
    <DashboardLayout
      user={user}
    >
      <div className="mx-auto max-w-7xl space-y-6">
        {/* ---------------------------------------------------------------- */}
        {/* Header                                                            */}
        {/* ---------------------------------------------------------------- */}

        <PaymentsHeader
          search={
            searchInput
          }
          onSearchChange={
            setSearchInput
          }
          onCreate={
            openCreateForm
          }
          canCreate={
            canCreatePayment
          }
        />

        {/* ---------------------------------------------------------------- */}
        {/* Filters                                                           */}
        {/* ---------------------------------------------------------------- */}

        <PaymentsFilters
          invoices={
            paymentFilterInvoices
          }
          invoiceId={
            invoiceId
          }
          status={
            status
          }
          paymentMethod={
            paymentMethod
          }
          onInvoiceChange={
            handleInvoiceChange
          }
          onStatusChange={
            handleStatusChange
          }
          onPaymentMethodChange={
            handlePaymentMethodChange
          }
          onReset={
            resetFilters
          }
        />

        {/* ---------------------------------------------------------------- */}
        {/* Table                                                             */}
        {/* ---------------------------------------------------------------- */}

        <PaymentsTable
          payments={
            payments
          }
          search={
            search
          }
          isFetching={
            isFetching
          }
          getPermissions={
            getPermissions
          }
          onView={
            setViewingPayment
          }
          onVerify={
            setVerifyPayment
          }
          onReject={
            setRejectPayment
          }
        />

        {/* ---------------------------------------------------------------- */}
        {/* Pagination                                                        */}
        {/* ---------------------------------------------------------------- */}

        <PaymentsPagination
          page={
            meta.page
          }
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
      {/* Payment form                                                       */}
      {/* ------------------------------------------------------------------ */}

      {canCreatePayment && (
        <PaymentFormModal
          open={
            isFormOpen
          }
          invoices={
            invoiceOptions
          }
          receiverDetails={
            receiverDetails
          }
          isLoadingInvoices={
            !invoicesData
          }
          isLoadingReceiverDetails={
            isReceiverLoading
          }
          isSubmitting={
            createPayment.isPending
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
        />
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Payment view                                                       */}
      {/* ------------------------------------------------------------------ */}

      {viewingPayment && (
        <PaymentView
          payment={
            viewingPayment
          }
          canVerify={
            getPermissions(
              viewingPayment,
            ).canVerify
          }
          canReject={
            getPermissions(
              viewingPayment,
            ).canReject
          }
          onClose={() =>
            setViewingPayment(
              null,
            )
          }
          onVerify={() =>
            setVerifyPayment(
              viewingPayment,
            )
          }
          onReject={() =>
            setRejectPayment(
              viewingPayment,
            )
          }
        />
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Verify dialog                                                      */}
      {/* ------------------------------------------------------------------ */}

      {verifyPayment && (
        <ConfirmDialog
          title="Verify payment?"
          description={`Verify ${formatCurrency(
            verifyPayment.amount,
          )} for ${
            verifyPayment.invoice
              .invoiceNumber
          }? This payment will affect the invoice financials.`}
          confirmLabel="Verify Payment"
          processing={
            verifyPaymentMutation.isPending
          }
          onCancel={() =>
            setVerifyPayment(
              null,
            )
          }
          onConfirm={
            handleVerify
          }
        />
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Reject dialog                                                      */}
      {/* ------------------------------------------------------------------ */}

      {rejectPayment && (
        <ConfirmDialog
          title="Reject payment?"
          description={`Mark the payment for ${
            rejectPayment.invoice
              .invoiceNumber
          } as failed? It will not affect the invoice balance.`}
          confirmLabel="Reject Payment"
          danger
          processing={
            rejectPaymentMutation.isPending
          }
          onCancel={() =>
            setRejectPayment(
              null,
            )
          }
          onConfirm={
            handleReject
          }
        />
      )}
    </DashboardLayout>
  );
}

/* -------------------------------------------------------------------------- */
/* Payment view                                                               */
/* -------------------------------------------------------------------------- */

function PaymentView({
  payment,
  canVerify,
  canReject,
  onClose,
  onVerify,
  onReject,
}: {
  payment: Payment;
  canVerify: boolean;
  canReject: boolean;
  onClose: () => void;
  onVerify: () => void;
  onReject: () => void;
}) {
  const receiptImageUrl =
    payment.receiptImage
      ? getReceiptImageUrl(
          payment.receiptImage,
        )
      : "";

  return (
    <div className="fixed inset-0 z-[110] flex items-start justify-center overflow-y-auto bg-slate-900/40 p-4 sm:p-6">
      <div className="my-4 flex w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-white shadow-xl sm:my-8">
        {/* Header */}

        <div className="flex shrink-0 items-start justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Payment Details
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {
                payment.invoice
                  .invoiceNumber
              }
            </p>
          </div>

          <button
            type="button"
            onClick={
              onClose
            }
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
            aria-label="Close payment details"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}

        <div className="max-h-[calc(100vh-8rem)] overflow-y-auto p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <DetailCard
              label="Invoice"
              value={
                payment.invoice
                  .invoiceNumber
              }
            />

            <DetailCard
              label="Client"
              value={
                payment.invoice
                  .quotation
                  .client
                  .companyName
              }
            />

            <DetailCard
              label="Amount"
              value={formatCurrency(
                payment.amount,
              )}
            />

            <DetailCard
              label="Method"
              value={formatPaymentMethod(
                payment.paymentMethod,
              )}
            />

            <DetailCard
              label="Payment Date"
              value={formatDate(
                payment.paymentDate ??
                  payment.createdAt,
              )}
            />

            <DetailCard
              label="Status"
              value={formatPaymentStatus(
                payment.status,
              )}
            />

            <DetailCard
              label="Reference"
              value={
                payment.referenceNumber ??
                "No reference"
              }
            />

            <DetailCard
              label="Invoice Balance"
              value={formatCurrency(
                payment.invoice
                  .balanceDue,
              )}
            />

            {payment.accountTitle && (
              <DetailCard
                label="Sender Account"
                value={
                  payment.accountTitle
                }
              />
            )}

            {payment.accountNumber && (
              <DetailCard
                label="Sender Account Number"
                value={
                  payment.accountNumber
                }
              />
            )}
          </div>

          {/* ---------------------------------------------------------------- */}
          {/* Receipt                                                          */}
          {/* ---------------------------------------------------------------- */}

          {receiptImageUrl && (
            <div className="mt-5 rounded-xl border border-slate-200 bg-white p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Payment Receipt
                  </p>

                  <p className="mt-1 text-sm text-slate-500">
                    Proof submitted with this payment.
                  </p>
                </div>

                <a
                  href={
                    receiptImageUrl
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-xs font-medium text-slate-700 transition hover:bg-slate-50"
                >
                  <ExternalLink className="h-3.5 w-3.5" />
                  Open
                </a>
              </div>

              <div className="mt-4 overflow-hidden rounded-lg border border-slate-200 bg-slate-50">
                <img
                  src={
                    receiptImageUrl
                  }
                  alt="Payment receipt"
                  className="max-h-[420px] w-full object-contain"
                  onError={(event) => {
                    event.currentTarget.style.display =
                      "none";
                  }}
                />
              </div>
            </div>
          )}

          {!receiptImageUrl && (
            <div className="mt-5 rounded-xl border border-dashed border-slate-300 bg-slate-50 p-5">
              <p className="text-sm font-medium text-slate-700">
                No payment receipt uploaded.
              </p>

              <p className="mt-1 text-xs text-slate-500">
                The client did not provide a receipt image with this payment.
              </p>
            </div>
          )}

          {/* Notes */}

          {payment.notes && (
            <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Notes
              </p>

              <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">
                {payment.notes}
              </p>
            </div>
          )}

          {/* Verified By */}

          {payment.verifiedBy && (
            <div className="mt-5 rounded-xl border border-slate-200 bg-slate-50 p-4">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Verified By
              </p>

              <p className="mt-1 text-sm font-medium text-slate-800">
                {
                  payment
                    .verifiedBy
                    .firstName
                }{" "}
                {
                  payment
                    .verifiedBy
                    .lastName
                }
              </p>

              <p className="mt-0.5 text-xs text-slate-500">
                {
                  payment
                    .verifiedBy
                    .email
                }
              </p>

              {payment.verifiedAt && (
                <p className="mt-2 text-xs text-slate-400">
                  Verified on{" "}
                  {formatDate(
                    payment.verifiedAt,
                  )}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Footer */}

        <div className="flex shrink-0 flex-wrap justify-end gap-3 border-t border-slate-200 px-6 py-4">
          {canVerify &&
            payment.status ===
              "PENDING" && (
              <button
                type="button"
                onClick={
                  onVerify
                }
                className="rounded-lg bg-emerald-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-emerald-700"
              >
                Verify Payment
              </button>
            )}

          {canReject &&
            payment.status ===
              "PENDING" && (
              <button
                type="button"
                onClick={
                  onReject
                }
                className="rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700"
              >
                Reject Payment
              </button>
            )}

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
/* Confirm dialog                                                             */
/* -------------------------------------------------------------------------- */

function ConfirmDialog({
  title,
  description,
  confirmLabel,
  processing = false,
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
            disabled={
              processing
            }
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 disabled:opacity-50"
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
            disabled={
              processing
            }
            className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={
              onConfirm
            }
            disabled={
              processing
            }
            className={`rounded-lg px-4 py-2.5 text-sm font-medium text-white disabled:cursor-not-allowed disabled:opacity-60 ${
              danger
                ? "bg-red-600 hover:bg-red-700"
                : "bg-slate-900 hover:bg-slate-800"
            }`}
          >
            {processing
              ? "Processing..."
              : confirmLabel}
          </button>
        </div>
      </div>
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

function formatPaymentStatus(
  status: PaymentStatus,
) {
  switch (status) {
    case "PENDING":
      return "Pending";

    case "COMPLETED":
      return "Completed";

    case "FAILED":
      return "Failed";

    case "REFUNDED":
      return "Refunded";

    default:
      return status;
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