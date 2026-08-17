"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  AlertCircle,
  Loader2,
} from "lucide-react";

import { useRouter } from "next/navigation";

import { toast } from "sonner";

import DashboardLayout from "@/components/dashboard/DashboardLayout";

import ClientFormModal from "@/components/clients/ClientFormModal";
import DeleteClientDialog from "@/components/clients/DeleteClientDialog";

import ClientsHeader from "@/features/clients/components/ClientsHeader";
import ClientsTable from "@/features/clients/components/ClientsTable";
import ClientsPagination from "@/features/clients/components/ClientsPagination";

import { useCurrentUser } from "@/features/auth/hooks/useAuth";
import { authStorage } from "@/features/auth/services/auth-storage";

import {
  useClients,
  useCreateClient,
  useDeleteClient,
  useUpdateClient,
} from "@/features/clients/hooks/useClients";

import type {
  Client,
  CreateClientPayload,
  UpdateClientPayload,
} from "@/features/clients/types/client.types";

/* -------------------------------------------------------------------------- */
/* Constants                                                                  */
/* -------------------------------------------------------------------------- */

const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 400;

/* -------------------------------------------------------------------------- */
/* Page                                                                       */
/* -------------------------------------------------------------------------- */

export default function ClientsPage() {
  const router = useRouter();

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

  const [isModalOpen, setIsModalOpen] =
    useState(false);

  const [editingClient, setEditingClient] =
    useState<Client | null>(null);

  const [deleteClient, setDeleteClient] =
    useState<Client | null>(null);

  const [formError, setFormError] =
    useState<string | null>(null);

  /* ------------------------------------------------------------------------ */
  /* Authentication                                                           */
  /* ------------------------------------------------------------------------ */

  const {
    data: user,
    isLoading: isUserLoading,
    isError: isUserError,
  } = useCurrentUser();

  /* ------------------------------------------------------------------------ */
  /* Clients                                                                  */
  /* ------------------------------------------------------------------------ */

  const {
    data,
    isLoading: isClientsLoading,
    isFetching,
    isError: isClientsError,
    refetch,
  } = useClients({
    page,
    limit: PAGE_SIZE,
    search:
      search || undefined,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const createClient =
    useCreateClient();

  const updateClient =
    useUpdateClient();

  const deleteClientMutation =
    useDeleteClient();

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
  }, [mounted, router]);

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
      setTimeout(() => {
        const trimmedSearch =
          searchInput.trim();

        setSearch(trimmedSearch);
        setPage(1);
      }, SEARCH_DEBOUNCE_MS);

    return () => {
      clearTimeout(timeout);
    };
  }, [searchInput]);

  /* ------------------------------------------------------------------------ */
  /* Modal helpers                                                            */
  /* ------------------------------------------------------------------------ */

  const openCreateModal = () => {
    setEditingClient(null);
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (
    client: Client
  ) => {
    setEditingClient(client);
    setFormError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (
      createClient.isPending ||
      updateClient.isPending
    ) {
      return;
    }

    setIsModalOpen(false);
    setEditingClient(null);
    setFormError(null);
  };

  /* ------------------------------------------------------------------------ */
  /* Create Client                                                            */
  /* ------------------------------------------------------------------------ */

  const handleCreate = async (
    payload: CreateClientPayload
  ) => {
    setFormError(null);

    try {
      const response =
        await createClient.mutateAsync(
          payload
        );

      toast.success(
        response.message ||
          "Client created successfully."
      );

      setIsModalOpen(false);
      setEditingClient(null);

      setPage(1);
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        "Failed to create client. Please try again.";

      setFormError(message);

      toast.error(message);

      throw error;
    }
  };

  /* ------------------------------------------------------------------------ */
  /* Update Client                                                            */
  /* ------------------------------------------------------------------------ */

  const handleUpdate = async (
    payload: UpdateClientPayload
  ) => {
    if (!editingClient) {
      return;
    }

    setFormError(null);

    try {
      const response =
        await updateClient.mutateAsync({
          id: editingClient.id,
          data: payload,
        });

      toast.success(
        response.message ||
          "Client updated successfully."
      );

      setIsModalOpen(false);
      setEditingClient(null);
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        "Failed to update client. Please try again.";

      setFormError(message);

      toast.error(message);

      throw error;
    }
  };

  /* ------------------------------------------------------------------------ */
  /* Delete Client                                                            */
  /* ------------------------------------------------------------------------ */

  const handleDelete = async () => {
    if (!deleteClient) {
      return;
    }

    try {
      const response =
        await deleteClientMutation.mutateAsync(
          deleteClient.id
        );

      toast.success(
        response.message ||
          "Client deleted successfully."
      );

      setDeleteClient(null);

      /*
       * If the deleted client was the last
       * item on the current page, move back one page.
       */
      if (
        data?.data.length === 1 &&
        page > 1
      ) {
        setPage(
          (previous) =>
            previous - 1
        );
      }
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        "Failed to delete client. Please try again.";

      toast.error(message);

      setDeleteClient(null);
    }
  };

  /* ------------------------------------------------------------------------ */
  /* Initial mounting                                                         */
  /* ------------------------------------------------------------------------ */

  if (!mounted) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading clients...
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

  const canManageClients =
    user.role === "SUPER_ADMIN" ||
    user.role === "PROJECT_MANAGER";

  if (!canManageClients) {
    return (
      <DashboardLayout user={user}>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="max-w-md rounded-xl border border-red-200 bg-red-50 p-6 text-center">
            <AlertCircle className="mx-auto h-8 w-8 text-red-500" />

            <h2 className="mt-3 text-lg font-semibold text-red-700">
              Access Denied
            </h2>

            <p className="mt-1 text-sm text-red-600">
              You do not have permission
              to manage clients.
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  /* ------------------------------------------------------------------------ */
  /* Clients loading                                                          */
  /* ------------------------------------------------------------------------ */

  const showInitialLoading =
    isClientsLoading &&
    !data;

  if (showInitialLoading) {
    return (
      <DashboardLayout user={user}>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading clients...
          </div>
        </div>
      </DashboardLayout>
    );
  }

  /* ------------------------------------------------------------------------ */
  /* Clients error                                                            */
  /* ------------------------------------------------------------------------ */

  if (
    isClientsError ||
    !data
  ) {
    return (
      <DashboardLayout user={user}>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
            <AlertCircle className="mx-auto h-8 w-8 text-red-500" />

            <h2 className="mt-3 text-lg font-semibold text-red-700">
              Unable to load clients
            </h2>

            <p className="mt-1 text-sm text-red-600">
              Something went wrong while
              loading clients.
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

  const clients = data.data;
  const meta = data.meta;

  /* ------------------------------------------------------------------------ */
  /* Render                                                                   */
  /* ------------------------------------------------------------------------ */

  return (
    <DashboardLayout user={user}>
      <div className="mx-auto max-w-6xl space-y-6">
        {/* Header + Search */}
        <ClientsHeader
          search={searchInput}
          onSearchChange={
            setSearchInput
          }
          onCreate={
            openCreateModal
          }
        />

        {/* Clients table */}
        <ClientsTable
          clients={clients}
          search={search}
          isFetching={isFetching}
          canDelete={
            user.role ===
            "SUPER_ADMIN"
          }
          onEdit={openEditModal}
          onDelete={setDeleteClient}
        />

        {/* Pagination */}
        <ClientsPagination
          page={meta.page}
          totalPages={
            meta.totalPages
          }
          isFetching={isFetching}
          onPageChange={setPage}
        />
      </div>

      {/* Create / Edit modal */}
      <ClientFormModal
        open={isModalOpen}
        client={editingClient}
        error={formError}
        isSubmitting={
          createClient.isPending ||
          updateClient.isPending
        }
        onClose={closeModal}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
      />

      {/* Delete dialog */}
      <DeleteClientDialog
        client={deleteClient}
        isDeleting={
          deleteClientMutation.isPending
        }
        onCancel={() =>
          setDeleteClient(null)
        }
        onConfirm={handleDelete}
      />
    </DashboardLayout>
  );
}