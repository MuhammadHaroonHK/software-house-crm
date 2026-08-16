"use client";

import { Plus } from "lucide-react";

interface UsersHeaderProps {
  onCreate: () => void;
}

export default function UsersHeader({
  onCreate,
}: UsersHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          Users
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Manage system users, roles, departments, and
          account status.
        </p>
      </div>

      <button
        type="button"
        onClick={onCreate}
        className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
      >
        <Plus className="h-4 w-4" />
        Add User
      </button>
    </div>
  );
}