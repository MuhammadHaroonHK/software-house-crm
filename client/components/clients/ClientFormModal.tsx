"use client";

import { useEffect, useState } from "react";

import {
  Loader2,
  Pencil,
  Plus,
  X,
} from "lucide-react";

import type {
  Client,
  CreateClientPayload,
  UpdateClientPayload,
} from "@/features/clients/types/client.types";

interface ClientFormModalProps {
  open: boolean;
  client?: Client | null;
  isSubmitting?: boolean;
  error?: string | null;
  onClose: () => void;
  onCreate: (
    data: CreateClientPayload
  ) => void;
  onUpdate: (
    data: UpdateClientPayload
  ) => void;
}

interface FormState {
  companyName: string;
  industry: string;
  website: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  country: string;
  notes: string;
}

interface FormErrors {
  companyName?: string;
  industry?: string;
  website?: string;
  email?: string;
  phone?: string;
  address?: string;
  city?: string;
  country?: string;
  notes?: string;
}

const emptyForm: FormState = {
  companyName: "",
  industry: "",
  website: "",
  email: "",
  phone: "",
  address: "",
  city: "",
  country: "",
  notes: "",
};

export default function ClientFormModal({
  open,
  client,
  isSubmitting = false,
  error,
  onClose,
  onCreate,
  onUpdate,
}: ClientFormModalProps) {
  const isEdit = Boolean(client);

  const [form, setForm] =
    useState<FormState>(emptyForm);

  const [errors, setErrors] =
    useState<FormErrors>({});

  useEffect(() => {
    if (!open) {
      return;
    }

    if (client) {
      setForm({
        companyName:
          client.companyName,
        industry:
          client.industry ?? "",
        website:
          client.website ?? "",
        email: client.email,
        phone:
          client.phone ?? "",
        address:
          client.address ?? "",
        city: client.city ?? "",
        country:
          client.country ?? "",
        notes:
          client.notes ?? "",
      });
    } else {
      setForm(emptyForm);
    }

    setErrors({});
  }, [open, client]);

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

    const companyName =
      form.companyName.trim();

    const industry =
      form.industry.trim();

    const website =
      form.website.trim();

    const email =
      form.email.trim();

    const city =
      form.city.trim();

    const country =
      form.country.trim();

    const notes =
      form.notes.trim();

    /* Company name */
    if (!companyName) {
      nextErrors.companyName =
        "Company name is required.";
    } else if (
      companyName.length < 2
    ) {
      nextErrors.companyName =
        "Company name must be at least 2 characters.";
    } else if (
      companyName.length > 100
    ) {
      nextErrors.companyName =
        "Company name cannot exceed 100 characters.";
    }

    /* Industry */
    if (industry.length > 100) {
      nextErrors.industry =
        "Industry cannot exceed 100 characters.";
    }

    /* Website */
    if (website) {
      try {
        new URL(website);
      } catch {
        nextErrors.website =
          "Please enter a valid website URL.";
      }
    }

    /* Email */
    if (!email) {
      nextErrors.email =
        "Email address is required.";
    } else if (
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(
        email
      )
    ) {
      nextErrors.email =
        "Please enter a valid email address.";
    }

    /* City */
    if (city.length > 100) {
      nextErrors.city =
        "City cannot exceed 100 characters.";
    }

    /* Country */
    if (country.length > 100) {
      nextErrors.country =
        "Country cannot exceed 100 characters.";
    }

    /* Notes */
    if (notes.length > 1000) {
      nextErrors.notes =
        "Notes cannot exceed 1000 characters.";
    }

    setErrors(nextErrors);

    return (
      Object.keys(nextErrors).length ===
      0
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
      companyName:
        form.companyName.trim(),

      industry:
        form.industry.trim() ||
        undefined,

      website:
        form.website.trim() ||
        undefined,

      email:
        form.email.trim().toLowerCase(),

      phone:
        form.phone.trim() ||
        undefined,

      address:
        form.address.trim() ||
        undefined,

      city:
        form.city.trim() ||
        undefined,

      country:
        form.country.trim() ||
        undefined,

      notes:
        form.notes.trim() ||
        undefined,
    };

    if (isEdit) {
      onUpdate(payload);
      return;
    }

    onCreate(payload);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center overflow-y-auto bg-slate-900/40 p-4">
      <div className="my-8 w-full max-w-2xl rounded-xl bg-white shadow-xl">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              {isEdit
                ? "Edit Client"
                : "Add Client"}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {isEdit
                ? "Update client information."
                : "Add a new client to your CRM."}
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
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {/* Company Name */}
            <div className="sm:col-span-2">
              <label
                htmlFor="clientCompanyName"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Company Name{" "}
                <span className="text-red-500">
                  *
                </span>
              </label>

              <input
                id="clientCompanyName"
                type="text"
                value={form.companyName}
                onChange={(event) =>
                  updateField(
                    "companyName",
                    event.target.value
                  )
                }
                placeholder="e.g. Acme Solutions"
                maxLength={100}
                autoFocus
                disabled={isSubmitting}
                className={inputClass(
                  errors.companyName
                )}
              />

              <FieldError
                message={
                  errors.companyName
                }
              />
            </div>

            {/* Industry */}
            <div>
              <label
                htmlFor="clientIndustry"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Industry
                <span className="ml-1 font-normal text-slate-400">
                  (Optional)
                </span>
              </label>

              <input
                id="clientIndustry"
                type="text"
                value={form.industry}
                onChange={(event) =>
                  updateField(
                    "industry",
                    event.target.value
                  )
                }
                placeholder="e.g. Software"
                maxLength={100}
                disabled={isSubmitting}
                className={inputClass(
                  errors.industry
                )}
              />

              <FieldError
                message={
                  errors.industry
                }
              />
            </div>

            {/* Website */}
            <div>
              <label
                htmlFor="clientWebsite"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Website
                <span className="ml-1 font-normal text-slate-400">
                  (Optional)
                </span>
              </label>

              <input
                id="clientWebsite"
                type="url"
                value={form.website}
                onChange={(event) =>
                  updateField(
                    "website",
                    event.target.value
                  )
                }
                placeholder="https://example.com"
                disabled={isSubmitting}
                className={inputClass(
                  errors.website
                )}
              />

              <FieldError
                message={
                  errors.website
                }
              />
            </div>

            {/* Email */}
            <div>
              <label
                htmlFor="clientEmail"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Email{" "}
                <span className="text-red-500">
                  *
                </span>
              </label>

              <input
                id="clientEmail"
                type="email"
                value={form.email}
                onChange={(event) =>
                  updateField(
                    "email",
                    event.target.value
                  )
                }
                placeholder="client@example.com"
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
            <div>
              <label
                htmlFor="clientPhone"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Phone
                <span className="ml-1 font-normal text-slate-400">
                  (Optional)
                </span>
              </label>

              <input
                id="clientPhone"
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

            {/* Address */}
            <div className="sm:col-span-2">
              <label
                htmlFor="clientAddress"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Address
                <span className="ml-1 font-normal text-slate-400">
                  (Optional)
                </span>
              </label>

              <input
                id="clientAddress"
                type="text"
                value={form.address}
                onChange={(event) =>
                  updateField(
                    "address",
                    event.target.value
                  )
                }
                placeholder="Street address"
                disabled={isSubmitting}
                className={inputClass(
                  errors.address
                )}
              />

              <FieldError
                message={
                  errors.address
                }
              />
            </div>

            {/* City */}
            <div>
              <label
                htmlFor="clientCity"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                City
                <span className="ml-1 font-normal text-slate-400">
                  (Optional)
                </span>
              </label>

              <input
                id="clientCity"
                type="text"
                value={form.city}
                onChange={(event) =>
                  updateField(
                    "city",
                    event.target.value
                  )
                }
                placeholder="Peshawar"
                maxLength={100}
                disabled={isSubmitting}
                className={inputClass(
                  errors.city
                )}
              />

              <FieldError
                message={errors.city}
              />
            </div>

            {/* Country */}
            <div>
              <label
                htmlFor="clientCountry"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Country
                <span className="ml-1 font-normal text-slate-400">
                  (Optional)
                </span>
              </label>

              <input
                id="clientCountry"
                type="text"
                value={form.country}
                onChange={(event) =>
                  updateField(
                    "country",
                    event.target.value
                  )
                }
                placeholder="Pakistan"
                maxLength={100}
                disabled={isSubmitting}
                className={inputClass(
                  errors.country
                )}
              />

              <FieldError
                message={
                  errors.country
                }
              />
            </div>

            {/* Notes */}
            <div className="sm:col-span-2">
              <label
                htmlFor="clientNotes"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Notes
                <span className="ml-1 font-normal text-slate-400">
                  (Optional)
                </span>
              </label>

              <textarea
                id="clientNotes"
                value={form.notes}
                onChange={(event) =>
                  updateField(
                    "notes",
                    event.target.value
                  )
                }
                placeholder="Additional notes about this client..."
                rows={4}
                disabled={isSubmitting}
                className={`${inputClass(
                  errors.notes
                )} resize-none`}
              />

              <div className="mt-1 flex justify-between">
                <FieldError
                  message={errors.notes}
                />

                <p className="text-xs text-slate-400">
                  {form.notes.length}
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
                    : "Create Client"}
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