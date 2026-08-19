"use client";

import {
  Filter,
  RotateCcw,
} from "lucide-react";

import type {
  QuotationClient,
  QuotationProject,
  QuotationStatus,
} from "../types/quotation.types";

interface QuotationsFiltersProps {
  clients: QuotationClient[];
  projects: QuotationProject[];

  clientId: string;
  projectId: string;
  status: QuotationStatus | "";

  onClientChange: (value: string) => void;
  onProjectChange: (value: string) => void;
  onStatusChange: (
    value: QuotationStatus | ""
  ) => void;

  onReset: () => void;
}

export default function QuotationsFilters({
  clients,
  projects,
  clientId,
  projectId,
  status,
  onClientChange,
  onProjectChange,
  onStatusChange,
  onReset,
}: QuotationsFiltersProps) {
  const filteredProjects =
    clientId
      ? projects.filter(
          (project) =>
            !project.clientId ||
            project.clientId ===
              clientId
        )
      : projects;

  const hasFilters =
    Boolean(
      clientId ||
        projectId ||
        status
    );

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-end">
        <div className="flex items-center gap-2 lg:mr-2">
          <Filter className="h-4 w-4 text-slate-500" />

          <span className="text-sm font-medium text-slate-700">
            Filters
          </span>
        </div>

        {/* Client */}
        <div className="w-full lg:max-w-[240px]">
          <label
            htmlFor="quotationFilterClient"
            className="mb-1.5 block text-xs font-medium text-slate-500"
          >
            Client
          </label>

          <select
            id="quotationFilterClient"
            value={clientId}
            onChange={(event) => {
              onClientChange(
                event.target.value
              );

              if (!event.target.value) {
                onProjectChange("");
              }
            }}
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          >
            <option value="">
              All clients
            </option>

            {clients.map((client) => (
              <option
                key={client.id}
                value={client.id}
              >
                {client.companyName}
              </option>
            ))}
          </select>
        </div>

        {/* Project */}
        <div className="w-full lg:max-w-[240px]">
          <label
            htmlFor="quotationFilterProject"
            className="mb-1.5 block text-xs font-medium text-slate-500"
          >
            Project
          </label>

          <select
            id="quotationFilterProject"
            value={projectId}
            onChange={(event) =>
              onProjectChange(
                event.target.value
              )
            }
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          >
            <option value="">
              All projects
            </option>

            {filteredProjects.map(
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
        </div>

        {/* Status */}
        <div className="w-full lg:max-w-[220px]">
          <label
            htmlFor="quotationFilterStatus"
            className="mb-1.5 block text-xs font-medium text-slate-500"
          >
            Status
          </label>

          <select
            id="quotationFilterStatus"
            value={status}
            onChange={(event) =>
              onStatusChange(
                event.target.value as
                  | QuotationStatus
                  | ""
              )
            }
            className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-700 outline-none focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
          >
            <option value="">
              All statuses
            </option>

            <option value="DRAFT">
              Draft
            </option>

            <option value="SENT">
              Sent
            </option>

            <option value="ACCEPTED">
              Accepted
            </option>

            <option value="REJECTED">
              Rejected
            </option>

            <option value="EXPIRED">
              Expired
            </option>
          </select>
        </div>

        {hasFilters && (
          <button
            type="button"
            onClick={onReset}
            className="flex items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-600 transition hover:bg-slate-50"
          >
            <RotateCcw className="h-4 w-4" />
            Reset
          </button>
        )}
      </div>
    </section>
  );
}