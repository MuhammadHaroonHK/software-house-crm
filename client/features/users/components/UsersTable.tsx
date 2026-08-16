"use client";

import {
  Edit,
  MoreHorizontal,
  Power,
  Trash2,
  UserRound,
} from "lucide-react";

import type { User } from "../types/user.types";

interface UsersTableProps {
  users: User[];
  isLoading: boolean;
  onEdit: (user: User) => void;
  onToggleStatus: (user: User) => void;
  onDelete: (user: User) => void;
}

function getInitials(user: User) {
  return `${user.firstName.charAt(0)}${user.lastName.charAt(
    0
  )}`.toUpperCase();
}

function formatDate(date: string) {
  return new Intl.DateTimeFormat("en-PK", {
    day: "2-digit",
    month: "short",
    year: "numeric",
  }).format(new Date(date));
}

function formatRole(role: string) {
  return role.replaceAll("_", " ");
}

export default function UsersTable({
  users,
  isLoading,
  onEdit,
  onToggleStatus,
  onDelete,
}: UsersTableProps) {
  if (isLoading) {
    return (
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex min-h-[300px] items-center justify-center">
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <div className="h-4 w-4 animate-spin rounded-full border-2 border-slate-300 border-t-slate-700" />
            Loading users...
          </div>
        </div>
      </div>
    );
  }

  if (users.length === 0) {
    return (
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
            <UserRound className="h-6 w-6 text-slate-400" />
          </div>

          <h3 className="mt-4 text-sm font-semibold text-slate-900">
            No users found
          </h3>

          <p className="mt-1 max-w-sm text-sm text-slate-500">
            No users match the current filters.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[900px] text-left">
          <thead className="border-b border-slate-200 bg-slate-50">
            <tr>
              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                User
              </th>

              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Role
              </th>

              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Department
              </th>

              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Status
              </th>

              <th className="px-5 py-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
                Created
              </th>

              <th className="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                Actions
              </th>
            </tr>
          </thead>

          <tbody className="divide-y divide-slate-100">
            {users.map((user) => (
              <tr
                key={user.id}
                className="transition hover:bg-slate-50/70"
              >
                {/* User */}
                <td className="px-5 py-4">
                  <div className="flex items-center gap-3">
                    {user.profileImage ? (
                      <img
                        src={user.profileImage}
                        alt={`${user.firstName} ${user.lastName}`}
                        className="h-9 w-9 rounded-full object-cover"
                      />
                    ) : (
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
                        {getInitials(user)}
                      </div>
                    )}

                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-slate-900">
                        {user.firstName} {user.lastName}
                      </p>

                      <p className="truncate text-xs text-slate-500">
                        {user.email}
                      </p>

                      {user.phone && (
                        <p className="truncate text-xs text-slate-400">
                          {user.phone}
                        </p>
                      )}
                    </div>
                  </div>
                </td>

                {/* Role */}
                <td className="px-5 py-4">
                  <span className="text-sm text-slate-700">
                    {formatRole(user.role.name)}
                  </span>
                </td>

                {/* Department */}
                <td className="px-5 py-4">
                  <span className="text-sm text-slate-600">
                    {user.department?.name ?? "—"}
                  </span>
                </td>

                {/* Status */}
                <td className="px-5 py-4">
                  <span
                    className={`inline-flex rounded-full px-2.5 py-1 text-xs font-medium ${
                      user.status === "ACTIVE"
                        ? "bg-emerald-50 text-emerald-700"
                        : "bg-slate-100 text-slate-600"
                    }`}
                  >
                    {user.status === "ACTIVE"
                      ? "Active"
                      : "Inactive"}
                  </span>
                </td>

                {/* Created */}
                <td className="px-5 py-4 text-sm text-slate-500">
                  {formatDate(user.createdAt)}
                </td>

                {/* Actions */}
                <td className="px-5 py-4">
                  <div className="flex items-center justify-end gap-1">
                    <button
                      type="button"
                      onClick={() => onEdit(user)}
                      title="Edit user"
                      className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                    >
                      <Edit className="h-4 w-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() =>
                        onToggleStatus(user)
                      }
                      title={
                        user.status === "ACTIVE"
                          ? "Deactivate user"
                          : "Activate user"
                      }
                      className="rounded-lg p-2 text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                    >
                      <Power className="h-4 w-4" />
                    </button>

                    <button
                      type="button"
                      onClick={() => onDelete(user)}
                      title="Delete user"
                      className="rounded-lg p-2 text-slate-500 transition hover:bg-red-50 hover:text-red-600"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>

                    <button
                      type="button"
                      disabled
                      title="More actions coming later"
                      className="rounded-lg p-2 text-slate-300"
                    >
                      <MoreHorizontal className="h-4 w-4" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}