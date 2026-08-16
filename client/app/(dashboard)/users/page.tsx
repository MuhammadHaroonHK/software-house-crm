"use client";

import { useState } from "react";
import { useQueryClient } from "@tanstack/react-query";

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
  const { data: currentUser, isLoading: currentUserLoading } =
    useCurrentUser();

  const [filters, setFilters] =
    useState<UserFilters>({
      page: 1,
      limit: 10,
      sortBy: "createdAt",
      sortOrder: "desc",
    });

  const [deleteUser, setDeleteUser] =
    useState<User | null>(null);

const [formModalOpen, setFormModalOpen] =
  useState(false);

const [editingUser, setEditingUser] =
  useState<User | null>(null);

const [formError, setFormError] =
  useState<string | null>(null);

  const queryClient = useQueryClient();

  const {
    data: usersData,
    isLoading: usersLoading,
    isError: usersError,
  } = useUsers(filters);

  const {
    data: departments = [],
  } = useDepartments();

  const updateStatusMutation =
    useUpdateUserStatus();

  const deleteMutation =
    useDeleteUser();

const createMutation =
  useCreateUser();

const updateMutation =
  useUpdateUser();

  if (currentUserLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-sm text-slate-500">
          Loading...
        </div>
      </main>
    );
  }

  if (!currentUser) {
    return null;
  }

  const users = usersData?.users ?? [];
  const meta = usersData?.meta;

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

const handleCreateUser = async (
  data: CreateUserPayload
) => {
  setFormError(null);

  try {
    await createMutation.mutateAsync(data);

    setFormModalOpen(false);
    setEditingUser(null);

    await queryClient.invalidateQueries({
      queryKey: ["users"],
    });
  } catch (error) {
    setFormError(getErrorMessage(error));
  }
};

const handleUpdateUser = async (
  data: UpdateUserPayload
) => {
  if (!editingUser) {
    return;
  }

  setFormError(null);

  try {
    await updateMutation.mutateAsync({
      id: editingUser.id,
      data,
    });

    setFormModalOpen(false);
    setEditingUser(null);

    await queryClient.invalidateQueries({
      queryKey: ["users"],
    });
  } catch (error) {
    setFormError(getErrorMessage(error));
  }
};

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

  const handleToggleStatus = async (
    user: User
  ) => {
    await updateStatusMutation.mutateAsync({
      id: user.id,
      data: {
        status:
          user.status === "ACTIVE"
            ? "INACTIVE"
            : "ACTIVE",
      },
    });
  };

  const handleDelete = async () => {
    if (!deleteUser) {
      return;
    }

    await deleteMutation.mutateAsync(
      deleteUser.id
    );

    setDeleteUser(null);

    await queryClient.invalidateQueries({
      queryKey: ["users"],
    });
  };

  return (
    <DashboardLayout user={currentUser}>
      <div className="space-y-6">
        <UsersHeader
  onCreate={() => {
    setEditingUser(null);
    setFormError(null);
    setFormModalOpen(true);
  }}
/>

        <UserFiltersComponent
          filters={filters}
          departments={departments}
          onChange={handleFilterChange}
          onReset={handleResetFilters}
        />

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

      <DeleteUserDialog
        user={deleteUser}
        open={!!deleteUser}
        loading={deleteMutation.isPending}
        onClose={() => {
          if (!deleteMutation.isPending) {
            setDeleteUser(null);
          }
        }}
        onConfirm={handleDelete}
      />

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