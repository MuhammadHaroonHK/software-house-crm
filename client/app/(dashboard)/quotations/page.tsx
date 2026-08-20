"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  AlertCircle,
  Loader2,
} from "lucide-react";

import {
  useRouter,
} from "next/navigation";

import { toast } from "sonner";

import DashboardLayout from "@/components/dashboard/DashboardLayout";

import QuotationActionDialog, {
  QuotationAction,
} from "@/components/quotations/QuotationActionDialog";

import QuotationFormModal from "@/components/quotations/QuotationFormModal";

import QuotationItemsEditor from "@/components/quotations/QuotationItemsEditor";

import { useClients } from "@/features/clients/hooks/useClients";

import { useProjects } from "@/features/projects/hooks/useProjects";

import QuotationsFilters from "@/features/quotations/components/QuotationsFilters";

import QuotationsHeader from "@/features/quotations/components/QuotationsHeader";

import QuotationsPagination from "@/features/quotations/components/QuotationsPagination";

import QuotationsTable, {
  QuotationTablePermissions,
} from "@/features/quotations/components/QuotationsTable";

import {
  useAcceptQuotation,
  useCreateQuotation,
  useDeleteQuotation,
  useExpireQuotation,
  useQuotations,
  useRejectQuotation,
  useSendQuotation,
  useUpdateQuotation,
} from "@/features/quotations/hooks/useQuotations";

import {
  useCurrentUser,
} from "@/features/auth/hooks/useAuth";

import {
  authStorage,
} from "@/features/auth/services/auth-storage";

import type {
  CreateQuotationPayload,
  Quotation,
  QuotationStatus,
  UpdateQuotationPayload,
} from "@/features/quotations/types/quotation.types";

const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 400;

/* -------------------------------------------------------------------------- */
/* Page                                                                       */
/* -------------------------------------------------------------------------- */

