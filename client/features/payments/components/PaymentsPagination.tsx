"use client";

import {
  ChevronLeft,
  ChevronRight,
  Loader2,
} from "lucide-react";

interface PaymentsPaginationProps {
  page: number;
  totalPages: number;
  isFetching?: boolean;

  onPageChange: (
    page: number,
  ) => void;
}

export default function PaymentsPagination({
  page,
  totalPages,
  isFetching = false,
  onPageChange,
}: PaymentsPaginationProps) {
  if (totalPages <= 1) {
    return null;
  }

  return (
    <div className="flex items-center justify-between rounded-xl border border-slate-200 bg-white px-4 py-3 shadow-sm">
      <button
        type="button"
        onClick={() =>
          onPageChange(page - 1)
        }
        disabled={
          page <= 1 ||
          isFetching
        }
        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        <ChevronLeft className="h-4 w-4" />
        Previous
      </button>

      <div className="flex items-center gap-2 text-sm text-slate-500">
        {isFetching && (
          <Loader2 className="h-4 w-4 animate-spin" />
        )}

        <span>
          Page {page} of {totalPages}
        </span>
      </div>

      <button
        type="button"
        onClick={() =>
          onPageChange(page + 1)
        }
        disabled={
          page >= totalPages ||
          isFetching
        }
        className="inline-flex items-center gap-1.5 rounded-lg border border-slate-300 px-3 py-2 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
      >
        Next
        <ChevronRight className="h-4 w-4" />
      </button>
    </div>
  );
}