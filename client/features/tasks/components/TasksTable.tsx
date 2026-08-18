"use client";

import {
  CalendarDays,
  CheckCircle2,
  ClipboardList,
  Clock3,
  Eye,
  Loader2,
  Pencil,
  Trash2,
  UserRound,
} from "lucide-react";

import type {
  Task,
  TaskPriority,
  TaskStatus,
} from "../types/task.types";

interface TasksTableProps {
  tasks: Task[];
  isFetching?: boolean;
  search?: string;

  canEdit: (
    task: Task
  ) => boolean;

  canDelete: (
    task: Task
  ) => boolean;

  canChangeStatus: (
    task: Task
  ) => boolean;

  onView: (
    task: Task
  ) => void;

  onEdit: (
    task: Task
  ) => void;

  onDelete: (
    task: Task
  ) => void;

  onChangeStatus: (
    task: Task
  ) => void;
}

export default function TasksTable({
  tasks,
  isFetching = false,
  search = "",
  canEdit,
  canDelete,
  canChangeStatus,
  onView,
  onEdit,
  onDelete,
  onChangeStatus,
}: TasksTableProps) {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      {/* Header */}
      <div className="border-b border-slate-200 px-6 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              All Tasks
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {tasks.length}{" "}
              {tasks.length === 1
                ? "task"
                : "tasks"}{" "}
              shown.
            </p>
          </div>

          {isFetching && (
            <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
          )}
        </div>
      </div>

      {/* Empty */}
      {tasks.length === 0 ? (
        <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
            <ClipboardList className="h-6 w-6 text-slate-500" />
          </div>

          <h3 className="mt-4 text-sm font-semibold text-slate-900">
            {search
              ? "No tasks found"
              : "No tasks yet"}
          </h3>

          <p className="mt-1 max-w-sm text-sm text-slate-500">
            {search
              ? "Try changing your search or filters."
              : "Create your first task to get started."}
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
                    Task
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Project
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Assignee
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Priority
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Status
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Due Date
                  </th>

                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {tasks.map(
                  (task) => (
                    <tr
                      key={task.id}
                      className="transition hover:bg-slate-50"
                    >
                      {/* Task */}
                      <td className="px-6 py-4">
                        <button
                          type="button"
                          onClick={() =>
                            onView(
                              task
                            )
                          }
                          className="flex min-w-0 items-center gap-3 text-left"
                        >
                          <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                            <ClipboardList className="h-4 w-4 text-slate-600" />
                          </div>

                          <div className="min-w-0">
                            <p className="max-w-[220px] truncate text-sm font-medium text-slate-900">
                              {
                                task.title
                              }
                            </p>

                            <p className="mt-0.5 max-w-[220px] truncate text-xs text-slate-400">
                              {
                                task.description ||
                                "No description"
                              }
                            </p>
                          </div>
                        </button>
                      </td>

                      {/* Project */}
                      <td className="px-6 py-4">
                        <span className="max-w-[180px] truncate text-sm text-slate-600">
                          {
                            task
                              .project
                              .name
                          }
                        </span>
                      </td>

                      {/* Assignee */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100">
                            <UserRound className="h-3.5 w-3.5 text-slate-500" />
                          </div>

                          <div className="min-w-0">
                            <p className="max-w-[160px] truncate text-sm text-slate-600">
                              {
                                task
                                  .assignedTo
                                  .firstName
                              }{" "}
                              {
                                task
                                  .assignedTo
                                  .lastName
                              }
                            </p>

                            <p className="max-w-[160px] truncate text-xs text-slate-400">
                              {
                                task
                                  .assignedTo
                                  .email
                              }
                            </p>
                          </div>
                        </div>
                      </td>

                      {/* Priority */}
                      <td className="px-6 py-4">
                        <PriorityBadge
                          priority={
                            task.priority
                          }
                        />
                      </td>

                      {/* Status */}
                      <td className="px-6 py-4">
                        <TaskStatusBadge
                          status={
                            task.status
                          }
                        />
                      </td>

                      {/* Due date */}
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-2 text-sm text-slate-500">
                          <CalendarDays className="h-4 w-4 text-slate-400" />

                          <span>
                            {formatDate(
                              task.dueDate
                            )}
                          </span>
                        </div>
                      </td>

                      {/* Actions */}
                      <td className="px-6 py-4">
                        <TaskActions
                          task={task}
                          canEdit={canEdit(
                            task
                          )}
                          canDelete={canDelete(
                            task
                          )}
                          canChangeStatus={canChangeStatus(
                            task
                          )}
                          onView={onView}
                          onEdit={onEdit}
                          onDelete={
                            onDelete
                          }
                          onChangeStatus={
                            onChangeStatus
                          }
                        />
                      </td>
                    </tr>
                  )
                )}
              </tbody>
            </table>
          </div>

          {/* Mobile */}
          <div className="divide-y divide-slate-100 md:hidden">
            {tasks.map(
              (task) => (
                <div
                  key={task.id}
                  className="p-4"
                >
                  <div className="flex items-start justify-between gap-4">
                    <button
                      type="button"
                      onClick={() =>
                        onView(
                          task
                        )
                      }
                      className="flex min-w-0 items-center gap-3 text-left"
                    >
                      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                        <ClipboardList className="h-5 w-5 text-slate-600" />
                      </div>

                      <div className="min-w-0">
                        <h3 className="truncate text-sm font-semibold text-slate-900">
                          {
                            task.title
                          }
                        </h3>

                        <p className="mt-1 truncate text-xs text-slate-400">
                          {
                            task
                              .project
                              .name
                          }
                        </p>
                      </div>
                    </button>

                    <TaskActions
                      task={task}
                      canEdit={canEdit(
                        task
                      )}
                      canDelete={canDelete(
                        task
                      )}
                      canChangeStatus={canChangeStatus(
                        task
                      )}
                      onView={onView}
                      onEdit={onEdit}
                      onDelete={
                        onDelete
                      }
                      onChangeStatus={
                        onChangeStatus
                      }
                    />
                  </div>

                  <div className="mt-4 flex flex-wrap items-center gap-2">
                    <PriorityBadge
                      priority={
                        task.priority
                      }
                    />

                    <TaskStatusBadge
                      status={
                        task.status
                      }
                    />
                  </div>

                  <div className="mt-4 space-y-2">
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <UserRound className="h-4 w-4 text-slate-400" />

                      <span className="truncate">
                        {
                          task
                            .assignedTo
                            .firstName
                        }{" "}
                        {
                          task
                            .assignedTo
                            .lastName
                        }
                      </span>
                    </div>

                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <CalendarDays className="h-4 w-4 text-slate-400" />

                      <span>
                        Due{" "}
                        {formatDate(
                          task.dueDate
                        )}
                      </span>
                    </div>
                  </div>
                </div>
              )
            )}
          </div>
        </>
      )}
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Task Actions                                                               */
/* -------------------------------------------------------------------------- */

interface TaskActionsProps {
  task: Task;

  canEdit: boolean;
  canDelete: boolean;
  canChangeStatus: boolean;

  onView: (
    task: Task
  ) => void;

  onEdit: (
    task: Task
  ) => void;

  onDelete: (
    task: Task
  ) => void;

  onChangeStatus: (
    task: Task
  ) => void;
}

function TaskActions({
  task,
  canEdit,
  canDelete,
  canChangeStatus,
  onView,
  onEdit,
  onDelete,
  onChangeStatus,
}: TaskActionsProps) {
  const isCompleted =
    task.status ===
    "COMPLETED";

  return (
    <div className="flex justify-end gap-1">
      <button
        type="button"
        onClick={() =>
          onView(task)
        }
        className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
        title="View task"
        aria-label="View task"
      >
        <Eye className="h-4 w-4" />
      </button>

      {canChangeStatus &&
        !isCompleted && (
          <button
            type="button"
            onClick={() =>
              onChangeStatus(
                task
              )
            }
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            title="Update task status"
            aria-label="Update task status"
          >
            <CheckCircle2 className="h-4 w-4" />
          </button>
        )}

      {canEdit &&
        !isCompleted && (
          <button
            type="button"
            onClick={() =>
              onEdit(task)
            }
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            title="Edit task"
            aria-label="Edit task"
          >
            <Pencil className="h-4 w-4" />
          </button>
        )}

      {canDelete &&
        !isCompleted && (
          <button
            type="button"
            onClick={() =>
              onDelete(task)
            }
            className="flex h-9 w-9 items-center justify-center rounded-lg text-red-500 transition hover:bg-red-50 hover:text-red-700"
            title="Delete task"
            aria-label="Delete task"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Priority Badge                                                             */
/* -------------------------------------------------------------------------- */

function PriorityBadge({
  priority,
}: {
  priority: TaskPriority;
}) {
  const config =
    getPriorityConfig(
      priority
    );

  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-medium ${config.className}`}
    >
      {config.label}
    </span>
  );
}

function getPriorityConfig(
  priority: TaskPriority
) {
  switch (priority) {
    case "LOW":
      return {
        label: "Low",
        className:
          "bg-slate-100 text-slate-700",
      };

    case "MEDIUM":
      return {
        label: "Medium",
        className:
          "bg-blue-50 text-blue-700",
      };

    case "HIGH":
      return {
        label: "High",
        className:
          "bg-amber-50 text-amber-700",
      };

    case "URGENT":
      return {
        label: "Urgent",
        className:
          "bg-red-50 text-red-700",
      };
  }
}

/* -------------------------------------------------------------------------- */
/* Status Badge                                                               */
/* -------------------------------------------------------------------------- */

function TaskStatusBadge({
  status,
}: {
  status: TaskStatus;
}) {
  const config =
    getTaskStatusConfig(
      status
    );

  const Icon =
    config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${config.className}`}
    >
      <Icon className="h-3.5 w-3.5" />

      {config.label}
    </span>
  );
}

function getTaskStatusConfig(
  status: TaskStatus
) {
  switch (status) {
    case "TODO":
      return {
        label: "To Do",
        icon: ClipboardList,
        className:
          "bg-slate-100 text-slate-700",
      };

    case "IN_PROGRESS":
      return {
        label: "In Progress",
        icon: Loader2,
        className:
          "bg-blue-50 text-blue-700",
      };

    case "IN_REVIEW":
      return {
        label: "In Review",
        icon: Clock3,
        className:
          "bg-amber-50 text-amber-700",
      };

    case "COMPLETED":
      return {
        label: "Completed",
        icon: CheckCircle2,
        className:
          "bg-emerald-50 text-emerald-700",
      };
  }
}

/* -------------------------------------------------------------------------- */
/* Date                                                                       */
/* -------------------------------------------------------------------------- */

function formatDate(
  value: string | null
): string {
  if (!value) {
    return "No due date";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
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