export default function QuotationsPage() {
  const router = useRouter();

  /* ------------------------------------------------------------------------ */
  /* Auth                                                                     */
  /* ------------------------------------------------------------------------ */

  const {
    data: user,
    isLoading: isUserLoading,
    isError: isUserError,
  } = useCurrentUser();

  /* ------------------------------------------------------------------------ */
  /* User role                                                                */
  /* ------------------------------------------------------------------------ */

  const isInternalUser =
    user?.role === "SUPER_ADMIN" ||
    user?.role === "PROJECT_MANAGER";

  const isClientUser =
    user?.role === "CLIENT";

  const canAccessQuotations =
    isInternalUser ||
    isClientUser;

  /* ------------------------------------------------------------------------ */
  /* Supporting data                                                          */
  /* ------------------------------------------------------------------------ */

  /*
   * Clients and projects are only needed by internal users because CLIENT
   * users cannot create/edit quotations and cannot access these internal
   * management endpoints.
   */
  const {
    data: clientsData,
  } = useClients(
    {
      limit: 100,
      sortBy: "createdAt",
      sortOrder: "desc",
    },
    {
      enabled: isInternalUser,
    }
  );

  const {
    data: projectsData,
  } = useProjects(
    {
      limit: 100,
      sortBy: "createdAt",
      sortOrder: "desc",
    },
    {
      enabled: isInternalUser,
    }
  );

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

  const [clientId, setClientId] =
    useState("");

  const [projectId, setProjectId] =
    useState("");

  const [status, setStatus] =
    useState<QuotationStatus | "">(
      ""
    );

  const [isFormOpen, setIsFormOpen] =
    useState(false);

  const [editingQuotation, setEditingQuotation] =
    useState<Quotation | null>(null);

  const [itemsQuotation, setItemsQuotation] =
    useState<Quotation | null>(
      null
    );

  const [viewingQuotation, setViewingQuotation] =
    useState<Quotation | null>(
      null
    );

  const [actionQuotation, setActionQuotation] =
    useState<Quotation | null>(
      null
    );

  const [action, setAction] =
    useState<QuotationAction | null>(
      null
    );

  const [formError, setFormError] =
    useState<string | null>(
      null
    );

  /* ------------------------------------------------------------------------ */
  /* Quotations                                                               */
  /* ------------------------------------------------------------------------ */

  const {
    data,
    isLoading:
      isQuotationsLoading,
    isFetching,
    isError:
      isQuotationsError,
    refetch,
  } = useQuotations({
    page,
    limit: PAGE_SIZE,
    search:
      search ||
      undefined,
    clientId:
      clientId ||
      undefined,
    projectId:
      projectId ||
      undefined,
    status:
      status ||
      undefined,
    sortBy:
      "createdAt",
    sortOrder:
      "desc",
  });

  /* ------------------------------------------------------------------------ */
  /* Mutations                                                                */
  /* ------------------------------------------------------------------------ */

  const createQuotation =
    useCreateQuotation();

  const updateQuotation =
    useUpdateQuotation();

  const sendQuotation =
    useSendQuotation();

  const acceptQuotation =
    useAcceptQuotation();

  const rejectQuotation =
    useRejectQuotation();

  const expireQuotation =
    useExpireQuotation();

  const deleteQuotation =
    useDeleteQuotation();

  /* ------------------------------------------------------------------------ */
  /* Mount                                                                    */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    setMounted(true);
  }, []);

  /* ------------------------------------------------------------------------ */
  /* Authentication redirect                                                 */
  /* ------------------------------------------------------------------------ */

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

  /* ------------------------------------------------------------------------ */
  /* Authentication error                                                     */
  /* ------------------------------------------------------------------------ */

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
      setTimeout(
        () => {
          setSearch(
            searchInput.trim()
          );

          setPage(1);
        },
        SEARCH_DEBOUNCE_MS
      );

    return () =>
      clearTimeout(
        timeout
      );
  }, [
    searchInput,
  ]);

  /* ------------------------------------------------------------------------ */
  /* Filters                                                                  */
  /* ------------------------------------------------------------------------ */

  const handleClientChange =
    (
      value: string
    ) => {
      setClientId(
        value
      );

      setProjectId(
        ""
      );

      setPage(1);
    };

  const handleProjectChange =
    (
      value: string
    ) => {
      setProjectId(
        value
      );

      setPage(1);
    };

  const handleStatusChange =
    (
      value:
        | QuotationStatus
        | ""
    ) => {
      setStatus(
        value
      );

      setPage(1);
    };

  const resetFilters =
    () => {
      setClientId("");
      setProjectId("");
      setStatus("");
      setSearchInput("");
      setSearch("");
      setPage(1);
    };

  /* ------------------------------------------------------------------------ */
  /* Form helpers                                                             */
  /* ------------------------------------------------------------------------ */

  const openCreateForm =
    () => {
      if (!isInternalUser) {
        return;
      }

      setEditingQuotation(
        null
      );

      setFormError(
        null
      );

      setIsFormOpen(
        true
      );
    };

  const openEditForm =
    (
      quotation: Quotation
    ) => {
      if (!isInternalUser) {
        return;
      }

      if (
        quotation.status !==
        "DRAFT"
      ) {
        return;
      }

      setEditingQuotation(
        quotation
      );

      setFormError(
        null
      );

      setIsFormOpen(
        true
      );
    };

  const closeForm =
    () => {
      if (
        createQuotation.isPending ||
        updateQuotation.isPending
      ) {
        return;
      }

      setIsFormOpen(
        false
      );

      setEditingQuotation(
        null
      );

      setFormError(
        null
      );
    };

  /* ------------------------------------------------------------------------ */
  /* Create                                                                   */
  /* ------------------------------------------------------------------------ */

  const handleCreate =
    async (
      payload: CreateQuotationPayload
    ) => {
      if (!isInternalUser) {
        return;
      }

      setFormError(
        null
      );

      try {
        const response =
          await createQuotation.mutateAsync(
            payload
          );

        toast.success(
          response.message ||
            "Quotation created successfully."
        );

        setIsFormOpen(
          false
        );

        setEditingQuotation(
          null
        );

        /*
         * New quotations start as DRAFT.
         *
         * Open the item editor immediately so the
         * user can build the actual quotation.
         */
        if (
          response.data
        ) {
          setItemsQuotation(
            response.data
          );
        }

        setPage(1);
      } catch (
        error: any
      ) {
        const message =
          error?.response
            ?.data?.message ||
          "Failed to create quotation. Please try again.";

        setFormError(
          message
        );

        toast.error(
          message
        );

        throw error;
      }
    };

  /* ------------------------------------------------------------------------ */
  /* Update                                                                   */
  /* ------------------------------------------------------------------------ */

  const handleUpdate =
    async (
      payload: UpdateQuotationPayload
    ) => {
      if (
        !editingQuotation ||
        !isInternalUser
      ) {
        return;
      }

      setFormError(
        null
      );

      try {
        const response =
          await updateQuotation.mutateAsync(
            {
              id:
                editingQuotation.id,
              data:
                payload,
            }
          );

        toast.success(
          response.message ||
            "Quotation updated successfully."
        );

        setIsFormOpen(
          false
        );

        setEditingQuotation(
          null
        );
      } catch (
        error: any
      ) {
        const message =
          error?.response
            ?.data?.message ||
          "Failed to update quotation. Please try again.";

        setFormError(
          message
        );

        toast.error(
          message
        );

        throw error;
      }
    };

  /* ------------------------------------------------------------------------ */
  /* Actions                                                                  */
  /* ------------------------------------------------------------------------ */

  const openAction =
    (
      quotation: Quotation,
      nextAction: QuotationAction
    ) => {
      /*
       * CLIENT:
       *   ACCEPT / REJECT only
       *
       * INTERNAL:
       *   SEND / EXPIRE / DELETE only
       */
      const clientAllowed =
        isClientUser &&
        (
          nextAction === "ACCEPT" ||
          nextAction === "REJECT"
        );

      const internalAllowed =
        isInternalUser &&
        (
          nextAction === "SEND" ||
          nextAction === "EXPIRE" ||
          nextAction === "DELETE"
        );

      if (
        !clientAllowed &&
        !internalAllowed
      ) {
        return;
      }

      setActionQuotation(
        quotation
      );

      setAction(
        nextAction
      );
    };

  const isActionPending =
    () =>
      sendQuotation.isPending ||
      acceptQuotation.isPending ||
      rejectQuotation.isPending ||
      expireQuotation.isPending ||
      deleteQuotation.isPending;

  const closeAction =
    () => {
      if (
        isActionPending()
      ) {
        return;
      }

      setActionQuotation(
        null
      );

      setAction(
        null
      );
    };

  const handleAction =
    async () => {
      if (
        !actionQuotation ||
        !action
      ) {
        return;
      }

      /*
       * Extra frontend permission guard.
       * Backend remains the final authority.
       */
      const allowed =
        (
          isClientUser &&
          (
            action ===
              "ACCEPT" ||
            action ===
              "REJECT"
          )
        ) ||
        (
          isInternalUser &&
          (
            action ===
              "SEND" ||
            action ===
              "EXPIRE" ||
            action ===
              "DELETE"
          )
        );

      if (!allowed) {
        toast.error(
          "You are not authorized to perform this action."
        );

        closeAction();
        return;
      }

      const id =
        actionQuotation.id;

      try {
        let response:
          | {
              message?: string;
            }
          | undefined;

        switch (
          action
        ) {
          case "SEND":
            response =
              await sendQuotation.mutateAsync(
                id
              );
            break;

          case "ACCEPT":
            response =
              await acceptQuotation.mutateAsync(
                id
              );
            break;

          case "REJECT":
            response =
              await rejectQuotation.mutateAsync(
                id
              );
            break;

          case "EXPIRE":
            response =
              await expireQuotation.mutateAsync(
                id
              );
            break;

          case "DELETE":
            response =
              await deleteQuotation.mutateAsync(
                id
              );
            break;
        }

        toast.success(
          response?.message ||
            "Quotation updated successfully."
        );

        const wasDelete =
          action ===
          "DELETE";

        closeAction();

        if (
          wasDelete &&
          data?.data.length ===
            1 &&
          page > 1
        ) {
          setPage(
            (
              previous
            ) =>
              previous - 1
          );
        }
      } catch (
        error: any
      ) {
        const message =
          error?.response
            ?.data?.message ||
          "The quotation action could not be completed.";

        toast.error(
          message
        );
      }
    };

  /* ------------------------------------------------------------------------ */
  /* View                                                                     */
  /* ------------------------------------------------------------------------ */

  const openView =
    (
      quotation: Quotation
    ) => {
      setViewingQuotation(
        quotation
      );
    };

  /* ------------------------------------------------------------------------ */
  /* Permissions                                                              */
  /* ------------------------------------------------------------------------ */

  const getPermissions = (
    quotation: Quotation
  ): QuotationTablePermissions => {
    /* ---------------------------------------------------------------------- */
    /* CLIENT                                                                  */
    /* ---------------------------------------------------------------------- */

    if (isClientUser) {
      return {
        canEdit:
          false,

        canSend:
          false,

        canAccept:
          quotation.status ===
          "SENT",

        canReject:
          quotation.status ===
          "SENT",

        canExpire:
          false,

        canDelete:
          false,

        canManageItems:
          false,
      };
    }

    /* ---------------------------------------------------------------------- */
    /* INTERNAL USER                                                           */
    /* ---------------------------------------------------------------------- */

    const isDraft =
      quotation.status ===
      "DRAFT";

    const isSent =
      quotation.status ===
      "SENT";

    const expiryReached =
      Boolean(
        quotation.expiryDate &&
          new Date(
            quotation.expiryDate
          ).getTime() <=
            Date.now()
      );

    return {
      canEdit:
        isDraft,

      canSend:
        isDraft,

      canAccept:
        false,

      canReject:
        false,

      canExpire:
        isSent &&
        expiryReached,

      canDelete:
        isDraft,

      canManageItems:
        isDraft,
    };
  };

  /* ------------------------------------------------------------------------ */
  /* Initial mounting                                                         */
  /* ------------------------------------------------------------------------ */

  if (!mounted) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading quotations...
        </div>
      </main>
    );
  }

  /* ------------------------------------------------------------------------ */
  /* User loading                                                             */
  /* ------------------------------------------------------------------------ */

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
    !canAccessQuotations
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
              You do not have permission to access quotations.
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  /* ------------------------------------------------------------------------ */
  /* Loading                                                                   */
  /* ------------------------------------------------------------------------ */

  if (
    isQuotationsLoading &&
    !data
  ) {
    return (
      <DashboardLayout
        user={user}
      >
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading quotations...
          </div>
        </div>
      </DashboardLayout>
    );
  }

  /* ------------------------------------------------------------------------ */
  /* Error                                                                     */
  /* ------------------------------------------------------------------------ */

  if (
    isQuotationsError ||
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
              Unable to load quotations
            </h2>

            <p className="mt-1 text-sm text-red-600">
              Something went wrong while loading quotations.
            </p>

            <button
              type="button"
              onClick={() =>
                refetch()
              }
              className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800"
            >
              Try Again
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  /* ------------------------------------------------------------------------ */
  /* Data                                                                      */
  /* ------------------------------------------------------------------------ */

  const quotations =
    data.data;

  const meta =
    data.meta;

  const clients =
    clientsData?.data ??
    [];

  /*
   * Project data is only loaded for internal users.
   */
  const projects =
    (projectsData?.data ??
      []).map(
      (project) => ({
        id:
          project.id,

        name:
          project.name,

        clientId:
          project.clientId,
      })
    );

  /* ------------------------------------------------------------------------ */
  /* Render                                                                    */
  /* ------------------------------------------------------------------------ */

  return (
    <DashboardLayout
      user={user}
    >
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <QuotationsHeader
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
            isInternalUser
          }
        />

        {/* Internal filters only */}
        {isInternalUser && (
          <QuotationsFilters
            clients={
              clients
            }
            projects={
              projects
            }
            clientId={
              clientId
            }
            projectId={
              projectId
            }
            status={
              status
            }
            onClientChange={
              handleClientChange
            }
            onProjectChange={
              handleProjectChange
            }
            onStatusChange={
              handleStatusChange
            }
            onReset={
              resetFilters
            }
          />
        )}

        {/* Table */}
        <QuotationsTable
          quotations={
            quotations
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
            openView
          }
          onEdit={
            openEditForm
          }
          onManageItems={
            setItemsQuotation
          }
          onAction={
            openAction
          }
        />

        {/* Pagination */}
        <QuotationsPagination
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

      {/* -------------------------------------------------------------------- */}
      {/* Create / Edit                                                        */}
      {/* -------------------------------------------------------------------- */}

      {isInternalUser && (
        <QuotationFormModal
          open={
            isFormOpen
          }
          quotation={
            editingQuotation
          }
          clients={
            clients
          }
          projects={
            projects
          }
          error={
            formError
          }
          isSubmitting={
            createQuotation.isPending ||
            updateQuotation.isPending
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
          onContinue={
            setItemsQuotation
          }
        />
      )}

      {/* -------------------------------------------------------------------- */}
      {/* Items                                                                 */}
      {/* -------------------------------------------------------------------- */}

      {isInternalUser && (
        <QuotationItemsEditor
          quotation={
            itemsQuotation
          }
          onClose={() =>
            setItemsQuotation(
              null
            )
          }
        />
      )}

      {/* -------------------------------------------------------------------- */}
      {/* Workflow confirmation                                                */}
      {/* -------------------------------------------------------------------- */}

      <QuotationActionDialog
        quotation={
          actionQuotation
        }
        action={
          action
        }
        isProcessing={
          isActionPending()
        }
        onCancel={
          closeAction
        }
        onConfirm={
          handleAction
        }
      />

      {/* -------------------------------------------------------------------- */}
      {/* View                                                                  */}
      {/* -------------------------------------------------------------------- */}

      {viewingQuotation && (
        <QuotationView
          quotation={
            viewingQuotation
          }
          canManageItems={
            isInternalUser &&
            viewingQuotation.status ===
              "DRAFT"
          }
          onClose={() =>
            setViewingQuotation(
              null
            )
          }
          onManageItems={() => {
            setViewingQuotation(
              null
            );

            setItemsQuotation(
              viewingQuotation
            );
          }}
        />
      )}
    </DashboardLayout>
  );
}

