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

import DepartmentFormModal from "@/components/departments/DepartmentFormModal";
import DeleteDepartmentDialog from "@/components/departments/DeleteDepartmentDialog";

import DepartmentsHeader from "@/features/departments/components/DepartmentsHeader";
import DepartmentsTable from "@/features/departments/components/DepartmentsTable";
import DepartmentsPagination from "@/features/departments/components/DepartmentsPagination";

import { useCurrentUser } from "@/features/auth/hooks/useAuth";
import { authStorage } from "@/features/auth/services/auth-storage";

import {
  useCreateDepartment,
  useDeleteDepartment,
  useDepartments,
  useUpdateDepartment,
} from "@/features/departments/hooks/useDepartments";

import type {
  CreateDepartmentPayload,
  Department,
  UpdateDepartmentPayload,
} from "@/features/departments/types/department.types";

/* -------------------------------------------------------------------------- */
/* Constants                                                                  */
/* -------------------------------------------------------------------------- */

const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 400;

/* -------------------------------------------------------------------------- */
/* Page                                                                       */
/* -------------------------------------------------------------------------- */

export default function DepartmentsPage() {
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

  const [editingDepartment, setEditingDepartment] =
    useState<Department | null>(null);

  const [deleteDepartment, setDeleteDepartment] =
    useState<Department | null>(null);

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
  /* Departments                                                              */
  /* ------------------------------------------------------------------------ */

  const {
    data,
    isLoading: isDepartmentsLoading,
    isFetching,
    isError: isDepartmentsError,
    refetch,
  } = useDepartments({
    page,
    limit: PAGE_SIZE,
    search: search || undefined,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const createDepartment =
    useCreateDepartment();

  const updateDepartment =
    useUpdateDepartment();

  const deleteDepartmentMutation =
    useDeleteDepartment();

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
    setEditingDepartment(null);
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (
    department: Department
  ) => {
    setEditingDepartment(department);
    setFormError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (
      createDepartment.isPending ||
      updateDepartment.isPending
    ) {
      return;
    }

    setIsModalOpen(false);
    setEditingDepartment(null);
    setFormError(null);
  };

  /* ------------------------------------------------------------------------ */
  /* Create Department                                                        */
  /* ------------------------------------------------------------------------ */

  const handleCreate = async (
    payload: CreateDepartmentPayload
  ) => {
    setFormError(null);

    try {
      const response =
        await createDepartment.mutateAsync(
          payload
        );

      toast.success(
        response.message ||
          "Department created successfully."
      );

      setIsModalOpen(false);
      setEditingDepartment(null);

      setPage(1);
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        "Failed to create department. Please try again.";

      setFormError(message);

      toast.error(message);

      throw error;
    }
  };

  /* ------------------------------------------------------------------------ */
  /* Update Department                                                        */
  /* ------------------------------------------------------------------------ */

  const handleUpdate = async (
    payload: UpdateDepartmentPayload
  ) => {
    if (!editingDepartment) {
      return;
    }

    setFormError(null);

    try {
      const response =
        await updateDepartment.mutateAsync({
          id: editingDepartment.id,
          data: payload,
        });

      toast.success(
        response.message ||
          "Department updated successfully."
      );

      setIsModalOpen(false);
      setEditingDepartment(null);
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        "Failed to update department. Please try again.";

      setFormError(message);

      toast.error(message);

      throw error;
    }
  };

  /* ------------------------------------------------------------------------ */
  /* Delete Department                                                        */
  /* ------------------------------------------------------------------------ */

  const handleDelete = async () => {
    if (!deleteDepartment) {
      return;
    }

    try {
      const response =
        await deleteDepartmentMutation.mutateAsync(
          deleteDepartment.id
        );

      toast.success(
        response.message ||
          "Department deleted successfully."
      );

      setDeleteDepartment(null);

      /*
       * If the deleted department was the last
       * item on the current page, move back one page.
       */
      if (
        data?.data.length === 1 &&
        page > 1
      ) {
        setPage((previous) =>
          previous - 1
        );
      }
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        "Failed to delete department. Please try again.";

      toast.error(message);

      setDeleteDepartment(null);
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
          Loading departments...
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

  if (user.role !== "SUPER_ADMIN") {
    return (
      <DashboardLayout user={user}>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="max-w-md rounded-xl border border-red-200 bg-red-50 p-6 text-center">
            <AlertCircle className="mx-auto h-8 w-8 text-red-500" />

            <h2 className="mt-3 text-lg font-semibold text-red-700">
              Access Denied
            </h2>

            <p className="mt-1 text-sm text-red-600">
              You do not have permission to
              manage departments.
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  /* ------------------------------------------------------------------------ */
  /* Departments loading                                                      */
  /* ------------------------------------------------------------------------ */

  const showInitialLoading =
    isDepartmentsLoading && !data;

  if (showInitialLoading) {
    return (
      <DashboardLayout user={user}>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading departments...
          </div>
        </div>
      </DashboardLayout>
    );
  }

  /* ------------------------------------------------------------------------ */
  /* Departments error                                                        */
  /* ------------------------------------------------------------------------ */

  if (
    isDepartmentsError ||
    !data
  ) {
    return (
      <DashboardLayout user={user}>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
            <AlertCircle className="mx-auto h-8 w-8 text-red-500" />

            <h2 className="mt-3 text-lg font-semibold text-red-700">
              Unable to load departments
            </h2>

            <p className="mt-1 text-sm text-red-600">
              Something went wrong while
              loading departments.
            </p>

            <button
              type="button"
              onClick={() => refetch()}
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

  const departments =
    data.data;

  const meta =
    data.meta;

  /* ------------------------------------------------------------------------ */
  /* Render                                                                   */
  /* ------------------------------------------------------------------------ */

  return (
    <DashboardLayout user={user}>
      <div className="mx-auto max-w-6xl space-y-6">

        {/* Header + Search */}
        <DepartmentsHeader
          search={searchInput}
          onSearchChange={setSearchInput}
          onCreate={openCreateModal}
        />

        {/* Departments table */}
        <DepartmentsTable
          departments={departments}
          search={search}
          isFetching={isFetching}
          onEdit={openEditModal}
          onDelete={setDeleteDepartment}
        />

        {/* Pagination */}
        <DepartmentsPagination
          page={meta.page}
          totalPages={meta.totalPages}
          isFetching={isFetching}
          onPageChange={setPage}
        />
      </div>

      {/* Create / Edit modal */}
      <DepartmentFormModal
        open={isModalOpen}
        department={editingDepartment}
        error={formError}
        isSubmitting={
          createDepartment.isPending ||
          updateDepartment.isPending
        }
        onClose={closeModal}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
      />

      {/* Delete dialog */}
      <DeleteDepartmentDialog
        department={deleteDepartment}
        isDeleting={
          deleteDepartmentMutation.isPending
        }
        onCancel={() =>
          setDeleteDepartment(null)
        }
        onConfirm={handleDelete}
      />
    </DashboardLayout>
  );
}