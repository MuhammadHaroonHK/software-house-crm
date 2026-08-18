"use client";

import {
  CheckCircle2,
  Clock3,
  Loader2,
  X,
} from "lucide-react";

import type {
  Project,
  ProjectStatus,
} from "@/features/projects/types/project.types";

interface ChangeProjectStatusDialogProps {
  project: Project | null;
  isUpdating?: boolean;
  onCancel: () => void;
  onConfirm: (
    status: ProjectStatus
  ) => void;
}

const STATUS_OPTIONS: Record<
  ProjectStatus,
  ProjectStatus[]
> = {
  PLANNING: [
    "IN_PROGRESS",
    "CANCELLED",
  ],

  IN_PROGRESS: [
    "ON_HOLD",
    "COMPLETED",
    "CANCELLED",
  ],

  ON_HOLD: [
    "IN_PROGRESS",
    "COMPLETED",
    "CANCELLED",
  ],

  COMPLETED: [],

  CANCELLED: [],
};

export default function ChangeProjectStatusDialog({
  project,
  isUpdating = false,
  onCancel,
  onConfirm,
}: ChangeProjectStatusDialogProps) {
  if (!project) {
    return null;
  }

  const availableStatuses =
    STATUS_OPTIONS[project.status];

  if (
    availableStatuses.length === 0
  ) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/40 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Change Project Status
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Select the next status for{" "}
              <span className="font-medium text-slate-700">
                {project.name}
              </span>
              .
            </p>
          </div>

          <button
            type="button"
            onClick={onCancel}
            disabled={isUpdating}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Current Status */}
        <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Current status
          </p>

          <p className="mt-1 text-sm font-semibold text-slate-900">
            {formatStatus(
              project.status
            )}
          </p>
        </div>

        {/* Status Options */}
        <div className="mt-5 space-y-2">
          <p className="text-sm font-medium text-slate-700">
            Change to
          </p>

          {availableStatuses.map(
            (status) => (
              <button
                key={status}
                type="button"
                disabled={isUpdating}
                onClick={() =>
                  onConfirm(status)
                }
                className="flex w-full items-center justify-between rounded-lg border border-slate-200 px-4 py-3 text-left transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <div className="flex items-center gap-3">
                  <StatusIcon
                    status={status}
                  />

                  <span className="text-sm font-medium text-slate-700">
                    {formatStatus(
                      status
                    )}
                  </span>
                </div>

                {isUpdating && (
                  <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
                )}
              </button>
            )
          )}
        </div>

        {/* Cancel */}
        <div className="mt-6 flex justify-end">
          <button
            type="button"
            disabled={isUpdating}
            onClick={onCancel}
            className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function formatStatus(
  status: ProjectStatus
): string {
  return status
    .toLowerCase()
    .replace(
      /_/g,
      " "
    )
    .replace(
      /\b\w/g,
      (character) =>
        character.toUpperCase()
    );
}

function StatusIcon({
  status,
}: {
  status: ProjectStatus;
}) {
  if (
    status === "COMPLETED"
  ) {
    return (
      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
    );
  }

  if (
    status === "IN_PROGRESS"
  ) {
    return (
      <Loader2 className="h-4 w-4 text-blue-600" />
    );
  }

  return (
    <Clock3 className="h-4 w-4 text-slate-500" />
  );
}