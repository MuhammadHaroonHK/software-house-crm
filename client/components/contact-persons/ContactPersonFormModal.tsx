"use client";

import { useEffect, useState } from "react";

import {
  Loader2,
  Pencil,
  Plus,
  Star,
  X,
} from "lucide-react";

import type {
  ContactPerson,
  CreateContactPersonPayload,
  UpdateContactPersonPayload,
} from "@/features/contact-persons/types/contactPerson.types";

import type { Client } from "@/features/clients/types/client.types";

interface ContactPersonFormModalProps {
  open: boolean;
  contactPerson?: ContactPerson | null;
  clients: Client[];
  isSubmitting?: boolean;
  error?: string | null;

  onClose: () => void;

  onCreate: (
    data: CreateContactPersonPayload
  ) => void;

  onUpdate: (
    data: UpdateContactPersonPayload
  ) => void;
}

interface FormState {
  clientId: string;
  firstName: string;
  lastName: string;
  designation: string;
  email: string;
  phone: string;
  isPrimary: boolean;
}

interface FormErrors {
  clientId?: string;
  firstName?: string;
  lastName?: string;
  designation?: string;
  email?: string;
  phone?: string;
}

const emptyForm: FormState = {
  clientId: "",
  firstName: "",
  lastName: "",
  designation: "",
  email: "",
  phone: "",
  isPrimary: false,
};

