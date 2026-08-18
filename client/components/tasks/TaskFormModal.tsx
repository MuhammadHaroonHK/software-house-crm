"use client";

import {
  CalendarDays,
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

import type {
  Project,
} from "@/features/projects/types/project.types";

import {
  useProjectMembers,
} from "@/features/projects/hooks/useProjectMembers";

import type {
  ProjectMember,
} from "@/features/projects/types/projectMember.types";

import type {
  CreateTaskPayload,
  Task,
  TaskPriority,
  UpdateTaskPayload,
} from "@/features/tasks/types/task.types";

interface TaskFormModalProps {
  open: boolean;
  task?: Task | null;

  projects: Project[];

  isSubmitting?: boolean;
  error?: string | null;

  onClose: () => void;

  onCreate: (
    data: CreateTaskPayload
  ) => void;

  onUpdate: (
    data: UpdateTaskPayload
  ) => void;
}

interface FormState {
  projectId: string;
  assignedToId: string;
  title: string;
  description: string;
  priority: TaskPriority;
  dueDate: string;
}

interface FormErrors {
  projectId?: string;
  assignedToId?: string;
  title?: string;
  description?: string;
  priority?: string;
  dueDate?: string;
}

const emptyForm: FormState = {
  projectId: "",
  assignedToId: "",
  title: "",
  description: "",
  priority: "MEDIUM",
  dueDate: "",
};

const PRIORITY_OPTIONS: {
  value: TaskPriority;
  label: string;
}[] = [
  {
    value: "LOW",
    label: "Low",
  },
  {
    value: "MEDIUM",
    label: "Medium",
  },
  {
    value: "HIGH",
    label: "High",
  },
  {
    value: "URGENT",
    label: "Urgent",
  },
];

export default function TaskFormModal({
  open,
  task,
  projects,
  isSubmitting = false,
  error,
  onClose,
  onCreate,
  onUpdate,
}: TaskFormModalProps) {
  const isEdit =
    Boolean(task);

  const [form, setForm] =
    useState<FormState>(
      emptyForm
    );

  const [errors, setErrors] =
    useState<FormErrors>({});

  /*
   * Load project members whenever
   * a project is selected.
   */
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

    if (task) {
      setForm({
        projectId:
          task.projectId,

        assignedToId:
          task.assignedToId,

        title:
          task.title,

        description:
          task.description ?? "",

        priority:
          task.priority,

        dueDate:
          toDateInputValue(
            task.dueDate
          ),
      });
    } else {
      setForm(
        emptyForm
      );
    }

    setErrors({});
  }, [open, task]);

  /*
   * Only employee members should appear
   * in the assignee dropdown.
   *
   * The backend enforces the same rule.
   */
  const employeeMembers =
    useMemo(() => {
      const members =
        membersData?.data ??
        [];

      return members.filter(
        (
          member: ProjectMember
        ) =>
          member.user.status ===
            "ACTIVE" &&
          member.user.role.name ===
            "EMPLOYEE"
      );
    }, [
      membersData,
    ]);

  const selectedProject =
    projects.find(
      (project) =>
        project.id ===
        form.projectId
    );

  useEffect(() => {
    /*
     * If the currently selected
     * assignee is not available for
     * the selected project anymore,
     * clear the selection.
     *
     * During edit this also protects
     * against stale membership data.
     */
    if (
      !form.assignedToId ||
      employeeMembers.length ===
        0
    ) {
      return;
    }

    const exists =
      employeeMembers.some(
        (member) =>
          member.userId ===
          form.assignedToId
      );

    if (!exists) {
      setForm(
        (previous) => ({
          ...previous,
          assignedToId: "",
        })
      );
    }
  }, [
    employeeMembers,
    form.assignedToId,
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
        [field]: value,
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

  const validate =
    (): boolean => {
      const nextErrors: FormErrors =
        {};

      const title =
        form.title.trim();

      const description =
        form.description.trim();

      if (!form.projectId) {
        nextErrors.projectId =
          "Please select a project.";
      }

      if (
        !form.assignedToId
      ) {
        nextErrors.assignedToId =
          "Please select an employee.";
      }

      if (!title) {
        nextErrors.title =
          "Task title is required.";
      } else if (
        title.length < 3
      ) {
        nextErrors.title =
          "Task title must be at least 3 characters.";
      } else if (
        title.length > 150
      ) {
        nextErrors.title =
          "Task title cannot exceed 150 characters.";
      }

      if (
        description.length >
        5000
      ) {
        nextErrors.description =
          "Description cannot exceed 5000 characters.";
      }

      if (
        form.dueDate
      ) {
        const date =
          new Date(
            form.dueDate
          );

        if (
          Number.isNaN(
            date.getTime()
          )
        ) {
          nextErrors.dueDate =
            "Please enter a valid due date.";
        }
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

  const handleProjectChange = (
    projectId: string
  ) => {
    setForm(
      (previous) => ({
        ...previous,

        projectId,

        /*
         * Changing project means
         * the current assignee is no
         * longer valid until members
         * are loaded.
         */
        assignedToId:
          "",
      })
    );

    setErrors(
      (previous) => ({
        ...previous,
        projectId:
          undefined,
        assignedToId:
          undefined,
      })
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

    const description =
      form.description.trim();

    const dueDate =
      form.dueDate ||
      undefined;

    if (isEdit) {
      const payload:
        UpdateTaskPayload =
        {
          assignedToId:
            form.assignedToId,

          title,

          description:
            description ||
            undefined,

          priority:
            form.priority,

          dueDate,
        };

      onUpdate(
        payload
      );

      return;
    }

    const payload:
      CreateTaskPayload =
      {
        projectId:
          form.projectId,

        assignedToId:
          form.assignedToId,

        title,

        description:
          description ||
          undefined,

        priority:
          form.priority,

        dueDate,
      };

    onCreate(
      payload
    );
  };

  /*
   * The project cannot be changed
   * when editing because the backend
   * UpdateTaskDTO does not contain
   * projectId.
   */
  const projectLocked =
    isEdit;

  /*
   * Only active, non-terminal
   * projects should be offered
   * when creating tasks.
   *
   * The backend independently
   * rejects completed/cancelled
   * projects.
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
                ? "Edit Task"
                : "Create Task"}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              {isEdit
                ? "Update the task details and assignment."
                : "Create and assign a task to a project member."}
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
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
                htmlFor="taskProject"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Project{" "}
                <span className="text-red-500">
                  *
                </span>
              </label>

              <select
                id="taskProject"
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
                  isSubmitting ||
                  projectLocked
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
                      {project.name}
                    </option>
                  )
                )}
              </select>

              {projectLocked && (
                <p className="mt-1 text-xs text-slate-400">
                  Project cannot be changed when editing a task.
                </p>
              )}

              <FieldError
                message={
                  errors.projectId
                }
              />
            </div>

            {/* Assignee */}
            <div>
              <label
                htmlFor="taskAssignee"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Assigned Employee{" "}
                <span className="text-red-500">
                  *
                </span>
              </label>

              <div className="relative">
                <UserRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <select
                  id="taskAssignee"
                  value={
                    form.assignedToId
                  }
                  onChange={(
                    event
                  ) =>
                    updateField(
                      "assignedToId",
                      event.target
                        .value
                    )
                  }
                  disabled={
                    isSubmitting ||
                    !form.projectId ||
                    isMembersLoading
                  }
                  className={`pl-9 ${inputClass(
                    errors.assignedToId
                  )}`}
                >
                  <option value="">
                    {!form.projectId
                      ? "Select a project first"
                      : isMembersLoading
                      ? "Loading team members..."
                      : "Select employee"}
                  </option>

                  {employeeMembers.map(
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
                        }
                      </option>
                    )
                  )}
                </select>
              </div>

              {form.projectId &&
                !isMembersLoading &&
                !isMembersError &&
                employeeMembers.length ===
                  0 && (
                  <p className="mt-1 text-xs text-slate-400">
                    This project has no active employee members available for assignment.
                  </p>
                )}

              {isMembersError &&
                form.projectId && (
                  <p className="mt-1 text-xs text-red-600">
                    Unable to load project members.
                  </p>
                )}

              <FieldError
                message={
                  errors.assignedToId
                }
              />
            </div>

            {/* Priority */}
            <div>
              <label
                htmlFor="taskPriority"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Priority
              </label>

              <select
                id="taskPriority"
                value={
                  form.priority
                }
                onChange={(
                  event
                ) =>
                  updateField(
                    "priority",
                    event.target
                      .value
                  )
                }
                disabled={
                  isSubmitting
                }
                className={inputClass(
                  errors.priority
                )}
              >
                {PRIORITY_OPTIONS.map(
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
                htmlFor="taskTitle"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Task Title{" "}
                <span className="text-red-500">
                  *
                </span>
              </label>

              <input
                id="taskTitle"
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
                placeholder="e.g. Implement authentication API"
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

            {/* Description */}
            <div className="sm:col-span-2">
              <label
                htmlFor="taskDescription"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Description
                <span className="ml-1 font-normal text-slate-400">
                  (Optional)
                </span>
              </label>

              <textarea
                id="taskDescription"
                value={
                  form.description
                }
                onChange={(
                  event
                ) =>
                  updateField(
                    "description",
                    event.target
                      .value
                  )
                }
                placeholder="Describe the work that needs to be completed..."
                rows={4}
                maxLength={5000}
                disabled={
                  isSubmitting
                }
                className={`${inputClass(
                  errors.description
                )} resize-none`}
              />

              <div className="mt-1 flex justify-between">
                <FieldError
                  message={
                    errors.description
                  }
                />

                <p className="text-xs text-slate-400">
                  {
                    form
                      .description
                      .length
                  }
                  /5000
                </p>
              </div>
            </div>

            {/* Due Date */}
            <div>
              <label
                htmlFor="taskDueDate"
                className="mb-1.5 block text-sm font-medium text-slate-700"
              >
                Due Date
                <span className="ml-1 font-normal text-slate-400">
                  (Optional)
                </span>
              </label>

              <div className="relative">
                <CalendarDays className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />

                <input
                  id="taskDueDate"
                  type="date"
                  value={
                    form.dueDate
                  }
                  onChange={(
                    event
                  ) =>
                    updateField(
                      "dueDate",
                      event.target
                        .value
                    )
                  }
                  disabled={
                    isSubmitting
                  }
                  className={`pl-9 ${inputClass(
                    errors.dueDate
                  )}`}
                />
              </div>

              <FieldError
                message={
                  errors.dueDate
                }
              />
            </div>

            {/* Selected project information */}
            {selectedProject && (
              <div className="flex items-end">
                <div className="w-full rounded-lg border border-slate-200 bg-slate-50 px-4 py-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                    Project
                  </p>

                  <p className="mt-1 truncate text-sm font-semibold text-slate-800">
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
                    employeeMembers.length ===
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
                    : "Creating..."}
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
                    : "Create Task"}
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

function toDateInputValue(
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

  return date
    .toISOString()
    .slice(0, 10);
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