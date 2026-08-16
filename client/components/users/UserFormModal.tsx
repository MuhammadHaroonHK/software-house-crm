"use client";

import { X } from "lucide-react";

import UserForm from "./UserForm";

import type {
  CreateUserPayload,
  UpdateUserPayload,
  User,
} from "@/features/users/types/user.types";

interface UserFormModalProps {
  open: boolean;
  user?: User | null;
  error?: string | null;
  onClose: () => void;
  onCreate: (data: CreateUserPayload) => void;
  onUpdate: (data: UpdateUserPayload) => void;
  isSubmitting?: boolean;
}

export default function UserFormModal({
  open,
  user,
  error,
  onClose,
  onCreate,
  onUpdate,
  isSubmitting = false,
}: UserFormModalProps) {
  if (!open) {
    return null;
  }

  const isEdit = Boolean(user);

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center p-4">
      {/* Overlay */}
      <button
        type="button"
        aria-label="Close modal"
        onClick={onClose}
        className="absolute inset-0 bg-slate-900/40"
      />

      {/* Modal */}
      <div className="relative z-10 w-full max-w-2xl rounded-xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-200 px-6 py-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              {isEdit ? "Edit User" : "Create User"}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {isEdit
                ? "Update the user's account information."
                : "Create a new user account."}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="rounded-lg p-2 text-slate-400 hover:bg-slate-100 hover:text-slate-600"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <div className="max-h-[80vh] overflow-y-auto p-6">
          <UserForm
  user={user}
  error={error}
  onCancel={onClose}
  onCreate={onCreate}
  onUpdate={onUpdate}
  isSubmitting={isSubmitting}
/>
        </div>
      </div>
    </div>
  );
}