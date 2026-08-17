"use client";

import { useEffect, useState } from "react";
import {
  Loader2,
  Pencil,
  Plus,
  X,
} from "lucide-react";

import type {
  CreateDepartmentPayload,
  Department,
  UpdateDepartmentPayload,
} from "@/features/departments/types/department.types";

interface DepartmentFormModalProps {
  open: boolean;
  department?: Department | null;
  isSubmitting?: boolean;
  error?: string | null;
  onClose: () => void;
  onCreate: (
    data: CreateDepartmentPayload
  ) => void;
  onUpdate: (
    data: UpdateDepartmentPayload
  ) => void;
}

interface FormState {
  name: string;
  description: string;
}

interface FormErrors {
  name?: string;
  description?: string;
}

export default function DepartmentFormModal({
  open,
  department,
  isSubmitting = false,
  error,
  onClose,
  onCreate,
  onUpdate,
}: DepartmentFormModalProps) {
  const isEdit = Boolean(department);

  const [form, setForm] =
    useState<FormState>({
      name: "",
      description: "",
    });

  const [errors, setErrors] =
    useState<FormErrors>({});

  useEffect(() => {
    if (!open) {
      return;
    }

    if (department) {
      setForm({
        name: department.name,
        description:
          department.description ?? "",
      });
    } else {
      setForm({
        name: "",
        description: "",
      });
    }

    setErrors({});
  }, [open, department]);

  if (!open) {
    return null;
  }

  const updateField = (
    field: keyof FormState,
    value: string
  ) => {
    setForm((previous) => ({
      ...previous,
      [field]: value,
    }));

    setErrors((previous) => ({
      ...previous,
      [field]: undefined,
    }));
  };

  const validate = (): boolean => {
    const nextErrors: FormErrors = {};

    const name = form.name.trim();
    const description =
      form.description.trim();

    if (!name) {
      nextErrors.name =
        "Department name is required.";
    } else if (name.length < 2) {
      nextErrors.name =
        "Department name must be at least 2 characters.";
    } else if (name.length > 100) {
      nextErrors.name =
        "Department name cannot exceed 100 characters.";
    }

    if (description.length > 500) {
      nextErrors.description =
        "Description cannot exceed 500 characters.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    const name = form.name.trim();
    const description =
      form.description.trim();

    if (isEdit) {
      onUpdate({
        name,
        description:
          description || undefined,
      });

      return;
    }

    onCreate({
      name,
      description:
        description || undefined,
    });
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              {isEdit
                ? "Edit Department"
                : "Add Department"}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {isEdit
                ? "Update department information."
                : "Create a new company department."}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={isSubmitting}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
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
                Department Name{" "}
                <span className="text-red-500">
                  *
                </span>
              </label>

              <input
                id="departmentName"
                type="text"
                value={form.name}
                onChange={(event) =>
                  updateField(
                    "name",
                    event.target.value
                  )
                }
                placeholder="e.g. Development"
                maxLength={100}
                autoFocus
                disabled={isSubmitting}
                className={`w-full rounded-lg border px-3 py-2.5 text-sm outline-none transition ${
                  errors.name
                    ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                    : "border-slate-300 focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                }`}
              />

              {errors.name && (
                <p className="mt-1 text-xs text-red-600">
                  {errors.name}
                </p>
              )}
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
                value={form.description}
                onChange={(event) =>
                  updateField(
                    "description",
                    event.target.value
                  )
                }
                placeholder="Brief description of the department..."
                rows={4}
                maxLength={500}
                disabled={isSubmitting}
                className={`w-full resize-none rounded-lg border px-3 py-2.5 text-sm outline-none transition ${
                  errors.description
                    ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
                    : "border-slate-300 focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
                }`}
              />

              <div className="mt-1 flex items-center justify-between">
                {errors.description ? (
                  <p className="text-xs text-red-600">
                    {errors.description}
                  </p>
                ) : (
                  <span />
                )}

                <p className="text-xs text-slate-400">
                  {form.description.length}/500
                </p>
              </div>
            </div>
          </div>

          {/* Backend error */}
          {error && (
            <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={onClose}
              disabled={isSubmitting}
              className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={isSubmitting}
              className="flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  {isEdit
                    ? "Saving..."
                    : "Creating..."}
                </>
              ) : (
                <>
                  {isEdit ? (
                    <Pencil className="h-4 w-4" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}

                  {isEdit
                    ? "Save Changes"
                    : "Create Department"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}