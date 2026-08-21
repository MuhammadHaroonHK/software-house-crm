"use client";

import { Plus, Search } from "lucide-react";

interface InvoicesHeaderProps {
  search: string;
  onSearchChange: (value: string) => void;
  onCreate: () => void;
  canCreate: boolean;
}

export default function InvoicesHeader({
  search,
  onSearchChange,
  onCreate,
  canCreate,
}: InvoicesHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
          Invoices
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          Manage invoices generated from accepted quotations and track their
          payment status.
        </p>
      </div>

      <div className="flex w-full flex-col gap-3 sm:w-auto sm:flex-row">
        <div className="relative min-w-0 sm:w-72">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

          <input
            type="text"
            value={search}
            onChange={(event) => onSearchChange(event.target.value)}
            placeholder="Search invoice number..."
            className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          />
        </div>

        {canCreate && (
          <button
            type="button"
            onClick={onCreate}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            <Plus className="h-4 w-4" />
            Create Invoice
          </button>
        )}
      </div>
    </div>
  );
}