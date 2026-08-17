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

import { useClients } from "@/features/clients/hooks/useClients";

import ContactPersonFormModal from "@/components/contact-persons/ContactPersonFormModal";
import DeleteContactPersonDialog from "@/components/contact-persons/DeleteContactPersonDialog";

import ContactPersonsHeader from "@/features/contact-persons/components/ContactPersonsHeader";
import ContactPersonsTable from "@/features/contact-persons/components/ContactPersonsTable";
import ContactPersonsPagination from "@/features/contact-persons/components/ContactPersonsPagination";

import { useCurrentUser } from "@/features/auth/hooks/useAuth";
import { authStorage } from "@/features/auth/services/auth-storage";

import {
  useContactPersons,
  useCreateContactPerson,
  useDeleteContactPerson,
  useUpdateContactPerson,
} from "@/features/contact-persons/hooks/useContactPersons";

import type {
  ContactPerson,
  CreateContactPersonPayload,
  UpdateContactPersonPayload,
} from "@/features/contact-persons/types/contactPerson.types";

/* -------------------------------------------------------------------------- */
/* Constants                                                                  */
/* -------------------------------------------------------------------------- */

const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 400;

/* -------------------------------------------------------------------------- */
/* Page                                                                       */
/* -------------------------------------------------------------------------- */

