"use client";

import { Search, X } from "lucide-react";

import type {
  Department,
  UserFilters as UserFiltersType,
} from "../types/user.types";

import type { UserRole } from "@/features/auth/types/auth.types";

interface UserFiltersProps {
  filters: UserFiltersType;
  departments: Department[];
  onChange: (filters: Partial<UserFiltersType>) => void;
  onReset: () => void;
}

const roles: UserRole[] = [
  "SUPER_ADMIN",
  "PROJECT_MANAGER",
  "EMPLOYEE",
  "CLIENT",
];

export default function UserFilters({
  filters,
  departments,
  onChange,
  onReset,
}: UserFiltersProps) {
  const hasFilters =
    !!filters.search ||
    !!filters.role ||
    !!filters.status ||
    !!filters.departmentId;

  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="grid gap-3 md:grid-cols-2 lg:grid-cols-5">
        {/* Search */}
        <div className="relative lg:col-span-2">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

          <input
            type="text"
            value={filters.search ?? ""}
            onChange={(event) =>
              onChange({
                search: event.target.value,
                page: 1,
              })
            }
            placeholder="Search users..."
            className="h-10 w-full rounded-lg border border-slate-200 bg-white pl-9 pr-3 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
          />
        </div>

        {/* Role */}
        <select
          value={filters.role ?? ""}
          onChange={(event) =>
            onChange({
              role:
                (event.target.value as UserRole) ||
                undefined,
              page: 1,
            })
          }
          className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
        >
          <option value="">All Roles</option>

          {roles.map((role) => (
            <option key={role} value={role}>
              {role.replaceAll("_", " ")}
            </option>
          ))}
        </select>

        {/* Status */}
        <select
          value={filters.status ?? ""}
          onChange={(event) =>
            onChange({
              status:
                event.target.value === ""
                  ? undefined
                  : (event.target.value as
                      | "ACTIVE"
                      | "INACTIVE"),
              page: 1,
            })
          }
          className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
        >
          <option value="">All Status</option>
          <option value="ACTIVE">Active</option>
          <option value="INACTIVE">Inactive</option>
        </select>

        {/* Department */}
        <select
          value={filters.departmentId ?? ""}
          onChange={(event) =>
            onChange({
              departmentId:
                event.target.value || undefined,
              page: 1,
            })
          }
          className="h-10 rounded-lg border border-slate-200 bg-white px-3 text-sm text-slate-700 outline-none focus:border-slate-400 focus:ring-2 focus:ring-slate-100"
        >
          <option value="">All Departments</option>

          {departments.map((department) => (
            <option
              key={department.id}
              value={department.id}
            >
              {department.name}
            </option>
          ))}
        </select>
      </div>

      {hasFilters && (
        <div className="mt-3 flex justify-end">
          <button
            type="button"
            onClick={onReset}
            className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-500 hover:text-slate-900"
          >
            <X className="h-4 w-4" />
            Clear filters
          </button>
        </div>
      )}
    </div>
  );
}