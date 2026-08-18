"use client";

import {
  CheckCircle2,
  Clock3,
  Loader2,
  X,
} from "lucide-react";

import type {
  Task,
  TaskStatus,
} from "@/features/tasks/types/task.types";

interface ChangeTaskStatusDialogProps {
  task: Task | null;

  isUpdating?: boolean;

  canComplete?: boolean;

  onCancel: () => void;

  onConfirm: (
    status: TaskStatus
  ) => void;
}

export default function ChangeTaskStatusDialog({
  task,
  isUpdating = false,
  canComplete = false,
  onCancel,
  onConfirm,
}: ChangeTaskStatusDialogProps) {
  if (!task) {
    return null;
  }

  const nextStatuses =
    getNextStatuses(
      task.status,
      canComplete
    );

  if (
    nextStatuses.length ===
    0
  ) {
    return null;
  }

  return (
    <div className="fixed inset-0 z-[120] flex items-center justify-center bg-slate-900/40 p-4">
      <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              Update Task Status
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Choose the next status for{" "}
              <span className="font-medium text-slate-700">
                {task.title}
              </span>
              .
            </p>
          </div>

          <button
            type="button"
            onClick={onCancel}
            disabled={
              isUpdating
            }
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Close dialog"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        <div className="mt-5 rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
          <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
            Current status
          </p>

          <p className="mt-1 text-sm font-semibold text-slate-900">
            {formatStatus(
              task.status
            )}
          </p>
        </div>

        <div className="mt-5 space-y-2">
          <p className="text-sm font-medium text-slate-700">
            Change to
          </p>

          {nextStatuses.map(
            (status) => (
              <button
                key={status}
                type="button"
                disabled={
                  isUpdating
                }
                onClick={() =>
                  onConfirm(
                    status
                  )
                }
                className="flex w-full items-center justify-between rounded-lg border border-slate-200 px-4 py-3 text-left transition hover:border-slate-300 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-60"
              >
                <div className="flex items-center gap-3">
                  <StatusIcon
                    status={
                      status
                    }
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

        {task.status ===
          "IN_REVIEW" &&
          canComplete && (
            <p className="mt-4 rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-700">
              This task has been submitted for review. You can now mark it as completed.
            </p>
          )}

        <div className="mt-6 flex justify-end">
          <button
            type="button"
            disabled={
              isUpdating
            }
            onClick={
              onCancel
            }
            className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

function getNextStatuses(
  current: TaskStatus,
  canComplete: boolean
): TaskStatus[] {
  if (
    current === "TODO"
  ) {
    return [
      "IN_PROGRESS",
    ];
  }

  if (
    current === "IN_PROGRESS"
  ) {
    return [
      "IN_REVIEW",
    ];
  }

  if (
    current === "IN_REVIEW" &&
    canComplete
  ) {
    return [
      "COMPLETED",
    ];
  }

  return [];
}

function formatStatus(
  status: TaskStatus
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
  status: TaskStatus;
}) {
  if (
    status ===
    "COMPLETED"
  ) {
    return (
      <CheckCircle2 className="h-4 w-4 text-emerald-600" />
    );
  }

  if (
    status ===
    "IN_PROGRESS"
  ) {
    return (
      <Loader2 className="h-4 w-4 text-blue-600" />
    );
  }

  return (
    <Clock3 className="h-4 w-4 text-slate-500" />
  );
}