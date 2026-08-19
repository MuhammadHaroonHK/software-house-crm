"use client";

import {
  CalendarDays,
  Loader2,
  Pencil,
  Plus,
  X,
} from "lucide-react";

import { useEffect, useMemo, useState } from "react";

import type {
  CreateQuotationPayload,
  Quotation,
  QuotationClient,
  QuotationProject,
  UpdateQuotationPayload,
} from "@/features/quotations/types/quotation.types";

interface QuotationFormModalProps {
  open: boolean;
  quotation?: Quotation | null;

  clients: QuotationClient[];
  projects: QuotationProject[];

  isSubmitting?: boolean;
  error?: string | null;

  onClose: () => void;

  onCreate: (
    data: CreateQuotationPayload
  ) => void;

  onUpdate: (
    data: UpdateQuotationPayload
  ) => void;

  onContinue: (
    quotation: Quotation
  ) => void;
}

interface FormState {
  quotationNumber: string;
  clientId: string;
  projectId: string;
  issueDate: string;
  expiryDate: string;
  discount: string;
  tax: string;
  notes: string;
}

interface FormErrors {
  quotationNumber?: string;
  clientId?: string;
  projectId?: string;
  issueDate?: string;
  expiryDate?: string;
  discount?: string;
  tax?: string;
  notes?: string;
}

const emptyForm: FormState = {
  quotationNumber: "",
  clientId: "",
  projectId: "",
  issueDate: "",
  expiryDate: "",
  discount: "0",
  tax: "0",
  notes: "",
};

