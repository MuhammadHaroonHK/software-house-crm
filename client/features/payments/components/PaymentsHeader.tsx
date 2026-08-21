"use client";

import {
  Banknote,
  Plus,
  Search,
} from "lucide-react";

interface PaymentsHeaderProps {
  search: string;
  onSearchChange: (
    value: string,
  ) => void;

  onCreate: () => void;
  canCreate: boolean;
}

export default function PaymentsHeader({
  search,
  onSearchChange,
  onCreate,
  canCreate,
}: PaymentsHeaderProps) {
  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <div className="flex items-center gap-2">
          <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
            <Banknote className="h-5 w-5 text-slate-600" />
          </div>

          <div>
            <h1 className="text-2xl font-bold text-slate-900">
              Payments
            </h1>

            <p className="mt-0.5 text-sm text-slate-500">
              Track payment submissions and verification.
            </p>
          </div>
        </div>
      </div>

      <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
        <div className="relative">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

          <input
            type="text"
            value={search}
            onChange={(event) =>
              onSearchChange(
                event.target.value,
              )
            }
            placeholder="Search payments..."
            className="w-full rounded-lg border border-slate-300 bg-white py-2.5 pl-9 pr-3 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200 sm:w-64"
          />
        </div>

        {canCreate && (
          <button
            type="button"
            onClick={onCreate}
            className="inline-flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            <Plus className="h-4 w-4" />
            Record Payment
          </button>
        )}
      </div>
    </div>
  );
}