export default function ContactPersonsPage() {
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

  const [
    editingContactPerson,
    setEditingContactPerson,
  ] = useState<ContactPerson | null>(null);

  const [
    deleteContactPerson,
    setDeleteContactPerson,
  ] = useState<ContactPerson | null>(null);

  const [formError, setFormError] =
    useState<string | null>(null);

  /* ------------------------------------------------------------------------ */
  /* Authentication                                                            */
  /* ------------------------------------------------------------------------ */

  const {
    data: user,
    isLoading: isUserLoading,
    isError: isUserError,
  } = useCurrentUser();

  /* ------------------------------------------------------------------------ */
  /* Contact Persons                                                          */
  /* ------------------------------------------------------------------------ */

  const {
    data,
    isLoading: isContactPersonsLoading,
    isFetching,
    isError: isContactPersonsError,
    refetch,
  } = useContactPersons({
    page,
    limit: PAGE_SIZE,
    search:
      search || undefined,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  /* ------------------------------------------------------------------------ */
  /* Clients                                                                  */
  /* ------------------------------------------------------------------------ */

  const {
    data: clientsData,
    isLoading: isClientsLoading,
    isError: isClientsError,
  } = useClients({
    page: 1,
    limit: 100,
    sortBy: "companyName",
    sortOrder: "asc",
  });

  /* ------------------------------------------------------------------------ */
  /* Mutations                                                                */
  /* ------------------------------------------------------------------------ */

  const createContactPerson =
    useCreateContactPerson();

  const updateContactPerson =
    useUpdateContactPerson();

  const deleteContactPersonMutation =
    useDeleteContactPerson();

  /* ------------------------------------------------------------------------ */
  /* Mount                                                                    */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    setMounted(true);
  }, []);

  /* ------------------------------------------------------------------------ */
  /* Authentication redirect                                                  */
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
    setEditingContactPerson(null);
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (
    contactPerson: ContactPerson
  ) => {
    setEditingContactPerson(
      contactPerson
    );

    setFormError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (
      createContactPerson.isPending ||
      updateContactPerson.isPending
    ) {
      return;
    }

    setIsModalOpen(false);
    setEditingContactPerson(null);
    setFormError(null);
  };

  /* ------------------------------------------------------------------------ */
  /* Create Contact Person                                                    */
  /* ------------------------------------------------------------------------ */

  const handleCreate = async (
    payload: CreateContactPersonPayload
  ) => {
    setFormError(null);

    try {
      const response =
        await createContactPerson.mutateAsync(
          payload
        );

      toast.success(
        response.message ||
          "Contact person created successfully."
      );

      setIsModalOpen(false);
      setEditingContactPerson(null);

      setPage(1);
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        "Failed to create contact person. Please try again.";

      setFormError(message);

      toast.error(message);

      throw error;
    }
  };

  /* ------------------------------------------------------------------------ */
  /* Update Contact Person                                                    */
  /* ------------------------------------------------------------------------ */

  const handleUpdate = async (
    payload: UpdateContactPersonPayload
  ) => {
    if (!editingContactPerson) {
      return;
    }

    setFormError(null);

    try {
      const response =
        await updateContactPerson.mutateAsync({
          id: editingContactPerson.id,
          data: payload,
        });

      toast.success(
        response.message ||
          "Contact person updated successfully."
      );

      setIsModalOpen(false);
      setEditingContactPerson(null);
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        "Failed to update contact person. Please try again.";

      setFormError(message);

      toast.error(message);

      throw error;
    }
  };

  /* ------------------------------------------------------------------------ */
  /* Delete Contact Person                                                    */
  /* ------------------------------------------------------------------------ */

  const handleDelete = async () => {
    if (!deleteContactPerson) {
      return;
    }

    try {
      const response =
        await deleteContactPersonMutation.mutateAsync(
          deleteContactPerson.id
        );

      toast.success(
        response.message ||
          "Contact person deleted successfully."
      );

      setDeleteContactPerson(null);

      /*
       * If the deleted contact person was
       * the last item on the current page,
       * move back one page.
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
        "Failed to delete contact person. Please try again.";

      toast.error(message);

      setDeleteContactPerson(null);
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
          Loading contact persons...
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

  const canManageContactPersons =
    user.role === "SUPER_ADMIN" ||
    user.role === "PROJECT_MANAGER";

  if (!canManageContactPersons) {
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
              to manage contact persons.
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  /* ------------------------------------------------------------------------ */
  /* Contact Persons loading                                                  */
  /* ------------------------------------------------------------------------ */

  const showInitialLoading =
    isContactPersonsLoading &&
    !data;

  if (showInitialLoading) {
    return (
      <DashboardLayout user={user}>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading contact persons...
          </div>
        </div>
      </DashboardLayout>
    );
  }

  /* ------------------------------------------------------------------------ */
  /* Contact Persons error                                                    */
  /* ------------------------------------------------------------------------ */

  if (
    isContactPersonsError ||
    !data
  ) {
    return (
      <DashboardLayout user={user}>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
            <AlertCircle className="mx-auto h-8 w-8 text-red-500" />

            <h2 className="mt-3 text-lg font-semibold text-red-700">
              Unable to load contact persons
            </h2>

            <p className="mt-1 text-sm text-red-600">
              Something went wrong while
              loading contact persons.
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

  const contactPersons =
    data.data;

  const meta = data.meta;

  const clients =
    clientsData?.data ?? [];

  /* ------------------------------------------------------------------------ */
  /* Render                                                                   */
  /* ------------------------------------------------------------------------ */

  return (
    <DashboardLayout user={user}>
      <div className="mx-auto max-w-6xl space-y-6">

        {/* Header */}
        <ContactPersonsHeader
          search={searchInput}
          onSearchChange={
            setSearchInput
          }
          onCreate={
            openCreateModal
          }
        />

        {/* Table */}
        <ContactPersonsTable
          contactPersons={
            contactPersons
          }
          search={search}
          isFetching={isFetching}
          canDelete={
            user.role ===
            "SUPER_ADMIN"
          }
          onEdit={
            openEditModal
          }
          onDelete={
            setDeleteContactPerson
          }
        />

        {/* Pagination */}
        <ContactPersonsPagination
          page={meta.page}
          totalPages={
            meta.totalPages
          }
          isFetching={isFetching}
          onPageChange={setPage}
        />
      </div>

      {/* -------------------------------------------------------------------- */}
      {/* Create / Edit modal                                                  */}
      {/* -------------------------------------------------------------------- */}

      <ContactPersonFormModal
        open={isModalOpen}
        contactPerson={
          editingContactPerson
        }
        clients={clients}
        error={formError}
        isSubmitting={
          createContactPerson.isPending ||
          updateContactPerson.isPending
        }
        onClose={closeModal}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
      />

      {/* -------------------------------------------------------------------- */}
      {/* Delete dialog                                                        */}
      {/* -------------------------------------------------------------------- */}

      <DeleteContactPersonDialog
        contactPerson={
          deleteContactPerson
        }
        isDeleting={
          deleteContactPersonMutation.isPending
        }
        onCancel={() =>
          setDeleteContactPerson(null)
        }
        onConfirm={handleDelete}
      />
    </DashboardLayout>
  );
}