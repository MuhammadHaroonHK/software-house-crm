"use client";

import {
  CalendarDays,
  Clock3,
  Loader2,
  Pencil,
  Plus,
  UserRound,
  X,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import {
  useProjectMembers,
} from "@/features/projects/hooks/useProjectMembers";

import type {
  Project,
} from "@/features/projects/types/project.types";

import type {
  Meeting,
  MeetingStatus,
  CreateMeetingPayload,
  UpdateMeetingPayload,
} from "@/features/meetings/types/meeting.types";

interface MeetingFormModalProps {
  open: boolean;
  meeting?: Meeting | null;

  projects: Project[];

  isSubmitting?: boolean;
  error?: string | null;

  onClose: () => void;

  onCreate: (
    data: CreateMeetingPayload
  ) => void;

  onUpdate: (
    data: UpdateMeetingPayload
  ) => void;
}

interface FormState {
  projectId: string;
  organizerId: string;
  title: string;
  agenda: string;
  meetingDate: string;
  location: string;
  notes: string;
  status: MeetingStatus;
}

interface FormErrors {
  projectId?: string;
  organizerId?: string;
  title?: string;
  agenda?: string;
  meetingDate?: string;
  location?: string;
  notes?: string;
  status?: string;
}

const emptyForm: FormState = {
  projectId: "",
  organizerId: "",
  title: "",
  agenda: "",
  meetingDate: "",
  location: "",
  notes: "",
  status: "SCHEDULED",
};

const STATUS_OPTIONS: {
  value: MeetingStatus;
  label: string;
}[] = [
  {
    value: "SCHEDULED",
    label: "Scheduled",
  },
  {
    value: "COMPLETED",
    label: "Completed",
  },
  {
    value: "CANCELLED",
    label: "Cancelled",
  },
];

export default function MeetingFormModal({
  open,
  meeting,
  projects,
  isSubmitting = false,
  error,
  onClose,
  onCreate,
  onUpdate,
}: MeetingFormModalProps) {
  const isEdit = Boolean(meeting);

  const [form, setForm] =
    useState<FormState>(
      emptyForm
    );

  const [errors, setErrors] =
    useState<FormErrors>({});

  const {
    data: membersData,
    isLoading: isMembersLoading,
    isError: isMembersError,
  } = useProjectMembers(
    form.projectId || undefined
  );

  useEffect(() => {
    if (!open) {
      return;
    }

    if (meeting) {
      setForm({
        projectId:
          meeting.projectId,

        organizerId:
          meeting.organizerId,

        title:
          meeting.title,

        agenda:
          meeting.agenda ??
          "",

        meetingDate:
          toDateTimeLocalValue(
            meeting.meetingDate
          ),

        location:
          meeting.location ??
          "",

        notes:
          meeting.notes ??
          "",

        status:
          meeting.status,
      });
    } else {
      setForm(
        emptyForm
      );
    }

    setErrors({});
  }, [open, meeting]);

  /*
   * The backend requires the organizer to be:
   *
   * 1. A project member
   * 2. SUPER_ADMIN or PROJECT_MANAGER
   *
   * Therefore we derive organizers directly
   * from the project's member list.
   */
  const eligibleOrganizers =
    useMemo(() => {
      const members =
        membersData?.data ??
        [];

      return members.filter(
        (member) =>
          (
            member.user.role.name ===
              "SUPER_ADMIN" ||
            member.user.role.name ===
              "PROJECT_MANAGER"
          ) &&
          member.user.status ===
            "ACTIVE"
      );
    }, [membersData]);

  const selectedProject =
    projects.find(
      (project) =>
        project.id ===
        form.projectId
    );

  /*
   * If project changes, the previous organizer
   * may no longer belong to the new project.
   *
   * Clear it until valid members are loaded.
   */
  useEffect(() => {
    if (!form.organizerId) {
      return;
    }

    if (isMembersLoading) {
      return;
    }

    const exists =
      eligibleOrganizers.some(
        (member) =>
          member.userId ===
          form.organizerId
      );

    if (!exists) {
      setForm(
        (previous) => ({
          ...previous,
          organizerId: "",
        })
      );
    }
  }, [
    eligibleOrganizers,
    form.organizerId,
    isMembersLoading,
  ]);

  if (!open) {
    return null;
  }

  const updateField = (
    field: keyof FormState,
    value: string
  ) => {
    setForm(
      (previous) => ({
        ...previous,
        [field]:
          value,
      })
    );

    setErrors(
      (previous) => ({
        ...previous,
        [field]:
          undefined,
      })
    );
  };

  const handleProjectChange = (
    projectId: string
  ) => {
    setForm(
      (previous) => ({
        ...previous,

        projectId,

        organizerId:
          "",
      })
    );

    setErrors(
      (previous) => ({
        ...previous,
        projectId:
          undefined,
        organizerId:
          undefined,
      })
    );
  };

  const validate =
    (): boolean => {
      const nextErrors: FormErrors =
        {};

      const title =
        form.title.trim();

      const agenda =
        form.agenda.trim();

      const location =
        form.location.trim();

      const notes =
        form.notes.trim();

      if (!form.projectId) {
        nextErrors.projectId =
          "Please select a project.";
      }

      if (!form.organizerId) {
        nextErrors.organizerId =
          "Please select an organizer.";
      }

      if (!title) {
        nextErrors.title =
          "Meeting title is required.";
      } else if (
        title.length < 3
      ) {
        nextErrors.title =
          "Meeting title must be at least 3 characters.";
      } else if (
        title.length > 150
      ) {
        nextErrors.title =
          "Meeting title cannot exceed 150 characters.";
      }

      if (!form.meetingDate) {
        nextErrors.meetingDate =
          "Meeting date and time are required.";
      } else {
        const meetingDate =
          new Date(
            form.meetingDate
          );

        if (
          Number.isNaN(
            meetingDate.getTime()
          )
        ) {
          nextErrors.meetingDate =
            "Please enter a valid meeting date and time.";
        } else if (
          meetingDate.getTime() <=
          Date.now()
        ) {
          nextErrors.meetingDate =
            "Meeting date and time must be in the future.";
        }
      }

      if (
        agenda.length >
        5000
      ) {
        nextErrors.agenda =
          "Agenda cannot exceed 5000 characters.";
      }

      if (
        location.length >
        500
      ) {
        nextErrors.location =
          "Location cannot exceed 500 characters.";
      }

      if (
        notes.length >
        5000
      ) {
        nextErrors.notes =
          "Notes cannot exceed 5000 characters.";
      }

      setErrors(
        nextErrors
      );

      return (
        Object.keys(
          nextErrors
        ).length === 0
      );
    };

  const handleSubmit = (
    event: React.FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    const title =
      form.title.trim();

    const agenda =
      form.agenda.trim();

    const location =
      form.location.trim();

    const notes =
      form.notes.trim();

    if (isEdit) {
      const payload:
        UpdateMeetingPayload =
        {
          projectId:
            form.projectId,

          organizerId:
            form.organizerId,

          title,

          agenda:
            agenda ||
            undefined,

          meetingDate:
            form.meetingDate,

          location:
            location ||
            null,

          notes:
            notes ||
            null,

          status:
            form.status,
        };

      onUpdate(
        payload
      );

      return;
    }

    const payload:
      CreateMeetingPayload =
      {
        projectId:
          form.projectId,

        organizerId:
          form.organizerId,

        title,

        agenda:
          agenda ||
          undefined,

        meetingDate:
          form.meetingDate,

        location:
          location ||
          undefined,

        notes:
          notes ||
          undefined,

        status:
          form.status,
      };

    onCreate(
      payload
    );
  };

  /*
   * Completed/cancelled projects cannot have
   * meetings created or modified.
   *
   * The backend is the final authority, but we
   * hide those projects here for better UX.
   */
  const availableProjects =
    projects.filter(
      (project) =>
        project.status !==
          "COMPLETED" &&
        project.status !==
          "CANCELLED"
    );

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center overflow-y-auto bg-slate-900/40 p-4 sm:p-6">
      <div className="my-4 flex w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-white shadow-xl sm:my-8">
        {/* Header */}
        <div className="flex shrink-0 items-start justify-between border-b border-slate-200 px-6 py-5">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              {isEdit
                ? "Edit Meeting"
                : "Schedule Meeting"}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {isEdit
                ? "Update meeting details."
                : "Schedule a meeting for a project."}
            </p>
          </div>

          <button
            type="button"
            onClick={
              onClose
            }
            disabled={
              isSubmitting
            }
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Form */}
        <form
          onSubmit={
            handleSubmit
          }
          className="max-h-[calc(100vh-8rem)] overflow-y-auto p-6"
        >
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
            {/* Project */}
            <div className="sm:col-span-2">
              <label
                htmlFor="meetingProject"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Project{" "}
                <span className="text-red-500">
                  *
                </span>
              </label>

              <select
                id="meetingProject"
                value={
                  form.projectId
                }
                onChange={(
                  event
                ) =>
                  handleProjectChange(
                    event.target
                      .value
                  )
                }
                disabled={
                  isSubmitting
                }
                className={inputClass(
                  errors.projectId
                )}
              >
                <option value="">
                  Select project
                </option>

                {availableProjects.map(
                  (
                    project
                  ) => (
                    <option
                      key={
                        project.id
                      }
                      value={
                        project.id
                      }
                    >
                      {
                        project.name
                      }
                    </option>
                  )
                )}
              </select>

              <FieldError
                message={
                  errors.projectId
                }
              />
            </div>

            {/* Organizer */}
            <div>
              <label
                htmlFor="meetingOrganizer"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Organizer{" "}
                <span className="text-red-500">
                  *
                </span>
              </label>

              <div className="relative">
                <UserRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <select
                  id="meetingOrganizer"
                  value={
                    form.organizerId
                  }
                  onChange={(
                    event
                  ) =>
                    updateField(
                      "organizerId",
                      event.target
                        .value
                    )
                  }
                  disabled={
                    isSubmitting ||
                    !form.projectId ||
                    isMembersLoading ||
                    isMembersError
                  }
                  className={`pl-9 ${inputClass(
                    errors.organizerId
                  )}`}
                >
                  <option value="">
                    {!form.projectId
                      ? "Select a project first"
                      : isMembersLoading
                      ? "Loading project members..."
                      : "Select organizer"}
                  </option>

                  {eligibleOrganizers.map(
                    (
                      member
                    ) => (
                      <option
                        key={
                          member.userId
                        }
                        value={
                          member.userId
                        }
                      >
                        {
                          member.user
                            .firstName
                        }{" "}
                        {
                          member.user
                            .lastName
                        }{" "}
                        —{" "}
                        {member.user.role.name ===
                        "SUPER_ADMIN"
                          ? "Super Admin"
                          : "Project Manager"}
                      </option>
                    )
                  )}
                </select>
              </div>

              {form.projectId &&
                isMembersError && (
                  <p className="mt-1 text-xs text-red-600">
                    Unable to load project members.
                  </p>
                )}

              {form.projectId &&
                !isMembersLoading &&
                !isMembersError &&
                eligibleOrganizers.length ===
                  0 && (
                  <p className="mt-1 text-xs text-slate-400">
                    No active Super Admin or Project Manager is available in this project.
                  </p>
                )}

              <FieldError
                message={
                  errors.organizerId
                }
              />
            </div>

            {/* Status */}
            <div>
              <label
                htmlFor="meetingStatus"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Status
              </label>

              <select
                id="meetingStatus"
                value={
                  form.status
                }
                onChange={(
                  event
                ) =>
                  updateField(
                    "status",
                    event.target
                      .value
                  )
                }
                disabled={
                  isSubmitting
                }
                className={inputClass(
                  errors.status
                )}
              >
                {STATUS_OPTIONS.map(
                  (
                    option
                  ) => (
                    <option
                      key={
                        option.value
                      }
                      value={
                        option.value
                      }
                    >
                      {
                        option.label
                      }
                    </option>
                  )
                )}
              </select>
            </div>

            {/* Title */}
            <div className="sm:col-span-2">
              <label
                htmlFor="meetingTitle"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Meeting Title{" "}
                <span className="text-red-500">
                  *
                </span>
              </label>

              <input
                id="meetingTitle"
                type="text"
                value={
                  form.title
                }
                onChange={(
                  event
                ) =>
                  updateField(
                    "title",
                    event.target
                      .value
                  )
                }
                placeholder="e.g. Sprint Planning Meeting"
                maxLength={150}
                autoFocus
                disabled={
                  isSubmitting
                }
                className={inputClass(
                  errors.title
                )}
              />

              <FieldError
                message={
                  errors.title
                }
              />
            </div>

            {/* Meeting date/time */}
            <div className="sm:col-span-2">
              <label
                htmlFor="meetingDate"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Meeting Date &amp; Time{" "}
                <span className="text-red-500">
                  *
                </span>
              </label>

              <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                <div className="relative">
                  <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <input
                    id="meetingDate"
                    type="date"
                    value={getDatePart(
                      form.meetingDate
                    )}
                    onChange={(
                      event
                    ) =>
                      updateMeetingDatePart(
                        "date",
                        event.target
                          .value,
                        form,
                        setForm,
                        setErrors
                      )
                    }
                    disabled={
                      isSubmitting
                    }
                    className={`pl-9 ${inputClass(
                      errors.meetingDate
                    )}`}
                  />
                </div>

                <div className="relative">
                  <Clock3 className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                  <input
                    type="time"
                    value={getTimePart(
                      form.meetingDate
                    )}
                    onChange={(
                      event
                    ) =>
                      updateMeetingDatePart(
                        "time",
                        event.target
                          .value,
                        form,
                        setForm,
                        setErrors
                      )
                    }
                    disabled={
                      isSubmitting
                    }
                    className={`pl-9 ${inputClass(
                      errors.meetingDate
                    )}`}
                  />
                </div>
              </div>

              <FieldError
                message={
                  errors.meetingDate
                }
              />
            </div>

            {/* Agenda */}
            <div className="sm:col-span-2">
              <label
                htmlFor="meetingAgenda"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Agenda
                <span className="ml-1 font-normal text-slate-400">
                  (Optional)
                </span>
              </label>

              <textarea
                id="meetingAgenda"
                value={
                  form.agenda
                }
                onChange={(
                  event
                ) =>
                  updateField(
                    "agenda",
                    event.target
                      .value
                  )
                }
                placeholder="Topics or objectives for the meeting..."
                rows={4}
                maxLength={5000}
                disabled={
                  isSubmitting
                }
                className={`${inputClass(
                  errors.agenda
                )} resize-none`}
              />

              <div className="mt-1 flex justify-between">
                <FieldError
                  message={
                    errors.agenda
                  }
                />

                <p className="text-xs text-slate-400">
                  {
                    form.agenda
                      .length
                  }
                  /5000
                </p>
              </div>
            </div>

            {/* Location */}
            <div className="sm:col-span-2">
              <label
                htmlFor="meetingLocation"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Location
                <span className="ml-1 font-normal text-slate-400">
                  (Optional)
                </span>
              </label>

              <input
                id="meetingLocation"
                type="text"
                value={
                  form.location
                }
                onChange={(
                  event
                ) =>
                  updateField(
                    "location",
                    event.target
                      .value
                  )
                }
                placeholder="e.g. Conference Room A / Google Meet"
                maxLength={500}
                disabled={
                  isSubmitting
                }
                className={inputClass(
                  errors.location
                )}
              />

              <FieldError
                message={
                  errors.location
                }
              />
            </div>

            {/* Notes */}
            <div className="sm:col-span-2">
              <label
                htmlFor="meetingNotes"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Notes
                <span className="ml-1 font-normal text-slate-400">
                  (Optional)
                </span>
              </label>

              <textarea
                id="meetingNotes"
                value={
                  form.notes
                }
                onChange={(
                  event
                ) =>
                  updateField(
                    "notes",
                    event.target
                      .value
                  )
                }
                placeholder="Additional meeting notes..."
                rows={4}
                maxLength={5000}
                disabled={
                  isSubmitting
                }
                className={`${inputClass(
                  errors.notes
                )} resize-none`}
              />

              <div className="mt-1 flex justify-between">
                <FieldError
                  message={
                    errors.notes
                  }
                />

                <p className="text-xs text-slate-400">
                  {
                    form.notes
                      .length
                  }
                  /5000
                </p>
              </div>
            </div>

            {/* Project information */}
            {selectedProject && (
              <div className="sm:col-span-2">
                <div className="rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Selected Project
                  </p>

                  <p className="mt-1 text-sm font-semibold text-slate-800">
                    {
                      selectedProject.name
                    }
                  </p>

                  <p className="mt-0.5 text-xs text-slate-500">
                    Status:{" "}
                    {formatProjectStatus(
                      selectedProject.status
                    )}
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Backend error */}
          {error && (
            <div className="mt-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Actions */}
          <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={
                onClose
              }
              disabled={
                isSubmitting
              }
              className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Cancel
            </button>

            <button
              type="submit"
              disabled={
                isSubmitting ||
                isMembersLoading ||
                Boolean(
                  form.projectId &&
                    !isMembersError &&
                    eligibleOrganizers.length ===
                      0
                )
              }
              className="flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />

                  {isEdit
                    ? "Saving..."
                    : "Scheduling..."}
                </>
              ) : (
                <>
                  {isEdit ? (
                    <Pencil className="h-4 w-4" />
                  ) : (
                    <Plus className="h-4 w-4" />
                  )}

                  {isEdit
                    ? "Save Changes"
                    : "Schedule Meeting"}
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Helpers                                                                    */
/* -------------------------------------------------------------------------- */

function inputClass(
  error?: string
) {
  return `w-full rounded-lg border px-3 py-2.5 text-sm text-slate-900 outline-none transition ${
    error
      ? "border-red-400 focus:border-red-500 focus:ring-2 focus:ring-red-100"
      : "border-slate-300 focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
  } disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-70`;
}

function FieldError({
  message,
}: {
  message?: string;
}) {
  if (!message) {
    return null;
  }

  return (
    <p className="mt-1 text-xs text-red-600">
      {message}
    </p>
  );
}

function toDateTimeLocalValue(
  value?: string | null
): string {
  if (!value) {
    return "";
  }

  const date =
    new Date(value);

  if (
    Number.isNaN(
      date.getTime()
    )
  ) {
    return "";
  }

  const year =
    date.getFullYear();

  const month =
    String(
      date.getMonth() + 1
    ).padStart(2, "0");

  const day =
    String(
      date.getDate()
    ).padStart(2, "0");

  const hours =
    String(
      date.getHours()
    ).padStart(2, "0");

  const minutes =
    String(
      date.getMinutes()
    ).padStart(2, "0");

  return `${year}-${month}-${day}T${hours}:${minutes}`;
}

function getDatePart(
  value: string
): string {
  if (!value) {
    return "";
  }

  return value.slice(
    0,
    10
  );
}

function getTimePart(
  value: string
): string {
  if (!value) {
    return "";
  }

  if (
    value.length >= 16
  ) {
    return value.slice(
      11,
      16
    );
  }

  return "";
}

function updateMeetingDatePart(
  part:
    | "date"
    | "time",
  value: string,
  form: FormState,
  setForm: React.Dispatch<
    React.SetStateAction<FormState>
  >,
  setErrors: React.Dispatch<
    React.SetStateAction<FormErrors>
  >
) {
  const currentDate =
    getDatePart(
      form.meetingDate
    );

  const currentTime =
    getTimePart(
      form.meetingDate
    );

  const nextDate =
    part === "date"
      ? value
      : currentDate;

  const nextTime =
    part === "time"
      ? value
      : currentTime;

  let nextValue = "";

  if (
    nextDate &&
    nextTime
  ) {
    nextValue =
      `${nextDate}T${nextTime}`;
  } else if (
    nextDate
  ) {
    nextValue =
      `${nextDate}T00:00`;
  }

  setForm(
    (previous) => ({
      ...previous,
      meetingDate:
        nextValue,
    })
  );

  setErrors(
    (previous) => ({
      ...previous,
      meetingDate:
        undefined,
    })
  );
}

function formatProjectStatus(
  status: Project["status"]
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