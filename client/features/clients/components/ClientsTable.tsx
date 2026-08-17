"use client";

import {
  Building2,
  Globe,
  Loader2,
  Mail,
  Pencil,
  Phone,
  Trash2,
} from "lucide-react";

import type { Client } from "../types/client.types";

interface ClientsTableProps {
  clients: Client[];
  isFetching?: boolean;
  search?: string;
  canDelete?: boolean;
  onEdit: (client: Client) => void;
  onDelete: (client: Client) => void;
}

export default function ClientsTable({
  clients,
  isFetching = false,
  search = "",
  canDelete = false,
  onEdit,
  onDelete,
}: ClientsTableProps) {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      {/* Header */}
      <div className="border-b border-slate-200 px-6 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              All Clients
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {clients.length}{" "}
              {clients.length === 1
                ? "client"
                : "clients"}{" "}
              shown.
            </p>
          </div>

          {isFetching && (
            <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
          )}
        </div>
      </div>

      {/* Empty state */}
      {clients.length === 0 ? (
        <div className="flex min-h-[280px] flex-col items-center justify-center px-6 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
            <Building2 className="h-6 w-6 text-slate-500" />
          </div>

          <h3 className="mt-4 text-sm font-semibold text-slate-900">
            {search
              ? "No clients found"
              : "No clients yet"}
          </h3>

          <p className="mt-1 max-w-sm text-sm text-slate-500">
            {search
              ? "Try changing your search term."
              : "Create your first client to get started."}
          </p>
        </div>
      ) : (
        <>
          {/* Desktop table */}
          <div className="hidden overflow-x-auto md:block">
            <table className="w-full">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50">
                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Client
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Contact
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Location
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
                {clients.map((client) => (
                  <tr
                    key={client.id}
                    className="transition hover:bg-slate-50"
                  >
                    {/* Client */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                          <Building2 className="h-4 w-4 text-slate-600" />
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-slate-900">
                            {client.companyName}
                          </p>

                          <p className="mt-0.5 text-xs text-slate-400">
                            {client.industry ||
                              "No industry"}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Contact */}
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-sm text-slate-600">
                          <Mail className="h-3.5 w-3.5 shrink-0 text-slate-400" />

                          <span className="max-w-[220px] truncate">
                            {client.email}
                          </span>
                        </div>

                        {client.phone && (
                          <div className="flex items-center gap-2 text-xs text-slate-400">
                            <Phone className="h-3.5 w-3.5 shrink-0" />

                            <span>
                              {client.phone}
                            </span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Location */}
                    <td className="px-6 py-4">
                      {client.city ||
                      client.country ? (
                        <div>
                          <p className="text-sm text-slate-600">
                            {[
                              client.city,
                              client.country,
                            ]
                              .filter(Boolean)
                              .join(", ")}
                          </p>

                          {client.address && (
                            <p className="mt-0.5 max-w-[180px] truncate text-xs text-slate-400">
                              {client.address}
                            </p>
                          )}
                        </div>
                      ) : (
                        <span className="text-sm text-slate-400">
                          No location
                        </span>
                      )}
                    </td>

                    {/* Created */}
                    <td className="px-6 py-4 text-sm text-slate-500">
                      {formatDate(
                        client.createdAt
                      )}
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      <div className="flex justify-end gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            onEdit(client)
                          }
                          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
                          title="Edit client"
                        >
                          <Pencil className="h-4 w-4" />
                        </button>

                        {canDelete && (
                          <button
                            type="button"
                            onClick={() =>
                              onDelete(client)
                            }
                            className="flex h-9 w-9 items-center justify-center rounded-lg text-red-500 transition hover:bg-red-50 hover:text-red-700"
                            title="Delete client"
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

          {/* Mobile cards */}
          <div className="divide-y divide-slate-100 md:hidden">
            {clients.map((client) => (
              <div
                key={client.id}
                className="p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                      <Building2 className="h-5 w-5 text-slate-600" />
                    </div>

                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-semibold text-slate-900">
                        {client.companyName}
                      </h3>

                      <p className="mt-1 text-xs text-slate-400">
                        {client.industry ||
                          "No industry"}
                      </p>
                    </div>
                  </div>

                  <div className="flex shrink-0 gap-1">
                    <button
                      type="button"
                      onClick={() =>
                        onEdit(client)
                      }
                      className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 hover:text-slate-900"
                      aria-label="Edit client"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>

                    {canDelete && (
                      <button
                        type="button"
                        onClick={() =>
                          onDelete(client)
                        }
                        className="flex h-9 w-9 items-center justify-center rounded-lg text-red-500 hover:bg-red-50 hover:text-red-700"
                        aria-label="Delete client"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    )}
                  </div>
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-slate-600">
                    <Mail className="h-4 w-4 shrink-0 text-slate-400" />

                    <span className="truncate">
                      {client.email}
                    </span>
                  </div>

                  {client.phone && (
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Phone className="h-4 w-4 shrink-0 text-slate-400" />

                      <span>
                        {client.phone}
                      </span>
                    </div>
                  )}

                  {(client.city ||
                    client.country) && (
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Globe className="h-4 w-4 shrink-0 text-slate-400" />

                      <span>
                        {[
                          client.city,
                          client.country,
                        ]
                          .filter(Boolean)
                          .join(", ")}
                      </span>
                    </div>
                  )}
                </div>

                <p className="mt-3 text-xs text-slate-400">
                  Created{" "}
                  {formatDate(
                    client.createdAt
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

function formatDate(
  value: string
): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "N/A";
  }

  return new Intl.DateTimeFormat(
    "en-US",
    {
      month: "short",
      day: "numeric",
      year: "numeric",
    }
  ).format(date);
}