export default function ContactPersonFormModal({
  open,
  contactPerson,
  clients,
  isSubmitting = false,
  error,
  onClose,
  onCreate,
  onUpdate,
}: ContactPersonFormModalProps) {
  const isEdit = Boolean(contactPerson);

  const [form, setForm] =
    useState<FormState>(emptyForm);

  const [errors, setErrors] =
    useState<FormErrors>({});

  /* ------------------------------------------------------------------------ */
  /* Initialize form                                                          */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    if (!open) {
      return;
    }

    if (contactPerson) {
      setForm({
        clientId:
          contactPerson.clientId,

        firstName:
          contactPerson.firstName,

        lastName:
          contactPerson.lastName,

        designation:
          contactPerson.designation ?? "",

        email:
          contactPerson.email ?? "",

        phone:
          contactPerson.phone ?? "",

        isPrimary:
          contactPerson.isPrimary,
      });
    } else {
      setForm(emptyForm);
    }

    setErrors({});
  }, [open, contactPerson]);

  /* ------------------------------------------------------------------------ */
  /* Don't render when closed                                                 */
  /* ------------------------------------------------------------------------ */

  if (!open) {
    return null;
  }

  /* ------------------------------------------------------------------------ */
  /* Update field                                                             */
  /* ------------------------------------------------------------------------ */

  const updateField = (
    field: keyof FormState,
    value: string | boolean
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

  /* ------------------------------------------------------------------------ */
  /* Validation                                                               */
  /* ------------------------------------------------------------------------ */

  const validate = (): boolean => {
    const nextErrors: FormErrors = {};

    const clientId =
      form.clientId.trim();

    const firstName =
      form.firstName.trim();

    const lastName =
      form.lastName.trim();

    const designation =
      form.designation.trim();

    const email =
      form.email.trim();

    /* Client */
    if (!clientId) {
      nextErrors.clientId =
        "Client is required.";
    }

    /* First name */
    if (!firstName) {
      nextErrors.firstName =
        "First name is required.";
    } else if (
      firstName.length < 2
    ) {
      nextErrors.firstName =
        "First name must be at least 2 characters.";
    } else if (
      firstName.length > 50
    ) {
      nextErrors.firstName =
        "First name cannot exceed 50 characters.";
    }

    /* Last name */
    if (!lastName) {
      nextErrors.lastName =
        "Last name is required.";
    } else if (
      lastName.length < 2
    ) {
      nextErrors.lastName =
        "Last name must be at least 2 characters.";
    } else if (
      lastName.length > 50
    ) {
      nextErrors.lastName =
        "Last name cannot exceed 50 characters.";
    }

    /* Designation */
    if (designation.length > 100) {
      nextErrors.designation =
        "Designation cannot exceed 100 characters.";
    }

    /* Email */
    if (email) {
      if (
        !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
          email
        )
      ) {
        nextErrors.email =
          "Please enter a valid email address.";
      }
    }

    setErrors(nextErrors);

    return (
      Object.keys(nextErrors).length ===
      0
    );
  };

  /* ------------------------------------------------------------------------ */
  /* Submit                                                                   */
  /* ------------------------------------------------------------------------ */

  const handleSubmit = (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    const payload = {
      clientId:
        form.clientId.trim(),

      firstName:
        form.firstName.trim(),

      lastName:
        form.lastName.trim(),

      designation:
        form.designation.trim() ||
        undefined,

      email:
        form.email.trim()
          ? form.email
              .trim()
              .toLowerCase()
          : undefined,

      phone:
        form.phone.trim() ||
        undefined,

      isPrimary:
        form.isPrimary,
    };

    if (isEdit) {
      onUpdate(payload);
      return;
    }

    onCreate(payload);
  };

  /* ------------------------------------------------------------------------ */
  /* Render                                                                   */
  /* ------------------------------------------------------------------------ */

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-slate-900/40 p-4 sm:p-6">
      <div className="my-4 flex w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-white shadow-xl sm:my-8">

        {/* Header */}
        <div className="flex shrink-0 items-start justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              {isEdit
                ? "Edit Contact Person"
                : "Add Contact Person"}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {isEdit
                ? "Update contact person information."
                : "Add a contact person to a client."}
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

            {/* Client */}
            <div className="sm:col-span-2">
              <label
                htmlFor="contactPersonClient"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Client{" "}
                <span className="text-red-500">
                  *
                </span>
              </label>

              <select
                id="contactPersonClient"
                value={form.clientId}
                onChange={(event) =>
                  updateField(
                    "clientId",
                    event.target.value
                  )
                }
                disabled={isSubmitting}
                className={inputClass(
                  errors.clientId
                )}
              >
                <option value="">
                  Select a client
                </option>

                {clients.map((client) => (
                  <option
                    key={client.id}
                    value={client.id}
                  >
                    {client.companyName}
                  </option>
                ))}
              </select>

              <FieldError
                message={
                  errors.clientId
                }
              />
            </div>

            {/* First Name */}
            <div>
              <label
                htmlFor="contactPersonFirstName"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                First Name{" "}
                <span className="text-red-500">
                  *
                </span>
              </label>

              <input
                id="contactPersonFirstName"
                type="text"
                value={form.firstName}
                onChange={(event) =>
                  updateField(
                    "firstName",
                    event.target.value
                  )
                }
                placeholder="e.g. John"
                maxLength={50}
                autoFocus
                disabled={isSubmitting}
                className={inputClass(
                  errors.firstName
                )}
              />

              <FieldError
                message={
                  errors.firstName
                }
              />
            </div>

            {/* Last Name */}
            <div>
              <label
                htmlFor="contactPersonLastName"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Last Name{" "}
                <span className="text-red-500">
                  *
                </span>
              </label>

              <input
                id="contactPersonLastName"
                type="text"
                value={form.lastName}
                onChange={(event) =>
                  updateField(
                    "lastName",
                    event.target.value
                  )
                }
                placeholder="e.g. Smith"
                maxLength={50}
                disabled={isSubmitting}
                className={inputClass(
                  errors.lastName
                )}
              />

              <FieldError
                message={
                  errors.lastName
                }
              />
            </div>

            {/* Designation */}
            <div>
              <label
                htmlFor="contactPersonDesignation"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Designation

                <span className="ml-1 font-normal text-slate-400">
                  (Optional)
                </span>
              </label>

              <input
                id="contactPersonDesignation"
                type="text"
                value={form.designation}
                onChange={(event) =>
                  updateField(
                    "designation",
                    event.target.value
                  )
                }
                placeholder="e.g. Project Manager"
                maxLength={100}
                disabled={isSubmitting}
                className={inputClass(
                  errors.designation
                )}
              />

              <FieldError
                message={
                  errors.designation
                }
              />
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="contactPersonEmail"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Email

                <span className="ml-1 font-normal text-slate-400">
                  (Optional)
                </span>
              </label>

              <input
                id="contactPersonEmail"
                type="email"
                value={form.email}
                onChange={(event) =>
                  updateField(
                    "email",
                    event.target.value
                  )
                }
                placeholder="john@example.com"
                disabled={isSubmitting}
                className={inputClass(
                  errors.email
                )}
              />

              <FieldError
                message={errors.email}
              />
            </div>

            {/* Phone */}
            <div className="sm:col-span-2">
              <label
                htmlFor="contactPersonPhone"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Phone

                <span className="ml-1 font-normal text-slate-400">
                  (Optional)
                </span>
              </label>

              <input
                id="contactPersonPhone"
                type="tel"
                value={form.phone}
                onChange={(event) =>
                  updateField(
                    "phone",
                    event.target.value
                  )
                }
                placeholder="+92 300 1234567"
                disabled={isSubmitting}
                className={inputClass(
                  errors.phone
                )}
              />

              <FieldError
                message={errors.phone}
              />
            </div>

            {/* Primary Contact */}
            <div className="sm:col-span-2">
              <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
                <label className="flex cursor-pointer items-start gap-3">
                  <input
                    type="checkbox"
                    checked={form.isPrimary}
                    onChange={(event) =>
                      updateField(
                        "isPrimary",
                        event.target.checked
                      )
                    }
                    disabled={isSubmitting}
                    className="mt-1 h-4 w-4 rounded border-slate-300 text-slate-900 focus:ring-2 focus:ring-slate-300"
                  />

                  <div>
                    <div className="flex items-center gap-2">
                      <Star className="h-4 w-4 text-slate-500" />

                      <span className="text-sm font-medium text-slate-700">
                        Primary Contact
                      </span>
                    </div>

                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      Set this person as the primary
                      contact for the selected client.
                      If another person is currently
                      primary, they will be replaced.
                    </p>
                  </div>
                </label>
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
              disabled={
                isSubmitting ||
                clients.length === 0
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
                    : "Create Contact Person"}
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