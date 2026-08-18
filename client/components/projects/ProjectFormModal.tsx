"use client";

import { useEffect, useState } from "react";

import {
  CalendarDays,
  Loader2,
  Pencil,
  Plus,
  X,
} from "lucide-react";

import type {
  Project,
  CreateProjectPayload,
  UpdateProjectPayload,
  ProjectClient,
  ProjectManager,
} from "@/features/projects/types/project.types";

interface ProjectFormModalProps {
  open: boolean;
  project?: Project | null;

  clients: ProjectClient[];
  managers: ProjectManager[];

  isSubmitting?: boolean;
  error?: string | null;

  onClose: () => void;

  onCreate: (
    data: CreateProjectPayload
  ) => void;

  onUpdate: (
    data: UpdateProjectPayload
  ) => void;
}

interface FormState {
  name: string;
  description: string;
  clientId: string;
  managerId: string;
  startDate: string;
  endDate: string;
  budget: string;
}

interface FormErrors {
  name?: string;
  description?: string;
  clientId?: string;
  managerId?: string;
  startDate?: string;
  endDate?: string;
  budget?: string;
}

const emptyForm: FormState = {
  name: "",
  description: "",
  clientId: "",
  managerId: "",
  startDate: "",
  endDate: "",
  budget: "",
};

