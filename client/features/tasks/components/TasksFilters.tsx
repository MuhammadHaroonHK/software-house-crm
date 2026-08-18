"use client";

import {
  Filter,
  RotateCcw,
} from "lucide-react";

import type {
  Project,
} from "@/features/projects/types/project.types";

import type {
  TaskPriority,
  TaskStatus,
} from "../types/task.types";

interface FilterUser {
  id: string;
  firstName: string;
  lastName: string;
}

interface TasksFiltersProps {
  projects: Project[];
  users: FilterUser[];

  projectId: string;
  assignedToId: string;
  priority: TaskPriority | "";
  status: TaskStatus | "";

  onProjectChange: (
    value: string
  ) => void;

  onAssigneeChange: (
    value: string
  ) => void;

  onPriorityChange: (
    value: TaskPriority | ""
  ) => void;

  onStatusChange: (
    value: TaskStatus | ""
  ) => void;

  onReset: () => void;
}

export default function TasksFilters({
  projects,
  users,
  projectId,
  assignedToId,
  priority,
  status,
  onProjectChange,
  onAssigneeChange,
  onPriorityChange,
  onStatusChange,
  onReset,
}: TasksFiltersProps) {
  const hasFilters =
    Boolean(
      projectId ||
      assignedToId ||
      priority ||
      status
    );

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-slate-500" />

            <h2 className="text-sm font-semibold text-slate-800">
              Filters
            </h2>
          </div>

          {hasFilters && (
            <button
              type="button"
              onClick={onReset}
              className="flex items-center gap-1.5 text-xs font-medium text-slate-500 transition hover:text-slate-900"
            >
              <RotateCcw className="h-3.5 w-3.5" />
              Reset
            </button>
          )}
        </div>

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-4">
          {/* Project */}
          <select
            value={projectId}
            onChange={(event) =>
              onProjectChange(
                event.target.value
              )
            }
            className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          >
            <option value="">
              All Projects
            </option>

            {projects.map(
              (project) => (
                <option
                  key={project.id}
                  value={project.id}
                >
                  {project.name}
                </option>
              )
            )}
          </select>

          {/* Assignee */}
          <select
            value={assignedToId}
            onChange={(event) =>
              onAssigneeChange(
                event.target.value
              )
            }
            className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          >
            <option value="">
              All Assignees
            </option>

            {users.map(
              (user) => (
                <option
                  key={user.id}
                  value={user.id}
                >
                  {user.firstName}{" "}
                  {user.lastName}
                </option>
              )
            )}
          </select>

          {/* Priority */}
          <select
            value={priority}
            onChange={(event) =>
              onPriorityChange(
                event.target.value as
                  | TaskPriority
                  | ""
              )
            }
            className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          >
            <option value="">
              All Priorities
            </option>

            <option value="LOW">
              Low
            </option>

            <option value="MEDIUM">
              Medium
            </option>

            <option value="HIGH">
              High
            </option>

            <option value="URGENT">
              Urgent
            </option>
          </select>

          {/* Status */}
          <select
            value={status}
            onChange={(event) =>
              onStatusChange(
                event.target.value as
                  | TaskStatus
                  | ""
              )
            }
            className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          >
            <option value="">
              All Statuses
            </option>

            <option value="TODO">
              To Do
            </option>

            <option value="IN_PROGRESS">
              In Progress
            </option>

            <option value="IN_REVIEW">
              In Review
            </option>

            <option value="COMPLETED">
              Completed
            </option>
          </select>
        </div>
      </div>
    </section>
  );
}