"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  AlertCircle,
  Building2,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  Loader2,
  Pencil,
  Plus,
  Search,
  Trash2,
  X,
} from "lucide-react";

import DashboardLayout from "@/components/dashboard/DashboardLayout";

import { useCurrentUser } from "@/features/auth/hooks/useAuth";
import { authStorage } from "@/features/auth/services/auth-storage";

import {
  useCreateDepartment,
  useDeleteDepartment,
  useDepartments,
  useUpdateDepartment,
} from "@/features/departments/hooks/useDepartments";

import type {
  Department,
} from "@/features/departments/types/department.types";

import { useRouter } from "next/navigation";

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

interface DepartmentForm {
  name: string;
  description: string;
}

/* -------------------------------------------------------------------------- */
/* Constants                                                                  */
/* -------------------------------------------------------------------------- */

const PAGE_SIZE = 10;

/* -------------------------------------------------------------------------- */
/* Page                                                                       */
/* -------------------------------------------------------------------------- */

export default function DepartmentsPage() {
  const router = useRouter();

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

  const [form, setForm] =
    useState<DepartmentForm>({
      name: "",
      description: "",
    });

  const [formError, setFormError] =
    useState<string | null>(null);

  const [successMessage, setSuccessMessage] =
    useState<string | null>(null);

  const {
    data: user,
    isLoading: isUserLoading,
    isError: isUserError,
  } = useCurrentUser();

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
  /* Authentication                                                           */
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
      setSearch(searchInput.trim());
      setPage(1);
    }, 400);

    return () => {
      clearTimeout(timeout);
    };
  }, [searchInput]);

  /* ------------------------------------------------------------------------ */
  /* Helpers                                                                  */
  /* ------------------------------------------------------------------------ */

  const openCreateModal = () => {
    setEditingDepartment(null);

    setForm({
      name: "",
      description: "",
    });

    setFormError(null);

    setIsModalOpen(true);
  };

  const openEditModal = (
    department: Department
  ) => {
    setEditingDepartment(department);

    setForm({
      name: department.name,
      description:
        department.description ?? "",
    });

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

    setForm({
      name: "",
      description: "",
    });

    setFormError(null);
  };

  const handleFormChange = (
    field: keyof DepartmentForm,
    value: string
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  /* ------------------------------------------------------------------------ */
  /* Create / Update                                                          */
  /* ------------------------------------------------------------------------ */

  const handleSubmit = async (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setFormError(null);
    setSuccessMessage(null);

    const name = form.name.trim();
    const description =
      form.description.trim();

    if (!name) {
      setFormError(
        "Department name is required."
      );

      return;
    }

    if (name.length < 2) {
      setFormError(
        "Department name must be at least 2 characters."
      );

      return;
    }

    if (name.length > 100) {
      setFormError(
        "Department name cannot exceed 100 characters."
      );

      return;
    }

    if (description.length > 500) {
      setFormError(
        "Description cannot exceed 500 characters."
      );

      return;
    }

    try {
      if (editingDepartment) {
        const response =
          await updateDepartment.mutateAsync({
            id: editingDepartment.id,
            data: {
              name,
              description:
                description || undefined,
            },
          });

        setSuccessMessage(
          response.message ||
            "Department updated successfully."
        );
      } else {
        const response =
          await createDepartment.mutateAsync({
            name,
            description:
              description || undefined,
          });

        setSuccessMessage(
          response.message ||
            "Department created successfully."
        );

        setPage(1);
      }

      setIsModalOpen(false);
      setEditingDepartment(null);

      setForm({
        name: "",
        description: "",
      });
    } catch (error: any) {
      setFormError(
        error?.response?.data?.message ||
          "Something went wrong. Please try again."
      );
    }
  };

  /* ------------------------------------------------------------------------ */
  /* Delete                                                                   */
  /* ------------------------------------------------------------------------ */

  const handleDelete = async () => {
    if (!deleteDepartment) {
      return;
    }

    setSuccessMessage(null);

    try {
      const response =
        await deleteDepartmentMutation.mutateAsync(
          deleteDepartment.id
        );

      setSuccessMessage(
        response.message ||
          "Department deleted successfully."
      );

      setDeleteDepartment(null);

      /*
       * If the current page becomes empty after
       * deletion, move back to the previous page.
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
      setDeleteDepartment(null);

      setSuccessMessage(null);

      setFormError(
        error?.response?.data?.message ||
          "Failed to delete department."
      );
    }
  };

  /* ------------------------------------------------------------------------ */
  /* Loading                                                                  */
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
  /* Error state                                                              */
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

  const departments =
    data.data;

  const meta =
    data.meta;

  return (
    <DashboardLayout user={user}>
      <div className="mx-auto max-w-6xl space-y-6">
        {/* ---------------------------------------------------------------- */}
        {/* Page heading                                                      */}
        {/* ---------------------------------------------------------------- */}

        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Departments
            </h1>

            <p className="mt-1 text-sm text-slate-500">
              Create and manage company departments.
            </p>
          </div>

          <button
            type="button"
            onClick={openCreateModal}
            className="flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            <Plus className="h-4 w-4" />
            Add Department
          </button>
        </div>

        {/* ---------------------------------------------------------------- */}
        {/* Success message                                                   */}
        {/* ---------------------------------------------------------------- */}

        {successMessage && (
          <div className="flex items-start gap-2 rounded-lg border border-green-200 bg-green-50 px-4 py-3 text-sm text-green-700">
            <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />

            <span>
              {successMessage}
            </span>

            <button
              type="button"
              onClick={() =>
                setSuccessMessage(null)
              }
              className="ml-auto text-green-600 hover:text-green-800"
              aria-label="Dismiss message"
            >
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        {/* ---------------------------------------------------------------- */}
        {/* Global error                                                      */}
        {/* ---------------------------------------------------------------- */}

        {formError &&
          !isModalOpen && (
            <div className="flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />

              <span>
                {formError}
              </span>

              <button
                type="button"
                onClick={() =>
                  setFormError(null)
                }
                className="ml-auto text-red-600 hover:text-red-800"
                aria-label="Dismiss error"
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          )}

        {/* ---------------------------------------------------------------- */}
        {/* Search                                                            */}
        {/* ---------------------------------------------------------------- */}

        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
          <div className="relative max-w-md">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

            <input
              type="search"
              value={searchInput}
              onChange={(event) =>
                setSearchInput(
                  event.target.value
                )
              }
              placeholder="Search departments..."
              className="w-full rounded-lg border border-slate-300 py-2.5 pl-9 pr-3 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            />

            {isFetching && (
              <Loader2 className="absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin text-slate-400" />
            )}
          </div>
        </section>

        {/* ---------------------------------------------------------------- */}
        {/* Department table                                                  */}
        {/* ---------------------------------------------------------------- */}

        <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
          <div className="border-b border-slate-200 px-6 py-5">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  All Departments
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {meta.total}{" "}
                  {meta.total === 1
                    ? "department"
                    : "departments"}{" "}
                  found.
                </p>
              </div>

              {isFetching && (
                <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
              )}
            </div>
          </div>

          {departments.length === 0 ? (
            <div className="flex min-h-[280px] flex-col items-center justify-center px-6 text-center">
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
                <Building2 className="h-6 w-6 text-slate-500" />
              </div>

              <h3 className="mt-4 text-sm font-semibold text-slate-900">
                {search
                  ? "No departments found"
                  : "No departments yet"}
              </h3>

              <p className="mt-1 max-w-sm text-sm text-slate-500">
                {search
                  ? "Try changing your search term."
                  : "Create your first department to get started."}
              </p>

              {!search && (
                <button
                  type="button"
                  onClick={
                    openCreateModal
                  }
                  className="mt-4 flex items-center gap-2 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
                >
                  <Plus className="h-4 w-4" />
                  Add Department
                </button>
              )}
            </div>
          ) : (
            <>
              {/* Desktop table */}
              <div className="hidden overflow-x-auto md:block">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-200 bg-slate-50">
                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Department
                      </th>

                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Description
                      </th>

                      <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Created
                      </th>

                      <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                        Actions
                      </th>
                    </tr>
                  </thead>

                  <tbody className="divide-y divide-slate-100">
                    {departments.map(
                      (department) => (
                        <tr
                          key={
                            department.id
                          }
                          className="transition hover:bg-slate-50"
                        >
                          <td className="px-6 py-4">
                            <div className="flex items-center gap-3">
                              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                                <Building2 className="h-4 w-4 text-slate-600" />
                              </div>

                              <span className="text-sm font-medium text-slate-900">
                                {
                                  department.name
                                }
                              </span>
                            </div>
                          </td>

                          <td className="max-w-md px-6 py-4">
                            <p className="truncate text-sm text-slate-500">
                              {department.description ||
                                "No description"}
                            </p>
                          </td>

                          <td className="px-6 py-4 text-sm text-slate-500">
                            {formatDate(
                              department.createdAt
                            )}
                          </td>

                          <td className="px-6 py-4">
                            <div className="flex justify-end gap-2">
                              <button
                                type="button"
                                onClick={() =>
                                  openEditModal(
                                    department
                                  )
                                }
                                className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                                title="Edit department"
                              >
                                <Pencil className="h-4 w-4" />
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  setDeleteDepartment(
                                    department
                                  )
                                }
                                className="flex h-9 w-9 items-center justify-center rounded-lg text-red-500 transition hover:bg-red-50 hover:text-red-700"
                                title="Delete department"
                              >
                                <Trash2 className="h-4 w-4" />
                              </button>
                            </div>
                          </td>
                        </tr>
                      )
                    )}
                  </tbody>
                </table>
              </div>

              {/* Mobile cards */}
              <div className="divide-y divide-slate-100 md:hidden">
                {departments.map(
                  (department) => (
                    <div
                      key={department.id}
                      className="p-4"
                    >
                      <div className="flex items-start justify-between gap-4">
                        <div className="flex min-w-0 items-center gap-3">
                          <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                            <Building2 className="h-5 w-5 text-slate-600" />
                          </div>

                          <div className="min-w-0">
                            <h3 className="truncate text-sm font-semibold text-slate-900">
                              {
                                department.name
                              }
                            </h3>

                            <p className="mt-1 text-xs text-slate-400">
                              Created{" "}
                              {formatDate(
                                department.createdAt
                              )}
                            </p>
                          </div>
                        </div>

                        <div className="flex shrink-0 gap-1">
                          <button
                            type="button"
                            onClick={() =>
                              openEditModal(
                                department
                              )
                            }
                            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                            aria-label="Edit department"
                          >
                            <Pencil className="h-4 w-4" />
                          </button>

                          <button
                            type="button"
                            onClick={() =>
                              setDeleteDepartment(
                                department
                              )
                            }
                            className="flex h-9 w-9 items-center justify-center rounded-lg text-red-500 hover:bg-red-50 hover:text-red-700"
                            aria-label="Delete department"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </div>

                      <p className="mt-3 text-sm text-slate-500">
                        {department.description ||
                          "No description"}
                      </p>
                    </div>
                  )
                )}
              </div>

              {/* Pagination */}
              {meta.totalPages > 1 && (
                <div className="flex flex-col gap-3 border-t border-slate-200 px-4 py-4 sm:flex-row sm:items-center sm:justify-between sm:px-6">
                  <p className="text-sm text-slate-500">
                    Page {meta.page} of{" "}
                    {meta.totalPages}
                  </p>

                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      disabled={
                        page <= 1 ||
                        isFetching
                      }
                      onClick={() =>
                        setPage(
                          (previous) =>
                            Math.max(
                              1,
                              previous - 1
                            )
                        )
                      }
                      className="flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </button>

                    <button
                      type="button"
                      disabled={
                        page >=
                          meta.totalPages ||
                        isFetching
                      }
                      onClick={() =>
                        setPage(
                          (previous) =>
                            Math.min(
                              meta.totalPages,
                              previous + 1
                            )
                        )
                      }
                      className="flex items-center gap-1 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </section>
      </div>

      {/* ------------------------------------------------------------------ */}
      {/* Create / Edit modal                                                 */}
      {/* ------------------------------------------------------------------ */}

      {isModalOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">
            {/* Modal header */}
            <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5">
              <div>
                <h2 className="text-lg font-semibold text-slate-900">
                  {editingDepartment
                    ? "Edit Department"
                    : "Add Department"}
                </h2>

                <p className="mt-1 text-sm text-slate-500">
                  {editingDepartment
                    ? "Update department information."
                    : "Create a new company department."}
                </p>
              </div>

              <button
                type="button"
                onClick={closeModal}
                disabled={
                  createDepartment.isPending ||
                  updateDepartment.isPending
                }
                className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Close modal"
              >
                <X className="h-5 w-5" />
              </button>
            </div>

            {/* Modal form */}
            <form
              onSubmit={handleSubmit}
              className="p-6"
            >
              <div className="space-y-5">
                {/* Name */}
                <div>
                  <label
                    htmlFor="departmentName"
                    className="mb-1.5 block text-sm font-medium text-slate-700"
                  >
                    Department Name
                  </label>

                  <input
                    id="departmentName"
                    type="text"
                    value={form.name}
                    onChange={(event) =>
                      handleFormChange(
                        "name",
                        event.target.value
                      )
                    }
                    placeholder="e.g. Development"
                    maxLength={100}
                    autoFocus
                    className="w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                  />
                </div>

                {/* Description */}
                <div>
                  <label
                    htmlFor="departmentDescription"
                    className="mb-1.5 block text-sm font-medium text-slate-700"
                  >
                    Description
                    <span className="ml-1 font-normal text-slate-400">
                      (Optional)
                    </span>
                  </label>

                  <textarea
                    id="departmentDescription"
                    value={
                      form.description
                    }
                    onChange={(event) =>
                      handleFormChange(
                        "description",
                        event.target.value
                      )
                    }
                    placeholder="Brief description of the department..."
                    rows={4}
                    maxLength={500}
                    className="w-full resize-none rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                  />

                  <p className="mt-1 text-right text-xs text-slate-400">
                    {form.description.length}
                    /500
                  </p>
                </div>
              </div>

              {/* Form error */}
              {formError && (
                <div className="mt-5 flex items-start gap-2 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                  <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />

                  <span>
                    {formError}
                  </span>
                </div>
              )}

              {/* Actions */}
              <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
                <button
                  type="button"
                  onClick={closeModal}
                  disabled={
                    createDepartment.isPending ||
                    updateDepartment.isPending
                  }
                  className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Cancel
                </button>

                <button
                  type="submit"
                  disabled={
                    createDepartment.isPending ||
                    updateDepartment.isPending
                  }
                  className="flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {createDepartment.isPending ||
                  updateDepartment.isPending ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />

                      {editingDepartment
                        ? "Saving..."
                        : "Creating..."}
                    </>
                  ) : (
                    <>
                      {editingDepartment ? (
                        <Pencil className="h-4 w-4" />
                      ) : (
                        <Plus className="h-4 w-4" />
                      )}

                      {editingDepartment
                        ? "Save Changes"
                        : "Create Department"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ------------------------------------------------------------------ */}
      {/* Delete confirmation modal                                           */}
      {/* ------------------------------------------------------------------ */}

      {deleteDepartment && (
        <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-50">
              <Trash2 className="h-5 w-5 text-red-600" />
            </div>

            <h2 className="mt-4 text-lg font-semibold text-slate-900">
              Delete Department?
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Are you sure you want to delete{" "}
              <span className="font-medium text-slate-700">
                {deleteDepartment.name}
              </span>
              ? This action cannot be undone.
            </p>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                disabled={
                  deleteDepartmentMutation.isPending
                }
                onClick={() =>
                  setDeleteDepartment(null)
                }
                className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                disabled={
                  deleteDepartmentMutation.isPending
                }
                onClick={handleDelete}
                className="flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {deleteDepartmentMutation.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Deleting...
                  </>
                ) : (
                  <>
                    <Trash2 className="h-4 w-4" />
                    Delete Department
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </DashboardLayout>
  );
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function formatDate(
  value: string
): string {
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
    }
  ).format(date);
}