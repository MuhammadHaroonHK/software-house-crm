"use client";

import { AlertTriangle, X } from "lucide-react";

import type { User } from "../types/user.types";

interface DeleteUserDialogProps {
  user: User | null;
  open: boolean;
  loading?: boolean;
  onClose: () => void;
  onConfirm: () => void;
}

export default function DeleteUserDialog({
  user,
  open,
  loading = false,
  onClose,
  onConfirm,
}: DeleteUserDialogProps) {
  if (!open || !user) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 p-4">
      <div className="w-full max-w-md rounded-xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-5 py-4">
          <h2 className="text-base font-semibold text-slate-900">
            Delete User
          </h2>

          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700 disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Content */}
        <div className="px-5 py-5">
          <div className="flex gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-red-50">
              <AlertTriangle className="h-5 w-5 text-red-600" />
            </div>

            <div>
              <h3 className="text-sm font-semibold text-slate-900">
                Are you sure?
              </h3>

              <p className="mt-1 text-sm leading-6 text-slate-500">
                You are about to permanently delete{" "}
                <span className="font-medium text-slate-700">
                  {user.firstName} {user.lastName}
                </span>
                . This action cannot be undone.
              </p>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-end gap-3 border-t border-slate-200 px-5 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={loading}
            className="rounded-lg border border-slate-200 px-4 py-2 text-sm font-medium text-slate-600 hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>

          <button
            type="button"
            onClick={onConfirm}
            disabled={loading}
            className="inline-flex min-w-[110px] items-center justify-center rounded-lg bg-red-600 px-4 py-2 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {loading ? (
              <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/40 border-t-white" />
            ) : (
              "Delete User"
            )}
          </button>
        </div>
      </div>
    </div>
  );
}