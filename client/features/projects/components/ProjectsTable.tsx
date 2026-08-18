"use client";

import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Eye,
  FolderKanban,
  Loader2,
  Pencil,
  Trash2,
  Users,
} from "lucide-react";

import type {
  Project,
  ProjectStatus,
} from "../types/project.types";

interface ProjectsTableProps {
  projects: Project[];
  isFetching?: boolean;
  search?: string;

  canEdit?: (
    project: Project
  ) => boolean;

  canDelete?: (
    project: Project
  ) => boolean;

  canChangeStatus?: (
    project: Project
  ) => boolean;

  onView: (project: Project) => void;
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;

  onChangeStatus: (
    project: Project
  ) => void;
}

export default function ProjectsTable({
  projects,
  isFetching = false,
  search = "",
  canEdit = () => false,
  canDelete = () => false,
  canChangeStatus = () => false,
  onView,
  onEdit,
  onDelete,
  onChangeStatus,
}: ProjectsTableProps) {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      {/* Header */}
      <div className="border-b border-slate-200 px-6 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              All Projects
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {projects.length}{" "}
              {projects.length === 1
                ? "project"
                : "projects"}{" "}
              shown.
            </p>
          </div>

          {isFetching && (
            <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
          )}
        </div>
      </div>

      {/* Empty state */}
      {projects.length === 0 ? (
        <div className="flex min-h-[280px] flex-col items-center justify-center px-6 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
            <FolderKanban className="h-6 w-6 text-slate-500" />
          </div>

          <h3 className="mt-4 text-sm font-semibold text-slate-900">
            {search
              ? "No projects found"
              : "No projects yet"}
          </h3>

          <p className="mt-1 max-w-sm text-sm text-slate-500">
            {search
              ? "Try changing your search term."
              : "Create your first project to get started."}
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
                    Project
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Client
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Status
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Manager
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Dates
                  </th>

                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {projects.map((project) => (
                  <tr
                    key={project.id}
                    className="transition hover:bg-slate-50"
                  >
                    {/* Project */}
                    <td className="px-6 py-4">
                      <button
                        type="button"
                        onClick={() =>
                          onView(project)
                        }
                        className="flex min-w-0 items-center gap-3 text-left"
                      >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                          <FolderKanban className="h-4 w-4 text-slate-600" />
                        </div>

                        <div className="min-w-0">
                          <p className="truncate text-sm font-medium text-slate-900 hover:text-slate-700">
                            {project.name}
                          </p>

                          <p className="mt-0.5 max-w-[220px] truncate text-xs text-slate-400">
                            {project.description ||
                              "No description"}
                          </p>
                        </div>
                      </button>
                    </td>

                    {/* Client */}
                    <td className="px-6 py-4">
                      {project.client ? (
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                            <FolderKanban className="h-3.5 w-3.5 text-slate-500" />
                          </div>

                          <span className="max-w-[180px] truncate text-sm text-slate-600">
                            {project.client.companyName}
                          </span>
                        </div>
                      ) : (
                        <span className="text-sm text-slate-400">
                          No client
                        </span>
                      )}
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <ProjectStatusBadge
                        status={project.status}
                      />
                    </td>

                    {/* Manager */}
                    <td className="px-6 py-4">
                      {project.manager ? (
                        <div className="flex items-center gap-2">
                          <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100">
                            <Users className="h-3.5 w-3.5 text-slate-500" />
                          </div>

                          <div className="min-w-0">
                            <p className="max-w-[160px] truncate text-sm text-slate-600">
                              {project.manager.firstName}{" "}
                              {project.manager.lastName}
                            </p>
                          </div>
                        </div>
                      ) : (
                        <span className="text-sm text-slate-400">
                          Unassigned
                        </span>
                      )}
                    </td>

                    {/* Dates */}
                    <td className="px-6 py-4">
                      <div className="space-y-1">
                        <div className="flex items-center gap-2 text-xs text-slate-500">
                          <CalendarDays className="h-3.5 w-3.5 text-slate-400" />

                          <span>
                            {formatDate(
                              project.startDate
                            )}
                          </span>
                        </div>

                        {project.endDate && (
                          <div className="flex items-center gap-2 text-xs text-slate-400">
                            <Clock3 className="h-3.5 w-3.5" />

                            <span>
                              {formatDate(
                                project.endDate
                              )}
                            </span>
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      <ProjectActions
                        project={project}
                        canEdit={canEdit(project)}
                        canDelete={canDelete(project)}
                        canChangeStatus={canChangeStatus(
                          project
                        )}
                        onView={onView}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        onChangeStatus={
                          onChangeStatus
                        }
                      />
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Mobile cards */}
          <div className="divide-y divide-slate-100 md:hidden">
            {projects.map((project) => (
              <div
                key={project.id}
                className="p-4"
              >
                {/* Project heading + actions */}
                <div className="flex items-start justify-between gap-4">
                  <button
                    type="button"
                    onClick={() =>
                      onView(project)
                    }
                    className="flex min-w-0 items-center gap-3 text-left"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                      <FolderKanban className="h-5 w-5 text-slate-600" />
                    </div>

                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-semibold text-slate-900">
                        {project.name}
                      </h3>

                      <p className="mt-1 truncate text-xs text-slate-400">
                        {project.description ||
                          "No description"}
                      </p>
                    </div>
                  </button>

                  <ProjectActions
                    project={project}
                    canEdit={canEdit(project)}
                    canDelete={canDelete(project)}
                    canChangeStatus={canChangeStatus(
                      project
                    )}
                    onView={onView}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onChangeStatus={
                      onChangeStatus
                    }
                  />
                </div>

                {/* Status */}
                <div className="mt-4">
                  <ProjectStatusBadge
                    status={project.status}
                  />
                </div>

                {/* Details */}
                <div className="mt-4 space-y-2">
                  {/* Client */}
                  {project.client && (
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <FolderKanban className="h-4 w-4 shrink-0 text-slate-400" />

                      <span className="truncate">
                        {
                          project.client
                            .companyName
                        }
                      </span>
                    </div>
                  )}

                  {/* Manager */}
                  {project.manager && (
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Users className="h-4 w-4 shrink-0 text-slate-400" />

                      <span className="truncate">
                        {
                          project.manager
                            .firstName
                        }{" "}
                        {
                          project.manager
                            .lastName
                        }
                      </span>
                    </div>
                  )}

                  {/* Start date */}
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <CalendarDays className="h-4 w-4 shrink-0 text-slate-400" />

                    <span>
                      Started{" "}
                      {formatDate(
                        project.startDate
                      )}
                    </span>
                  </div>

                  {/* End date */}
                  {project.endDate && (
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <Clock3 className="h-4 w-4 shrink-0 text-slate-400" />

                      <span>
                        Ends{" "}
                        {formatDate(
                          project.endDate
                        )}
                      </span>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </>
      )}
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Project Actions                                                            */
/* -------------------------------------------------------------------------- */

interface ProjectActionsProps {
  project: Project;

  canEdit: boolean;
  canDelete: boolean;
  canChangeStatus: boolean;

  onView: (project: Project) => void;
  onEdit: (project: Project) => void;
  onDelete: (project: Project) => void;
  onChangeStatus: (
    project: Project
  ) => void;
}

function ProjectActions({
  project,
  canEdit,
  canDelete,
  canChangeStatus,
  onView,
  onEdit,
  onDelete,
  onChangeStatus,
}: ProjectActionsProps) {
  const isTerminal =
    project.status ===
      "COMPLETED" ||
    project.status ===
      "CANCELLED";

  const allowEdit =
    canEdit && !isTerminal;

  const allowDelete =
    canDelete && !isTerminal;

  const allowStatusChange =
    canChangeStatus &&
    !isTerminal;

  return (
    <div className="flex justify-end gap-1">
      {/* View */}
      <button
        type="button"
        onClick={() =>
          onView(project)
        }
        className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
        title="View project"
        aria-label="View project"
      >
        <Eye className="h-4 w-4" />
      </button>

      {/* Change Status */}
      {allowStatusChange && (
        <button
          type="button"
          onClick={() =>
            onChangeStatus(project)
          }
          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
          title="Change project status"
          aria-label="Change project status"
        >
          <CheckCircle2 className="h-4 w-4" />
        </button>
      )}

      {/* Edit */}
      {allowEdit && (
        <button
          type="button"
          onClick={() =>
            onEdit(project)
          }
          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
          title="Edit project"
          aria-label="Edit project"
        >
          <Pencil className="h-4 w-4" />
        </button>
      )}

      {/* Delete */}
      {allowDelete && (
        <button
          type="button"
          onClick={() =>
            onDelete(project)
          }
          className="flex h-9 w-9 items-center justify-center rounded-lg text-red-500 transition hover:bg-red-50 hover:text-red-700"
          title="Delete project"
          aria-label="Delete project"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Status Badge                                                               */
/* -------------------------------------------------------------------------- */

function ProjectStatusBadge({
  status,
}: {
  status: ProjectStatus;
}) {
  const config =
    getProjectStatusConfig(status);

  const Icon = config.icon;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-medium ${config.className}`}
    >
      <Icon className="h-3.5 w-3.5" />

      {config.label}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/* Status Configuration                                                       */
/* -------------------------------------------------------------------------- */

function getProjectStatusConfig(
  status: ProjectStatus
) {
  switch (status) {
    case "PLANNING":
      return {
        label: "Planning",
        icon: Clock3,
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

    case "ON_HOLD":
      return {
        label: "On Hold",
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

    case "CANCELLED":
      return {
        label: "Cancelled",
        icon: Clock3,
        className:
          "bg-red-50 text-red-700",
      };

    default:
      return {
        label: status,
        icon: Clock3,
        className:
          "bg-slate-100 text-slate-700",
      };
  }
}

/* -------------------------------------------------------------------------- */
/* Date Formatter                                                             */
/* -------------------------------------------------------------------------- */

function formatDate(
  value: string | null | undefined
): string {
  if (!value) {
    return "N/A";
  }

  const date = new Date(value);

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