export default function ProjectFormModal({
  open,
  project,
  clients,
  managers,
  isSubmitting = false,
  error,
  onClose,
  onCreate,
  onUpdate,
}: ProjectFormModalProps) {
  const isEdit = Boolean(project);

  const [form, setForm] =
    useState<FormState>(emptyForm);

  const [errors, setErrors] =
    useState<FormErrors>({});

  useEffect(() => {
    if (!open) {
      return;
    }

    if (project) {
      setForm({
        name: project.name,
        description:
          project.description ?? "",
        clientId:
          project.clientId,
        managerId:
          project.managerId,
        startDate:
          toDateInputValue(
            project.startDate
          ),
        endDate:
          toDateInputValue(
            project.endDate
          ),
        budget:
          project.budget !== null &&
          project.budget !== undefined
            ? String(project.budget)
            : "",
      });
    } else {
      setForm(emptyForm);
    }

    setErrors({});
  }, [open, project]);

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
    const nextErrors: FormErrors =
      {};

    const name =
      form.name.trim();

    const description =
      form.description.trim();

    const budget =
      form.budget.trim();

    /* Project name */
    if (!name) {
      nextErrors.name =
        "Project name is required.";
    } else if (name.length < 2) {
      nextErrors.name =
        "Project name must be at least 2 characters.";
    } else if (name.length > 150) {
      nextErrors.name =
        "Project name cannot exceed 150 characters.";
    }

    /* Description */
    if (description.length > 5000) {
      nextErrors.description =
        "Description cannot exceed 5000 characters.";
    }

    /* Client */
    if (!form.clientId) {
      nextErrors.clientId =
        "Please select a client.";
    }

    /* Manager */
    if (!form.managerId) {
      nextErrors.managerId =
        "Please select a project manager.";
    }

    /* Dates */
    if (
      form.startDate &&
      form.endDate
    ) {
      const start =
        new Date(form.startDate);

      const end =
        new Date(form.endDate);

      if (
        Number.isNaN(
          start.getTime()
        )
      ) {
        nextErrors.startDate =
          "Please enter a valid start date.";
      }

      if (
        Number.isNaN(
          end.getTime()
        )
      ) {
        nextErrors.endDate =
          "Please enter a valid end date.";
      }

      if (
        !Number.isNaN(
          start.getTime()
        ) &&
        !Number.isNaN(
          end.getTime()
        ) &&
        end < start
      ) {
        nextErrors.endDate =
          "End date cannot be before start date.";
      }
    }

    /* Budget */
    if (budget) {
      const numericBudget =
        Number(budget);

      if (
        !Number.isFinite(
          numericBudget
        )
      ) {
        nextErrors.budget =
          "Please enter a valid budget.";
      } else if (
        numericBudget < 0
      ) {
        nextErrors.budget =
          "Budget cannot be negative.";
      }
    }

    setErrors(nextErrors);

    return (
      Object.keys(nextErrors)
        .length === 0
    );
  };

  const handleSubmit = (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    const name =
      form.name.trim();

    const description =
      form.description.trim();

    const payload = {
      name,

      clientId:
        form.clientId,

      managerId:
        form.managerId,

      description:
        description ||
        undefined,

      startDate:
        form.startDate ||
        undefined,

      endDate:
        form.endDate ||
        undefined,

      budget:
        form.budget.trim()
          ? Number(
              form.budget.trim()
            )
          : undefined,
    };

    if (isEdit) {
      /*
       * Manager changes have their own
       * backend workflow and permission.
       *
       * Therefore the normal update
       * payload does not include managerId.
       */
      const updatePayload:
        UpdateProjectPayload = {
        name: payload.name,

        description:
          payload.description,

        clientId:
          payload.clientId,

        startDate:
          payload.startDate,

        endDate:
          payload.endDate,

        budget:
          payload.budget,
      };

      onUpdate(updatePayload);
      return;
    }

    onCreate(
      payload as CreateProjectPayload
    );
  };

  /*
   * Client cannot be changed once
   * the project leaves PLANNING.
   */
  const clientLocked =
    isEdit &&
    project?.status !==
      "PLANNING";

  /*
   * Manager selection is only editable
   * through the dedicated manager workflow
   * when editing.
   */
  const managerLocked =
    isEdit;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-slate-900/40 p-4 sm:p-6">
      <div className="my-4 flex w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-white shadow-xl sm:my-8">
        {/* Header */}
        <div className="flex shrink-0 items-start justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              {isEdit
                ? "Edit Project"
                : "Add Project"}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {isEdit
                ? "Update project information."
                : "Create a new project for your client."}
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
          className="max-h-[calc(100vh-8rem)] overflow-y-auto p-6"
        >
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {/* Project Name */}
            <div className="sm:col-span-2">
              <label
                htmlFor="projectName"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Project Name{" "}
                <span className="text-red-500">
                  *
                </span>
              </label>

              <input
                id="projectName"
                type="text"
                value={form.name}
                onChange={(event) =>
                  updateField(
                    "name",
                    event.target.value
                  )
                }
                placeholder="e.g. CRM Development"
                maxLength={150}
                autoFocus
                disabled={isSubmitting}
                className={inputClass(
                  errors.name
                )}
              />

              <FieldError
                message={errors.name}
              />
            </div>

            {/* Client */}
            <div>
              <label
                htmlFor="projectClient"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Client{" "}
                <span className="text-red-500">
                  *
                </span>
              </label>

              <select
                id="projectClient"
                value={form.clientId}
                onChange={(event) =>
                  updateField(
                    "clientId",
                    event.target.value
                  )
                }
                disabled={
                  isSubmitting ||
                  clientLocked
                }
                className={inputClass(
                  errors.clientId
                )}
              >
                <option value="">
                  Select client
                </option>

                {clients.map(
                  (client) => (
                    <option
                      key={client.id}
                      value={client.id}
                    >
                      {
                        client.companyName
                      }
                    </option>
                  )
                )}
              </select>

              {clientLocked && (
                <p className="mt-1 text-xs text-slate-400">
                  Client cannot be changed after the project has started.
                </p>
              )}

              <FieldError
                message={
                  errors.clientId
                }
              />
            </div>

            {/* Project Manager */}
            <div>
              <label
                htmlFor="projectManager"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Project Manager{" "}
                <span className="text-red-500">
                  *
                </span>
              </label>

              <select
                id="projectManager"
                value={form.managerId}
                onChange={(event) =>
                  updateField(
                    "managerId",
                    event.target.value
                  )
                }
                disabled={
                  isSubmitting ||
                  managerLocked
                }
                className={inputClass(
                  errors.managerId
                )}
              >
                <option value="">
                  Select project manager
                </option>

                {managers.map(
                  (manager) => (
                    <option
                      key={manager.id}
                      value={manager.id}
                    >
                      {manager.firstName}{" "}
                      {manager.lastName}
                    </option>
                  )
                )}
              </select>

              {managerLocked && (
                <p className="mt-1 text-xs text-slate-400">
                  Use Change Manager to reassign the project.
                </p>
              )}

              <FieldError
                message={
                  errors.managerId
                }
              />
            </div>

            {/* Description */}
            <div className="sm:col-span-2">
              <label
                htmlFor="projectDescription"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Description
                <span className="ml-1 font-normal text-slate-400">
                  (Optional)
                </span>
              </label>

              <textarea
                id="projectDescription"
                value={form.description}
                onChange={(event) =>
                  updateField(
                    "description",
                    event.target.value
                  )
                }
                placeholder="Describe the project..."
                rows={4}
                maxLength={5000}
                disabled={isSubmitting}
                className={`${inputClass(
                  errors.description
                )} resize-none`}
              />

              <div className="mt-1 flex justify-between">
                <FieldError
                  message={
                    errors.description
                  }
                />

                <p className="text-xs text-slate-400">
                  {
                    form.description
                      .length
                  }
                  /5000
                </p>
              </div>
            </div>

            {/* Start Date */}
            <div>
              <label
                htmlFor="projectStartDate"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Start Date
                <span className="ml-1 font-normal text-slate-400">
                  (Optional)
                </span>
              </label>

              <div className="relative">
                <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <input
                  id="projectStartDate"
                  type="date"
                  value={
                    form.startDate
                  }
                  onChange={(event) =>
                    updateField(
                      "startDate",
                      event.target.value
                    )
                  }
                  disabled={
                    isSubmitting
                  }
                  className={`pl-9 ${inputClass(
                    errors.startDate
                  )}`}
                />
              </div>

              <FieldError
                message={
                  errors.startDate
                }
              />
            </div>

            {/* End Date */}
            <div>
              <label
                htmlFor="projectEndDate"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                End Date
                <span className="ml-1 font-normal text-slate-400">
                  (Optional)
                </span>
              </label>

              <div className="relative">
                <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <input
                  id="projectEndDate"
                  type="date"
                  value={
                    form.endDate
                  }
                  onChange={(event) =>
                    updateField(
                      "endDate",
                      event.target.value
                    )
                  }
                  disabled={
                    isSubmitting
                  }
                  className={`pl-9 ${inputClass(
                    errors.endDate
                  )}`}
                />
              </div>

              <FieldError
                message={
                  errors.endDate
                }
              />
            </div>

            {/* Budget */}
            <div className="sm:col-span-2">
              <label
                htmlFor="projectBudget"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Budget
                <span className="ml-1 font-normal text-slate-400">
                  (Optional)
                </span>
              </label>

              <input
                id="projectBudget"
                type="number"
                min="0"
                step="0.01"
                value={form.budget}
                onChange={(event) =>
                  updateField(
                    "budget",
                    event.target.value
                  )
                }
                placeholder="e.g. 250000"
                disabled={isSubmitting}
                className={inputClass(
                  errors.budget
                )}
              />

              <FieldError
                message={errors.budget}
              />
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
                    : "Create Project"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function inputClass(
  error?: string
) {
  return `w-full rounded-lg border px-3 py-2.5 text-sm text-slate-900 outline-none transition ${
    error
      ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
      : "border-slate-300 focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
  } disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-70`;
}

function FieldError({
  message,
}: {
  message?: string;
}) {
  if (!message) {
    return null;
  }

  return (
    <p className="mt-1 text-xs text-red-600">
      {message}
    </p>
  );
}

function toDateInputValue(
  value?: string | null
): string {
  if (!value) {
    return "";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "";
  }

  return date
    .toISOString()
    .slice(0, 10);
}