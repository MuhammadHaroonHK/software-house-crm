"use client";

import { ChevronLeft, ChevronRight, Loader2 } from "lucide-react";

interface InvoicesPaginationProps {
  page: number;
  totalPages: number;
  isFetching?: boolean;
  onPageChange: (page: number) => void;
}

export default function InvoicesPagination({
  page,
  totalPages,
  isFetching = false,
  onPageChange,
}: InvoicesPaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <div className="text-sm text-slate-500">
        Page{" "}
        <span className="font-medium text-slate-700">
          {page}
        </span>{" "}
        of{" "}
        <span className="font-medium text-slate-700">
          {totalPages}
        </span>
      </div>

      <div className="flex items-center gap-2">
        <button
          type="button"
          onClick={() => onPageChange(page - 1)}
          disabled={page <= 1 || isFetching}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </button>

        {isFetching ? (
          <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
        ) : null}

        <button
          type="button"
          onClick={() => onPageChange(page + 1)}
          disabled={page >= totalPages || isFetching}
          className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 text-slate-600 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-40"
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}