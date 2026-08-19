"use client";

import {
  CheckCircle2,
  Loader2,
  X,
  XCircle,
} from "lucide-react";

import type {
  Meeting,
  MeetingStatus,
} from "@/features/meetings/types/meeting.types";

interface ChangeMeetingStatusDialogProps {
  meeting: Meeting | null;
  isUpdating?: boolean;
  onCancel: () => void;
  onConfirm: (
    status: MeetingStatus
  ) => void;
}

export default function ChangeMeetingStatusDialog({
  meeting,
  isUpdating = false,
  onCancel,
  onConfirm,
}: ChangeMeetingStatusDialogProps) {
  if (!meeting) {
    return null;
  }

  if (meeting.status !== "SCHEDULED") {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[125] flex items-center justify-center bg-slate-900/40 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Update Meeting Status
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Choose the final outcome for{" "}
              <span className="font-medium text-slate-700">
                {meeting.title}
              </span>
              .
            </p>
          </div>

          <button
            type="button"
            onClick={onCancel}
            disabled={isUpdating}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 disabled:opacity-50"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Current status
          </p>

          <p className="mt-1 text-sm font-semibold text-slate-900">
            Scheduled
          </p>
        </div>

        <div className="mt-5 space-y-2">
          <button
            type="button"
            disabled={isUpdating}
            onClick={() =>
              onConfirm("COMPLETED")
            }
            className="flex w-full items-center gap-3 rounded-lg border border-slate-200 px-4 py-3 text-left transition hover:bg-slate-50 disabled:opacity-60"
          >
            <CheckCircle2 className="h-5 w-5 text-emerald-600" />

            <div>
              <p className="text-sm font-medium text-slate-800">
                Mark as Completed
              </p>

              <p className="mt-0.5 text-xs text-slate-500">
                The meeting has taken place successfully.
              </p>
            </div>

            {isUpdating && (
              <Loader2 className="ml-auto h-4 w-4 animate-spin text-slate-400" />
            )}
          </button>

          <button
            type="button"
            disabled={isUpdating}
            onClick={() =>
              onConfirm("CANCELLED")
            }
            className="flex w-full items-center gap-3 rounded-lg border border-slate-200 px-4 py-3 text-left transition hover:bg-slate-50 disabled:opacity-60"
          >
            <XCircle className="h-5 w-5 text-red-600" />

            <div>
              <p className="text-sm font-medium text-slate-800">
                Cancel Meeting
              </p>

              <p className="mt-0.5 text-xs text-slate-500">
                The meeting will be marked as cancelled.
              </p>
            </div>

            {isUpdating && (
              <Loader2 className="ml-auto h-4 w-4 animate-spin text-slate-400" />
            )}
          </button>
        </div>

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            onClick={onCancel}
            disabled={isUpdating}
            className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:opacity-50"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
}