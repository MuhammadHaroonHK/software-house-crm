"use client";

import {
  CalendarDays,
  CheckCircle2,
  Clock3,
  Eye,
  Loader2,
  MapPin,
  Pencil,
  Trash2,
  UserRound,
  Users,
  Video,
  XCircle,
} from "lucide-react";

import type {
  Meeting,
  MeetingStatus,
} from "../types/meeting.types";

interface MeetingsTableProps {
  meetings: Meeting[];
  isFetching?: boolean;
  search?: string;

  canEdit: (
    meeting: Meeting
  ) => boolean;

  canDelete: (
    meeting: Meeting
  ) => boolean;

  canManageParticipants: (
    meeting: Meeting
  ) => boolean;

  canChangeStatus: (
    meeting: Meeting
  ) => boolean;

  onView: (
    meeting: Meeting
  ) => void;

  onEdit: (
    meeting: Meeting
  ) => void;

  onDelete: (
    meeting: Meeting
  ) => void;

  onManageParticipants: (
    meeting: Meeting
  ) => void;

  onChangeStatus: (
    meeting: Meeting
  ) => void;
}

export default function MeetingsTable({
  meetings,
  isFetching = false,
  search = "",
  canEdit,
  canDelete,
  canManageParticipants,
  canChangeStatus,
  onView,
  onEdit,
  onDelete,
  onManageParticipants,
  onChangeStatus,
}: MeetingsTableProps) {
  return (
    <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
      {/* Header */}
      <div className="border-b border-slate-200 px-6 py-5">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              All Meetings
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {meetings.length}{" "}
              {meetings.length === 1
                ? "meeting"
                : "meetings"}{" "}
              shown.
            </p>
          </div>

          {isFetching && (
            <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
          )}
        </div>
      </div>

      {/* Empty State */}
      {meetings.length === 0 ? (
        <div className="flex min-h-[300px] flex-col items-center justify-center px-6 text-center">
          <div className="flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
            <CalendarDays className="h-6 w-6 text-slate-500" />
          </div>

          <h3 className="mt-4 text-sm font-semibold text-slate-900">
            {search
              ? "No meetings found"
              : "No meetings yet"}
          </h3>

          <p className="mt-1 max-w-sm text-sm text-slate-500">
            {search
              ? "Try changing your search or filters."
              : "Schedule your first meeting to get started."}
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
                    Meeting
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Project
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Organizer
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Date & Time
                  </th>

                  <th className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Status
                  </th>

                  <th className="px-6 py-3 text-right text-xs font-semibold uppercase tracking-wide text-slate-500">
                    Actions
                  </th>
                </tr>
              </thead>

              <tbody className="divide-y divide-slate-100">
                {meetings.map((meeting) => (
                  <tr
                    key={meeting.id}
                    className="transition hover:bg-slate-50"
                  >
                    {/* Meeting */}
                    <td className="px-6 py-4">
                      <button
                        type="button"
                        onClick={() =>
                          onView(meeting)
                        }
                        className="flex min-w-0 items-center gap-3 text-left"
                      >
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                          <Video className="h-4 w-4 text-slate-600" />
                        </div>

                        <div className="min-w-0">
                          <p className="max-w-[220px] truncate text-sm font-medium text-slate-900">
                            {meeting.title}
                          </p>

                          <p className="mt-0.5 max-w-[220px] truncate text-xs text-slate-400">
                            {meeting.location ||
                              "No location"}
                          </p>
                        </div>
                      </button>
                    </td>

                    {/* Project */}
                    <td className="px-6 py-4">
                      <span className="max-w-[180px] truncate text-sm text-slate-600">
                        {meeting.project.name}
                      </span>
                    </td>

                    {/* Organizer */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2">
                        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-100">
                          <UserRound className="h-3.5 w-3.5 text-slate-500" />
                        </div>

                        <div className="min-w-0">
                          <p className="max-w-[170px] truncate text-sm text-slate-600">
                            {meeting.organizer.firstName}{" "}
                            {meeting.organizer.lastName}
                          </p>

                          <p className="max-w-[170px] truncate text-xs text-slate-400">
                            {formatRole(
                              meeting.organizer.role.name
                            )}
                          </p>
                        </div>
                      </div>
                    </td>

                    {/* Date */}
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2 text-sm text-slate-600">
                        <CalendarDays className="h-3.5 w-3.5 text-slate-400" />

                        <span>
                          {formatDateTime(
                            meeting.meetingDate
                          )}
                        </span>
                      </div>
                    </td>

                    {/* Status */}
                    <td className="px-6 py-4">
                      <MeetingStatusBadge
                        status={meeting.status}
                      />
                    </td>

                    {/* Actions */}
                    <td className="px-6 py-4">
                      <MeetingActions
                        meeting={meeting}
                        canEdit={canEdit(meeting)}
                        canDelete={canDelete(meeting)}
                        canManageParticipants={canManageParticipants(
                          meeting
                        )}
                        canChangeStatus={canChangeStatus(
                          meeting
                        )}
                        onView={onView}
                        onEdit={onEdit}
                        onDelete={onDelete}
                        onManageParticipants={
                          onManageParticipants
                        }
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
            {meetings.map((meeting) => (
              <div
                key={meeting.id}
                className="p-4"
              >
                <div className="flex items-start justify-between gap-4">
                  <button
                    type="button"
                    onClick={() =>
                      onView(meeting)
                    }
                    className="flex min-w-0 items-center gap-3 text-left"
                  >
                    <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                      <Video className="h-5 w-5 text-slate-600" />
                    </div>

                    <div className="min-w-0">
                      <h3 className="truncate text-sm font-semibold text-slate-900">
                        {meeting.title}
                      </h3>

                      <p className="mt-1 truncate text-xs text-slate-400">
                        {meeting.project.name}
                      </p>
                    </div>
                  </button>

                  <MeetingActions
                    meeting={meeting}
                    canEdit={canEdit(meeting)}
                    canDelete={canDelete(meeting)}
                    canManageParticipants={canManageParticipants(
                      meeting
                    )}
                    canChangeStatus={canChangeStatus(
                      meeting
                    )}
                    onView={onView}
                    onEdit={onEdit}
                    onDelete={onDelete}
                    onManageParticipants={
                      onManageParticipants
                    }
                    onChangeStatus={
                      onChangeStatus
                    }
                  />
                </div>

                <div className="mt-4 flex flex-wrap items-center gap-2">
                  <MeetingStatusBadge
                    status={meeting.status}
                  />
                </div>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <CalendarDays className="h-4 w-4 text-slate-400" />

                    <span>
                      {formatDateTime(
                        meeting.meetingDate
                      )}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 text-sm text-slate-500">
                    <UserRound className="h-4 w-4 text-slate-400" />

                    <span className="truncate">
                      {meeting.organizer.firstName}{" "}
                      {meeting.organizer.lastName}
                    </span>
                  </div>

                  {meeting.location && (
                    <div className="flex items-center gap-2 text-sm text-slate-500">
                      <MapPin className="h-4 w-4 text-slate-400" />

                      <span className="truncate">
                        {meeting.location}
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
/* Actions                                                                    */
/* -------------------------------------------------------------------------- */

interface MeetingActionsProps {
  meeting: Meeting;

  canEdit: boolean;
  canDelete: boolean;
  canManageParticipants: boolean;
  canChangeStatus: boolean;

  onView: (
    meeting: Meeting
  ) => void;

  onEdit: (
    meeting: Meeting
  ) => void;

  onDelete: (
    meeting: Meeting
  ) => void;

  onManageParticipants: (
    meeting: Meeting
  ) => void;

  onChangeStatus: (
    meeting: Meeting
  ) => void;
}

function MeetingActions({
  meeting,
  canEdit,
  canDelete,
  canManageParticipants,
  canChangeStatus,
  onView,
  onEdit,
  onDelete,
  onManageParticipants,
  onChangeStatus,
}: MeetingActionsProps) {
  return (
    <div className="flex justify-end gap-1">
      {/* View */}
      <button
        type="button"
        onClick={() =>
          onView(meeting)
        }
        className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
        title="View meeting"
        aria-label="View meeting"
      >
        <Eye className="h-4 w-4" />
      </button>

      {/* Change Status */}
      {canChangeStatus &&
        meeting.status ===
          "SCHEDULED" && (
          <button
            type="button"
            onClick={() =>
              onChangeStatus(
                meeting
              )
            }
            className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
            title="Change meeting status"
            aria-label="Change meeting status"
          >
            <CheckCircle2 className="h-4 w-4" />
          </button>
        )}

      {/* Participants */}
      {canManageParticipants && (
        <button
          type="button"
          onClick={() =>
            onManageParticipants(
              meeting
            )
          }
          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
          title="Manage participants"
          aria-label="Manage participants"
        >
          <Users className="h-4 w-4" />
        </button>
      )}

      {/* Edit */}
      {canEdit && (
        <button
          type="button"
          onClick={() =>
            onEdit(meeting)
          }
          className="flex h-9 w-9 items-center justify-center rounded-lg text-slate-500 transition hover:bg-slate-100 hover:text-slate-900"
          title="Edit meeting"
          aria-label="Edit meeting"
        >
          <Pencil className="h-4 w-4" />
        </button>
      )}

      {/* Delete */}
      {canDelete && (
        <button
          type="button"
          onClick={() =>
            onDelete(meeting)
          }
          className="flex h-9 w-9 items-center justify-center rounded-lg text-red-500 transition hover:bg-red-50 hover:text-red-700"
          title="Delete meeting"
          aria-label="Delete meeting"
        >
          <Trash2 className="h-4 w-4" />
        </button>
      )}
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Status                                                                     */
/* -------------------------------------------------------------------------- */

function MeetingStatusBadge({
  status,
}: {
  status: MeetingStatus;
}) {
  const config =
    getMeetingStatusConfig(
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

function getMeetingStatusConfig(
  status: MeetingStatus
) {
  switch (status) {
    case "SCHEDULED":
      return {
        label: "Scheduled",
        icon: Clock3,
        className:
          "bg-blue-50 text-blue-700",
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
        icon: XCircle,
        className:
          "bg-red-50 text-red-700",
      };
  }
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function formatDateTime(
  value: string
): string {
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
      hour: "numeric",
      minute: "2-digit",
    }
  ).format(date);
}

function formatRole(
  role: string
): string {
  return role
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