/* -------------------------------------------------------------------------- */
/* Quotation View                                                             */
/* -------------------------------------------------------------------------- */

function QuotationView({
  quotation,
  canManageItems,
  onClose,
  onManageItems,
}: {
  quotation: Quotation;
  canManageItems: boolean;
  onClose: () => void;
  onManageItems: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[110] flex items-start justify-center overflow-y-auto bg-slate-900/40 p-4 sm:p-6">
      <div className="my-4 flex w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-white shadow-xl sm:my-8">
        {/* Header */}
        <div className="flex shrink-0 items-start justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              {
                quotation.quotationNumber
              }
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Quotation details
            </p>
          </div>

          <button
            type="button"
            onClick={
              onClose
            }
            className="rounded-lg px-3 py-2 text-sm text-slate-500 hover:bg-slate-100"
          >
            Close
          </button>
        </div>

        {/* Content */}
        <div className="max-h-[calc(100vh-8rem)] overflow-y-auto p-6">
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <DetailCard
              label="Client"
              value={
                quotation.client
                  ?.companyName ??
                "No client"
              }
            />

            <DetailCard
              label="Project"
              value={
                quotation.project
                  ?.name ??
                "No project"
              }
            />

            <DetailCard
              label="Issue Date"
              value={formatDate(
                quotation.issueDate
              )}
            />

            <DetailCard
              label="Expiry Date"
              value={
                quotation.expiryDate
                  ? formatDate(
                      quotation.expiryDate
                    )
                  : "No expiry"
              }
            />

            <DetailCard
              label="Status"
              value={formatStatus(
                quotation.status
              )}
            />

            <DetailCard
              label="Total"
              value={formatCurrency(
                quotation.totalAmount
              )}
            />
          </div>

          {/* Financial summary */}
          <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <div className="space-y-3">
              <SummaryRow
                label="Subtotal"
                value={formatCurrency(
                  quotation.subtotal
                )}
              />

              <SummaryRow
                label="Discount"
                value={`- ${formatCurrency(
                  quotation.discount
                )}`}
              />

              <SummaryRow
                label="Tax"
                value={formatCurrency(
                  quotation.tax
                )}
              />

              <div className="border-t border-slate-200 pt-3">
                <SummaryRow
                  label="Total"
                  value={formatCurrency(
                    quotation.totalAmount
                  )}
                  strong
                />
              </div>
            </div>
          </div>

          {/* Notes */}
          <div className="mt-4 rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Notes
            </p>

            <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">
              {quotation.notes ||
                "No notes provided."}
            </p>
          </div>
        </div>

        {/* Footer */}
        <div className="flex shrink-0 justify-end gap-3 border-t border-slate-200 px-6 py-4">
          {canManageItems && (
            <button
              type="button"
              onClick={
                onManageItems
              }
              className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50"
            >
              Manage Items
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
/* Detail Card                                                                */
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

/* -------------------------------------------------------------------------- */
/* Summary Row                                                                */
/* -------------------------------------------------------------------------- */

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

/* -------------------------------------------------------------------------- */
/* Date                                                                       */
/* -------------------------------------------------------------------------- */

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

/* -------------------------------------------------------------------------- */
/* Currency                                                                   */
/* -------------------------------------------------------------------------- */

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

/* -------------------------------------------------------------------------- */
/* Status                                                                     */
/* -------------------------------------------------------------------------- */

function formatStatus(
  status: QuotationStatus
) {
  switch (status) {
    case "DRAFT":
      return "Draft";

    case "SENT":
      return "Sent";

    case "ACCEPTED":
      return "Accepted";

    case "REJECTED":
      return "Rejected";

    case "EXPIRED":
      return "Expired";

    default:
      return status;
  }
}