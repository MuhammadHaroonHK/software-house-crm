"use client";

import {
  Filter,
  RotateCcw,
} from "lucide-react";

import type { Project } from "@/features/projects/types/project.types";

import type {
  MeetingStatus,
} from "../types/meeting.types";

interface OrganizerOption {
  id: string;
  firstName: string;
  lastName: string;
}

interface MeetingsFiltersProps {
  projects: Project[];
  organizers: OrganizerOption[];

  projectId: string;
  organizerId: string;
  status: MeetingStatus | "";

  onProjectChange: (value: string) => void;
  onOrganizerChange: (value: string) => void;
  onStatusChange: (value: MeetingStatus | "") => void;
  onReset: () => void;
}

export default function MeetingsFilters({
  projects,
  organizers,
  projectId,
  organizerId,
  status,
  onProjectChange,
  onOrganizerChange,
  onStatusChange,
  onReset,
}: MeetingsFiltersProps) {
  const hasFilters = Boolean(
    projectId ||
      organizerId ||
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

        <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 xl:grid-cols-3">
          <select
            value={projectId}
            onChange={(event) =>
              onProjectChange(event.target.value)
            }
            className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          >
            <option value="">
              All Projects
            </option>

            {projects.map((project) => (
              <option key={project.id} value={project.id}>
                {project.name}
              </option>
            ))}
          </select>

          <select
            value={organizerId}
            onChange={(event) =>
              onOrganizerChange(event.target.value)
            }
            className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          >
            <option value="">
              All Organizers
            </option>

            {organizers.map((organizer) => (
              <option
                key={organizer.id}
                value={organizer.id}
              >
                {organizer.firstName} {organizer.lastName}
              </option>
            ))}
          </select>

          <select
            value={status}
            onChange={(event) =>
              onStatusChange(
                event.target.value as MeetingStatus | ""
              )
            }
            className="rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          >
            <option value="">
              All Statuses
            </option>

            <option value="SCHEDULED">
              Scheduled
            </option>

            <option value="COMPLETED">
              Completed
            </option>

            <option value="CANCELLED">
              Cancelled
            </option>
          </select>
        </div>
      </div>
    </section>
  );
}