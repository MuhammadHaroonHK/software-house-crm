"use client";

import {
  Loader2,
  Trash2,
  X,
} from "lucide-react";

import type { ContactPerson } from "@/features/contact-persons/types/contactPerson.types";

interface DeleteContactPersonDialogProps {
  contactPerson: ContactPerson | null;
  isDeleting?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

export default function DeleteContactPersonDialog({
  contactPerson,
  isDeleting = false,
  onCancel,
  onConfirm,
}: DeleteContactPersonDialogProps) {
  if (!contactPerson) {
    return null;
  }

  const fullName = `${contactPerson.firstName} ${contactPerson.lastName}`;

  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/40 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        {/* Icon */}
        <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-50">
          <Trash2 className="h-5 w-5 text-red-600" />
        </div>

        {/* Content */}
        <h2 className="mt-4 text-lg font-semibold text-slate-900">
          Delete Contact Person?
        </h2>

        <p className="mt-2 text-sm leading-6 text-slate-500">
          Are you sure you want to delete{" "}
          <span className="font-medium text-slate-700">
            {fullName}
          </span>
          ? This action cannot be undone.
        </p>

        {/* Optional contact information */}
        {(contactPerson.email ||
          contactPerson.designation) && (
          <div className="mt-3 rounded-lg bg-slate-50 px-3 py-2.5">
            {contactPerson.designation && (
              <p className="text-xs text-slate-500">
                {contactPerson.designation}
              </p>
            )}

            {contactPerson.email && (
              <p className="mt-0.5 truncate text-xs text-slate-500">
                {contactPerson.email}
              </p>
            )}
          </div>
        )}

        {/* Actions */}
        <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <button
            type="button"
            disabled={isDeleting}
            onClick={onCancel}
            className="flex items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            <X className="h-4 w-4" />
            Cancel
          </button>

          <button
            type="button"
            disabled={isDeleting}
            onClick={onConfirm}
            className="flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isDeleting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Deleting...
              </>
            ) : (
              <>
                <Trash2 className="h-4 w-4" />
                Delete Contact Person
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  );
}