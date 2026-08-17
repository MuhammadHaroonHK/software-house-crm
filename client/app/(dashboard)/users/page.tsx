"use client";

import { useState } from "react";
import { toast } from "sonner";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useCurrentUser } from "@/features/auth/hooks/useAuth";

import UserFormModal from "@/components/users/UserFormModal";

import {
  useCreateUser,
  useDeleteUser,
  useDepartments,
  useUpdateUser,
  useUpdateUserStatus,
  useUsers,
} from "@/features/users/hooks/useUsers";

import type {
  CreateUserPayload,
  UpdateUserPayload,
  User,
  UserFilters,
} from "@/features/users/types/user.types";

import UsersHeader from "@/features/users/components/UsersHeader";
import UserFiltersComponent from "@/features/users/components/UserFilters";
import UsersTable from "@/features/users/components/UsersTable";
import UsersPagination from "@/features/users/components/UsersPagination";
import DeleteUserDialog from "@/features/users/components/DeleteUserDialog";

export default function UsersPage() {
  const {
    data: currentUser,
    isLoading: currentUserLoading,
  } = useCurrentUser();

  /* ------------------------------------------------------------------------ */
  /* Filters                                                                  */
  /* ------------------------------------------------------------------------ */

  const [filters, setFilters] =
    useState<UserFilters>({
      page: 1,
      limit: 10,
      sortBy: "createdAt",
      sortOrder: "desc",
    });

  /* ------------------------------------------------------------------------ */
  /* User state                                                               */
  /* ------------------------------------------------------------------------ */

  const [deleteUser, setDeleteUser] =
    useState<User | null>(null);

  const [formModalOpen, setFormModalOpen] =
    useState(false);

  const [editingUser, setEditingUser] =
    useState<User | null>(null);

  const [formError, setFormError] =
    useState<string | null>(null);

  /* ------------------------------------------------------------------------ */
  /* Queries                                                                  */
  /* ------------------------------------------------------------------------ */

  const {
    data: usersData,
    isLoading: usersLoading,
    isError: usersError,
  } = useUsers(filters);

  const {
    data: departments = [],
  } = useDepartments();

  /* ------------------------------------------------------------------------ */
  /* Mutations                                                                */
  /* ------------------------------------------------------------------------ */

  const updateStatusMutation =
    useUpdateUserStatus();

  const deleteMutation =
    useDeleteUser();

  const createMutation =
    useCreateUser();

  const updateMutation =
    useUpdateUser();

  /* ------------------------------------------------------------------------ */
  /* Error helper                                                             */
  /* ------------------------------------------------------------------------ */

  const getErrorMessage = (
    error: unknown
  ): string => {
    if (
      typeof error === "object" &&
      error !== null &&
      "response" in error
    ) {
      const response = (
        error as {
          response?: {
            data?: {
              message?: string;
            };
          };
        }
      ).response;

      if (response?.data?.message) {
        return response.data.message;
      }
    }

    if (error instanceof Error) {
      return error.message;
    }

    return "Something went wrong. Please try again.";
  };

  /* ------------------------------------------------------------------------ */
  /* Create User                                                              */
  /* ------------------------------------------------------------------------ */

  const handleCreateUser = async (
    data: CreateUserPayload
  ) => {
    setFormError(null);

    try {
      const response =
        await createMutation.mutateAsync(
          data
        );

      toast.success(
        response.message ||
          "User created successfully."
      );

      setFormModalOpen(false);
      setEditingUser(null);
    } catch (error) {
      const message =
        getErrorMessage(error);

      setFormError(message);

      toast.error(message);
    }
  };

  /* ------------------------------------------------------------------------ */
  /* Update User                                                              */
  /* ------------------------------------------------------------------------ */

  const handleUpdateUser = async (
    data: UpdateUserPayload
  ) => {
    if (!editingUser) {
      return;
    }

    setFormError(null);

    try {
      const response =
        await updateMutation.mutateAsync({
          id: editingUser.id,
          data,
        });

      toast.success(
        response.message ||
          "User updated successfully."
      );

      setFormModalOpen(false);
      setEditingUser(null);
    } catch (error) {
      const message =
        getErrorMessage(error);

      setFormError(message);

      toast.error(message);
    }
  };

  /* ------------------------------------------------------------------------ */
  /* Filters                                                                  */
  /* ------------------------------------------------------------------------ */

  const handleFilterChange = (
    changes: Partial<UserFilters>
  ) => {
    setFilters((previous) => ({
      ...previous,
      ...changes,
    }));
  };

  const handleResetFilters = () => {
    setFilters({
      page: 1,
      limit: 10,
      sortBy: "createdAt",
      sortOrder: "desc",
    });
  };

  /* ------------------------------------------------------------------------ */
  /* Toggle User Status                                                       */
  /* ------------------------------------------------------------------------ */

  const handleToggleStatus = async (
    user: User
  ) => {
    const newStatus =
      user.status === "ACTIVE"
        ? "INACTIVE"
        : "ACTIVE";

    try {
      const response =
        await updateStatusMutation.mutateAsync({
          id: user.id,
          data: {
            status: newStatus,
          },
        });

      toast.success(
        response.message ||
          `User ${
            newStatus === "ACTIVE"
              ? "activated"
              : "deactivated"
          } successfully.`
      );
    } catch (error) {
      toast.error(
        getErrorMessage(error)
      );
    }
  };

  /* ------------------------------------------------------------------------ */
  /* Delete User                                                              */
  /* ------------------------------------------------------------------------ */

  const handleDelete = async () => {
    if (!deleteUser) {
      return;
    }

    try {
      const response =
        await deleteMutation.mutateAsync(
          deleteUser.id
        );

      toast.success(
        response.message ||
          "User deleted successfully."
      );

      setDeleteUser(null);
    } catch (error) {
      toast.error(
        getErrorMessage(error)
      );
    }
  };

  /* ------------------------------------------------------------------------ */
  /* Loading                                                                  */
  /* ------------------------------------------------------------------------ */

  if (currentUserLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-sm text-slate-500">
          Loading...
        </div>
      </main>
    );
  }

  /* ------------------------------------------------------------------------ */
  /* Authentication                                                           */
  /* ------------------------------------------------------------------------ */

  if (!currentUser) {
    return null;
  }

  /* ------------------------------------------------------------------------ */
  /* Data                                                                     */
  /* ------------------------------------------------------------------------ */

  const users =
    usersData?.users ?? [];

  const meta =
    usersData?.meta;

  /* ------------------------------------------------------------------------ */
  /* Render                                                                   */
  /* ------------------------------------------------------------------------ */

  return (
    <DashboardLayout user={currentUser}>
      <div className="space-y-6">

        {/* Header */}
        <UsersHeader
          onCreate={() => {
            setEditingUser(null);
            setFormError(null);
            setFormModalOpen(true);
          }}
        />

        {/* Filters */}
        <UserFiltersComponent
          filters={filters}
          departments={departments}
          onChange={handleFilterChange}
          onReset={handleResetFilters}
        />

        {/* Users */}
        {usersError ? (
          <div className="rounded-xl border border-red-200 bg-red-50 p-5 text-sm text-red-600">
            Failed to load users. Please try again.
          </div>
        ) : (
          <>
            <UsersTable
              users={users}
              isLoading={usersLoading}
              onEdit={(user) => {
                setEditingUser(user);
                setFormError(null);
                setFormModalOpen(true);
              }}
              onToggleStatus={
                handleToggleStatus
              }
              onDelete={setDeleteUser}
            />

            {/* Pagination */}
            {meta && (
              <UsersPagination
                page={meta.page}
                totalPages={meta.totalPages}
                total={meta.total}
                limit={meta.limit}
                onPageChange={(page) =>
                  handleFilterChange({
                    page,
                  })
                }
              />
            )}
          </>
        )}
      </div>

      {/* Delete User Dialog */}
      <DeleteUserDialog
        user={deleteUser}
        open={!!deleteUser}
        loading={
          deleteMutation.isPending
        }
        onClose={() => {
          if (
            !deleteMutation.isPending
          ) {
            setDeleteUser(null);
          }
        }}
        onConfirm={handleDelete}
      />

      {/* Create / Edit User Modal */}
      <UserFormModal
        open={formModalOpen}
        user={editingUser}
        error={formError}
        onClose={() => {
          if (
            !createMutation.isPending &&
            !updateMutation.isPending
          ) {
            setFormModalOpen(false);
            setEditingUser(null);
            setFormError(null);
          }
        }}
        onCreate={handleCreateUser}
        onUpdate={handleUpdateUser}
        isSubmitting={
          createMutation.isPending ||
          updateMutation.isPending
        }
      />
    </DashboardLayout>
  );
}