"use client";

import {
  Building2,
  Loader2,
  Mail,
  Pencil,
  Phone,
  Star,
  Trash2,
  UserRound,
} from "lucide-react";

import type { ContactPerson } from "../types/contactPerson.types";

interface ContactPersonsTableProps {
  contactPersons: ContactPerson[];
  isFetching?: boolean;
  search?: string;
  canDelete?: boolean;
  onEdit: (contactPerson: ContactPerson) => void;
  onDelete: (contactPerson: ContactPerson) => void;
}

export default function ContactPersonsTable({
  contactPersons,
  isFetching = false,
  search = "",
  canDelete = false,
  onEdit,
  onDelete,
}: ContactPersonsTableProps) {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      {/* Header */}
      <div className="border-b border-slate-200 px-6 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              All Contact Persons
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {contactPersons.length}{" "}
              {contactPersons.length === 1
                ? "contact person"
                : "contact persons"}{" "}
              shown.
            </p>
          </div>

          {isFetching && (
            <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
          )}
        </div>
      </div>

      {/* Empty */}
      {contactPersons.length === 0 ? (
        <div className="flex min-h-[280px] flex-col items-center justify-center px-6 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
            <UserRound className="h-6 w-6 text-slate-500" />
          </div>

          <h3 className="mt-4 text-sm font-semibold text-slate-900">
            {search
              ? "No contact persons found"
              : "No contact persons yet"}
          </h3>

          <p className="mt-1 max-w-sm text-sm text-slate-500">
            {search
              ? "Try changing your search term."
              : "Create your first contact person to get started."}
          </p>
        </div>
      ) : (
        <>
          {/* Desktop */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Contact Person
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Client
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Contact
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Created
                  </th>

                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {contactPersons.map((contactPerson) => (
                  <tr
                    key={contactPerson.id}
                    className="transition hover:bg-slate-50"
                  >
                    {/* Person */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                          <UserRound className="h-4 w-4 text-slate-600" />
                        </div>

                        <div className="min-w-0">
                          <div className="flex items-center gap-2">
                            <p className="truncate text-sm font-medium text-slate-900">
                              {contactPerson.firstName}{" "}
                              {contactPerson.lastName}
                            </p>

                            {contactPerson.isPrimary && (
                              <span
                                title="Primary contact"
                                className="inline-flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 text-[10px] font-medium text-amber-700"
                              >
                                <Star className="h-3 w-3 fill-current" />
                                Primary
                              </span>
                            )}
                          </div>

                          <p className="mt-0.5 text-xs text-slate-400">
                            {contactPerson.designation ||
                              "No designation"}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Client */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <Building2 className="h-4 w-4 shrink-0 text-slate-400" />

                        <span className="max-w-[220px] truncate">
                          {contactPerson.client?.companyName ||
                            "Unknown client"}
                        </span>
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        {contactPerson.email && (
                          <div className="flex items-center gap-2 text-sm text-slate-600">
                            <Mail className="h-3.5 w-3.5 shrink-0 text-slate-400" />

                            <span className="max-w-[220px] truncate">
                              {contactPerson.email}
                            </span>
                          </div>
                        )}

                        {contactPerson.phone && (
                          <div className="flex items-center gap-2 text-xs text-slate-400">
                            <Phone className="h-3.5 w-3.5 shrink-0" />

                            <span>
                              {contactPerson.phone}
                            </span>
                          </div>
                        )}

                        {!contactPerson.email &&
                          !contactPerson.phone && (
                            <span className="text-sm text-slate-400">
                              No contact details
                            </span>
                          )}
                      </div>
                    </td>

                    {/* Created */}
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {formatDate(
                        contactPerson.createdAt
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            onEdit(contactPerson)
                          }
                          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                          title="Edit contact person"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>

                        {canDelete && (
                          <button
                            type="button"
                            onClick={() =>
                              onDelete(contactPerson)
                            }
                            className="flex h-9 w-9 items-center justify-center rounded-lg text-red-500 transition hover:bg-red-50 hover:text-red-700"
                            title="Delete contact person"
                          >
                            <Trash2 className="h-4 w-4" />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile */}
          <div className="divide-y divide-slate-100 md:hidden">
            {contactPersons.map((contactPerson) => (
              <div
                key={contactPerson.id}
                className="p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                      <UserRound className="h-5 w-5 text-slate-600" />
                    </div>

                    <div className="min-w-0">
                      <div className="flex items-center gap-2">
                        <h3 className="truncate text-sm font-semibold text-slate-900">
                          {contactPerson.firstName}{" "}
                          {contactPerson.lastName}
                        </h3>

                        {contactPerson.isPrimary && (
                          <Star className="h-3.5 w-3.5 shrink-0 fill-current text-amber-500" />
                        )}
                      </div>

                      <p className="mt-1 text-xs text-slate-400">
                        {contactPerson.designation ||
                          "No designation"}
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 gap-1">
                    <button
                      type="button"
                      onClick={() =>
                        onEdit(contactPerson)
                      }
                      className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                      aria-label="Edit contact person"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>

                    {canDelete && (
                      <button
                        type="button"
                        onClick={() =>
                          onDelete(contactPerson)
                        }
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-red-500 hover:bg-red-50 hover:text-red-700"
                        aria-label="Delete contact person"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Building2 className="h-4 w-4 shrink-0 text-slate-400" />

                    <span className="truncate">
                      {contactPerson.client?.companyName ||
                        "Unknown client"}
                    </span>
                  </div>

                  {contactPerson.email && (
                    <div className="flex items-center gap-2 text-sm text-slate-600">
                      <Mail className="h-4 w-4 shrink-0 text-slate-400" />

                      <span className="truncate">
                        {contactPerson.email}
                      </span>
                    </div>
                  )}

                  {contactPerson.phone && (
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Phone className="h-4 w-4 shrink-0 text-slate-400" />

                      <span>
                        {contactPerson.phone}
                      </span>
                    </div>
                  )}
                </div>

                <p className="mt-3 text-xs text-slate-400">
                  Created{" "}
                  {formatDate(
                    contactPerson.createdAt
                  )}
                </p>
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}

function formatDate(value: string): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "N/A";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}