export default function QuotationFormModal({
  open,
  quotation,
  clients,
  projects,
  isSubmitting = false,
  error,
  onClose,
  onCreate,
  onUpdate,
  onContinue,
}: QuotationFormModalProps) {
  const isEdit = Boolean(quotation);

  const [form, setForm] =
    useState<FormState>(
      emptyForm
    );

  const [errors, setErrors] =
    useState<FormErrors>({});

  useEffect(() => {
    if (!open) {
      return;
    }

    if (quotation) {
      setForm({
        quotationNumber:
          quotation.quotationNumber,

        clientId:
          quotation.clientId,

        projectId:
          quotation.projectId ?? "",

        issueDate:
          toDateInputValue(
            quotation.issueDate
          ),

        expiryDate:
          toDateInputValue(
            quotation.expiryDate
          ),

        discount:
          String(
            quotation.discount ?? 0
          ),

        tax:
          String(
            quotation.tax ?? 0
          ),

        notes:
          quotation.notes ?? "",
      });
    } else {
      setForm({
        ...emptyForm,
        issueDate:
          getTodayInputValue(),
      });
    }

    setErrors({});
  }, [open, quotation]);

  const availableProjects =
  useMemo(() => {
    if (!form.clientId) {
      return [];
    }

    return projects.filter(
      (project) =>
        !project.clientId ||
        project.clientId ===
          form.clientId
    );
  }, [
    form.clientId,
    projects,
  ]);

  if (!open) {
    return null;
  }

  const updateField = (
    field: keyof FormState,
    value: string
  ) => {
    setForm(
      (previous) => ({
        ...previous,
        [field]: value,
      })
    );

    setErrors(
      (previous) => ({
        ...previous,
        [field]:
          undefined,
      })
    );
  };

  const validate = () => {
    const nextErrors: FormErrors =
      {};

    const quotationNumber =
      form.quotationNumber.trim();

    if (!quotationNumber) {
      nextErrors.quotationNumber =
        "Quotation number is required.";
    } else if (
      quotationNumber.length < 3
    ) {
      nextErrors.quotationNumber =
        "Quotation number must be at least 3 characters.";
    } else if (
      quotationNumber.length > 100
    ) {
      nextErrors.quotationNumber =
        "Quotation number cannot exceed 100 characters.";
    }

    if (!form.clientId) {
      nextErrors.clientId =
        "Please select a client.";
    }

    if (!form.issueDate) {
      nextErrors.issueDate =
        "Issue date is required.";
    }

    if (
      form.issueDate &&
      form.expiryDate
    ) {
      const issueDate =
        new Date(
          form.issueDate
        );

      const expiryDate =
        new Date(
          form.expiryDate
        );

      if (
        Number.isNaN(
          issueDate.getTime()
        )
      ) {
        nextErrors.issueDate =
          "Please enter a valid issue date.";
      }

      if (
        Number.isNaN(
          expiryDate.getTime()
        )
      ) {
        nextErrors.expiryDate =
          "Please enter a valid expiry date.";
      }

      if (
        !Number.isNaN(
          issueDate.getTime()
        ) &&
        !Number.isNaN(
          expiryDate.getTime()
        ) &&
        expiryDate < issueDate
      ) {
        nextErrors.expiryDate =
          "Expiry date cannot be before the issue date.";
      }
    }

    const discount =
      Number(
        form.discount
      );

    const tax =
      Number(
        form.tax
      );

    if (
      !Number.isFinite(
        discount
      ) ||
      discount < 0
    ) {
      nextErrors.discount =
        "Discount must be a valid non-negative amount.";
    }

    if (
      !Number.isFinite(
        tax
      ) ||
      tax < 0
    ) {
      nextErrors.tax =
        "Tax must be a valid non-negative amount.";
    }

    if (
      form.notes.trim().length >
      5000
    ) {
      nextErrors.notes =
        "Notes cannot exceed 5000 characters.";
    }

    setErrors(
      nextErrors
    );

    return (
      Object.keys(
        nextErrors
      ).length === 0
    );
  };

  const handleSubmit = (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    const payload = {
      quotationNumber:
        form.quotationNumber.trim(),

      clientId:
        form.clientId,

      projectId:
        form.projectId ||
        undefined,

      issueDate:
        form.issueDate,

      expiryDate:
        form.expiryDate ||
        undefined,

      discount:
        Number(
          form.discount || 0
        ),

      tax:
        Number(
          form.tax || 0
        ),

      notes:
        form.notes.trim() ||
        undefined,
    };

    if (isEdit) {
      onUpdate(
        payload as UpdateQuotationPayload
      );
      return;
    }

    onCreate(
      payload as CreateQuotationPayload
    );
  };

  const clientChangedProjects =
    form.clientId
      ? availableProjects
      : [];

  const canContinueToItems =
    Boolean(
      quotation &&
        quotation.status ===
          "DRAFT"
    );

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-slate-900/40 p-4 sm:p-6">
      <div className="my-4 flex w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-white shadow-xl sm:my-8">
        {/* Header */}
        <div className="flex shrink-0 items-start justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              {isEdit
                ? "Edit Quotation"
                : "Create Quotation"}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {isEdit
                ? "Update the quotation details."
                : "Create a draft quotation for your client."}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={
              isSubmitting
            }
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={
            handleSubmit
          }
          className="max-h-[calc(100vh-8rem)] overflow-y-auto p-6"
        >
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {/* Quotation Number */}
            <div className="sm:col-span-2">
              <label
                htmlFor="quotationNumber"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Quotation Number{" "}
                <span className="text-red-500">
                  *
                </span>
              </label>

              <input
                id="quotationNumber"
                type="text"
                value={
                  form.quotationNumber
                }
                onChange={(event) =>
                  updateField(
                    "quotationNumber",
                    event.target.value
                  )
                }
                placeholder="e.g. QT-2026-001"
                maxLength={100}
                autoFocus
                disabled={
                  isSubmitting
                }
                className={inputClass(
                  errors.quotationNumber
                )}
              />

              <FieldError
                message={
                  errors.quotationNumber
                }
              />
            </div>

            {/* Client */}
            <div>
              <label
                htmlFor="quotationClient"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Client{" "}
                <span className="text-red-500">
                  *
                </span>
              </label>

              <select
                id="quotationClient"
                value={
                  form.clientId
                }
                onChange={(event) => {
                  updateField(
                    "clientId",
                    event.target.value
                  );

                  updateField(
                    "projectId",
                    ""
                  );
                }}
                disabled={
                  isSubmitting
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
                      key={
                        client.id
                      }
                      value={
                        client.id
                      }
                    >
                      {
                        client.companyName
                      }
                    </option>
                  )
                )}
              </select>

              <FieldError
                message={
                  errors.clientId
                }
              />
            </div>

            {/* Project */}
            <div>
              <label
                htmlFor="quotationProject"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Project
                <span className="ml-1 font-normal text-slate-400">
                  (Optional)
                </span>
              </label>

              <select
                id="quotationProject"
                value={
                  form.projectId
                }
                onChange={(event) =>
                  updateField(
                    "projectId",
                    event.target.value
                  )
                }
                disabled={
                  isSubmitting ||
                  !form.clientId
                }
                className={inputClass(
                  errors.projectId
                )}
              >
                <option value="">
                  {form.clientId
                    ? "Select project"
                    : "Select client first"}
                </option>

                {clientChangedProjects.map(
                  (project) => (
                    <option
                      key={
                        project.id
                      }
                      value={
                        project.id
                      }
                    >
                      {
                        project.name
                      }
                    </option>
                  )
                )}
              </select>

              <p className="mt-1 text-xs text-slate-400">
                Only projects belonging to the selected client should be used.
              </p>

              <FieldError
                message={
                  errors.projectId
                }
              />
            </div>

            {/* Issue Date */}
            <div>
              <label
                htmlFor="quotationIssueDate"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Issue Date{" "}
                <span className="text-red-500">
                  *
                </span>
              </label>

              <div className="relative">
                <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <input
                  id="quotationIssueDate"
                  type="date"
                  value={
                    form.issueDate
                  }
                  onChange={(event) =>
                    updateField(
                      "issueDate",
                      event.target.value
                    )
                  }
                  disabled={
                    isSubmitting
                  }
                  className={`pl-9 ${inputClass(
                    errors.issueDate
                  )}`}
                />
              </div>

              <FieldError
                message={
                  errors.issueDate
                }
              />
            </div>

            {/* Expiry Date */}
            <div>
              <label
                htmlFor="quotationExpiryDate"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Expiry Date
                <span className="ml-1 font-normal text-slate-400">
                  (Optional)
                </span>
              </label>

              <div className="relative">
                <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <input
                  id="quotationExpiryDate"
                  type="date"
                  value={
                    form.expiryDate
                  }
                  onChange={(event) =>
                    updateField(
                      "expiryDate",
                      event.target.value
                    )
                  }
                  disabled={
                    isSubmitting
                  }
                  className={`pl-9 ${inputClass(
                    errors.expiryDate
                  )}`}
                />
              </div>

              <FieldError
                message={
                  errors.expiryDate
                }
              />
            </div>

            {/* Discount */}
            <div>
              <label
                htmlFor="quotationDiscount"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Discount
              </label>

              <input
                id="quotationDiscount"
                type="number"
                min="0"
                step="0.01"
                value={
                  form.discount
                }
                onChange={(event) =>
                  updateField(
                    "discount",
                    event.target.value
                  )
                }
                disabled={
                  isSubmitting
                }
                placeholder="0"
                className={inputClass(
                  errors.discount
                )}
              />

              <FieldError
                message={
                  errors.discount
                }
              />
            </div>

            {/* Tax */}
            <div>
              <label
                htmlFor="quotationTax"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Tax
              </label>

              <input
                id="quotationTax"
                type="number"
                min="0"
                step="0.01"
                value={
                  form.tax
                }
                onChange={(event) =>
                  updateField(
                    "tax",
                    event.target.value
                  )
                }
                disabled={
                  isSubmitting
                }
                placeholder="0"
                className={inputClass(
                  errors.tax
                )}
              />

              <FieldError
                message={
                  errors.tax
                }
              />
            </div>

            {/* Notes */}
            <div className="sm:col-span-2">
              <label
                htmlFor="quotationNotes"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Notes
                <span className="ml-1 font-normal text-slate-400">
                  (Optional)
                </span>
              </label>

              <textarea
                id="quotationNotes"
                value={
                  form.notes
                }
                onChange={(event) =>
                  updateField(
                    "notes",
                    event.target.value
                  )
                }
                rows={4}
                maxLength={5000}
                placeholder="Additional quotation notes..."
                disabled={
                  isSubmitting
                }
                className={`${inputClass(
                  errors.notes
                )} resize-none`}
              />

              <div className="mt-1 flex justify-between">
                <FieldError
                  message={
                    errors.notes
                  }
                />

                <p className="text-xs text-slate-400">
                  {
                    form.notes
                      .length
                  }
                  /5000
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
              onClick={
                onClose
              }
              disabled={
                isSubmitting
              }
              className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            {canContinueToItems && (
              <button
                type="button"
                onClick={() =>
                  onContinue(
                    quotation as Quotation
                  )
                }
                disabled={
                  isSubmitting
                }
                className="flex items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <Plus className="h-4 w-4" />
                Manage Items
              </button>
            )}

            <button
              type="submit"
              disabled={
                isSubmitting
              }
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
                    : "Create Draft"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

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
) {
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

function getTodayInputValue() {
  const date =
    new Date();

  return date
    .toISOString()
    .slice(0, 10);
}