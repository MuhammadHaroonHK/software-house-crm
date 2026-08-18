"use client";

import {
  Loader2,
  UserPlus,
  Users,
  UserRound,
  X,
  UserMinus,
} from "lucide-react";

import { useEffect, useMemo, useState } from "react";

import { toast } from "sonner";

import type { Project } from "@/features/projects/types/project.types";

import type {
  ProjectMember,
} from "@/features/projects/types/projectMember.types";

interface EmployeeOption {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  status: string;
  role?: {
    name?: string;
  };
}

interface ProjectMembersModalProps {
  project: Project | null;

  members: ProjectMember[];

  employees: EmployeeOption[];

  isLoading?: boolean;
  isLoadingEmployees?: boolean;

  isAdding?: boolean;
  removingUserId?: string | null;

  canManageMembers?: boolean;

  error?: string | null;

  onClose: () => void;

  onAddMember: (
    userId: string
  ) => Promise<void>;

  onRemoveMember: (
    userId: string
  ) => Promise<void>;
}

export default function ProjectMembersModal({
  project,
  members,
  employees,
  isLoading = false,
  isLoadingEmployees = false,
  isAdding = false,
  removingUserId = null,
  canManageMembers = false,
  error,
  onClose,
  onAddMember,
  onRemoveMember,
}: ProjectMembersModalProps) {
  const [selectedEmployeeId, setSelectedEmployeeId] =
    useState("");

  const [removeCandidate, setRemoveCandidate] =
    useState<ProjectMember | null>(null);

  useEffect(() => {
    setSelectedEmployeeId("");
    setRemoveCandidate(null);
  }, [project]);

  const managerId =
    project?.managerId ?? null;

  const availableEmployees =
    useMemo(() => {
      const memberIds = new Set(
        members.map(
          (member) =>
            member.userId
        )
      );

      return employees.filter(
        (employee) =>
          employee.status ===
            "ACTIVE" &&
          employee.role?.name ===
            "EMPLOYEE" &&
          !memberIds.has(
            employee.id
          )
      );
    }, [employees, members]);

  if (!project) {
    return null;
  }

  const handleAdd = async () => {
    if (!selectedEmployeeId) {
      toast.error(
        "Please select an employee."
      );

      return;
    }

    try {
      await onAddMember(
        selectedEmployeeId
      );

      setSelectedEmployeeId("");
    } catch {
      // Parent handles the error toast.
    }
  };

  const handleRemoveConfirm =
    async () => {
      if (!removeCandidate) {
        return;
      }

      try {
        await onRemoveMember(
          removeCandidate.userId
        );

        setRemoveCandidate(null);
      } catch {
        // Parent handles the error toast.
      }
    };

  return (
    <div className="fixed inset-0 z-[130] flex items-start justify-center overflow-y-auto bg-slate-900/40 p-4 sm:p-6">
      <div className="my-4 flex w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-white shadow-xl sm:my-8">
        {/* Header */}
        <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100">
              <Users className="h-5 w-5 text-slate-600" />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Project Team
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Manage members assigned to{" "}
                <span className="font-medium text-slate-700">
                  {project.name}
                </span>
                .
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            disabled={
              isAdding ||
              Boolean(removingUserId)
            }
            className="flex h-8 w-8 items-center justify-center rounded-lg text-slate-400 transition hover:bg-slate-100 hover:text-slate-600 disabled:cursor-not-allowed disabled:opacity-50"
            aria-label="Close modal"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Body */}
        <div className="max-h-[calc(100vh-10rem)] overflow-y-auto p-6">
          {/* Backend error */}
          {error && (
            <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {/* Add member */}
          {canManageMembers && (
            <section className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white">
                  <UserPlus className="h-4 w-4 text-slate-600" />
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-semibold text-slate-900">
                    Add Team Member
                  </h3>

                  <p className="mt-1 text-xs text-slate-500">
                    Only active employees can be
                    assigned to the project.
                  </p>

                  <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                    <select
                      value={
                        selectedEmployeeId
                      }
                      onChange={(
                        event
                      ) =>
                        setSelectedEmployeeId(
                          event.target.value
                        )
                      }
                      disabled={
                        isAdding ||
                        isLoadingEmployees ||
                        project.status ===
                          "COMPLETED" ||
                        project.status ===
                          "CANCELLED"
                      }
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-70"
                    >
                      <option value="">
                        {isLoadingEmployees
                          ? "Loading employees..."
                          : "Select employee"}
                      </option>

                      {availableEmployees.map(
                        (employee) => (
                          <option
                            key={
                              employee.id
                            }
                            value={
                              employee.id
                            }
                          >
                            {
                              employee.firstName
                            }{" "}
                            {
                              employee.lastName
                            }
                          </option>
                        )
                      )}
                    </select>

                    <button
                      type="button"
                      onClick={
                        handleAdd
                      }
                      disabled={
                        isAdding ||
                        !selectedEmployeeId ||
                        project.status ===
                          "COMPLETED" ||
                        project.status ===
                          "CANCELLED"
                      }
                      className="flex shrink-0 items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
                    >
                      {isAdding ? (
                        <>
                          <Loader2 className="h-4 w-4 animate-spin" />
                          Adding...
                        </>
                      ) : (
                        <>
                          <UserPlus className="h-4 w-4" />
                          Add Member
                        </>
                      )}
                    </button>
                  </div>

                  {!isLoadingEmployees &&
                    availableEmployees.length ===
                      0 && (
                      <p className="mt-2 text-xs text-slate-400">
                        There are no available employees to
                        add.
                      </p>
                    )}
                </div>
              </div>
            </section>
          )}

          {/* Members */}
          <section
            className={`${
              canManageMembers
                ? "mt-6"
                : ""
            }`}
          >
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  Current Members
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  {members.length}{" "}
                  {members.length === 1
                    ? "member"
                    : "members"}
                </p>
              </div>

              {isLoading && (
                <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
              )}
            </div>

            {isLoading ? (
              <div className="mt-4 flex min-h-[180px] items-center justify-center rounded-xl border border-slate-200 bg-white">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Loading team members...
                </div>
              </div>
            ) : members.length === 0 ? (
              <div className="mt-4 flex min-h-[180px] flex-col items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-6 text-center">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white">
                  <Users className="h-5 w-5 text-slate-400" />
                </div>

                <h4 className="mt-3 text-sm font-semibold text-slate-900">
                  No team members
                </h4>

                <p className="mt-1 text-xs text-slate-500">
                  No members are currently assigned to
                  this project.
                </p>
              </div>
            ) : (
              <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
                <div className="divide-y divide-slate-100">
                  {members.map(
                    (member) => {
                      const isManager =
                        member.userId ===
                        managerId;

                      const isRemoving =
                        removingUserId ===
                        member.userId;

                      return (
                        <div
                          key={`${member.projectId}-${member.userId}`}
                          className="flex items-center justify-between gap-4 px-4 py-4"
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100">
                              <UserRound className="h-5 w-5 text-slate-500" />
                            </div>

                            <div className="min-w-0">
                              <div className="flex flex-wrap items-center gap-2">
                                <p className="truncate text-sm font-semibold text-slate-900">
                                  {
                                    member
                                      .user
                                      .firstName
                                  }{" "}
                                  {
                                    member
                                      .user
                                      .lastName
                                  }
                                </p>

                                {isManager && (
                                  <span className="rounded-full bg-blue-50 px-2 py-0.5 text-[11px] font-medium text-blue-700">
                                    Project Manager
                                  </span>
                                )}
                              </div>

                              <p className="mt-0.5 truncate text-xs text-slate-500">
                                {
                                  member
                                    .user
                                    .email
                                }
                              </p>
                            </div>
                          </div>

                          {canManageMembers &&
                            !isManager &&
                            !(
                              project.status ===
                                "COMPLETED" ||
                              project.status ===
                                "CANCELLED"
                            ) && (
                              <button
                                type="button"
                                onClick={() =>
                                  setRemoveCandidate(
                                    member
                                  )
                                }
                                disabled={
                                  isRemoving
                                }
                                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-red-500 transition hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                                title="Remove member"
                                aria-label="Remove member"
                              >
                                {isRemoving ? (
                                  <Loader2 className="h-4 w-4 animate-spin" />
                                ) : (
                                  <UserMinus className="h-4 w-4" />
                                )}
                              </button>
                            )}
                        </div>
                      );
                    }
                  )}
                </div>
              </div>
            )}
          </section>
        </div>

        {/* Footer */}
        <div className="flex justify-end border-t border-slate-200 px-6 py-4">
          <button
            type="button"
            onClick={onClose}
            disabled={
              isAdding ||
              Boolean(removingUserId)
            }
            className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Close
          </button>
        </div>
      </div>

      {/* Remove confirmation */}
      {removeCandidate && (
        <div className="fixed inset-0 z-[140] flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-slate-900">
              Remove Team Member?
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Are you sure you want to remove{" "}
              <span className="font-medium text-slate-700">
                {
                  removeCandidate
                    .user
                    .firstName
                }{" "}
                {
                  removeCandidate
                    .user
                    .lastName
                }
              </span>{" "}
              from this project?
            </p>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() =>
                  setRemoveCandidate(
                    null
                  )
                }
                disabled={Boolean(
                  removingUserId
                )}
                className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={
                  handleRemoveConfirm
                }
                disabled={Boolean(
                  removingUserId
                )}
                className="flex items-center justify-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {removingUserId ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Removing...
                  </>
                ) : (
                  <>
                    <UserMinus className="h-4 w-4" />
                    Remove Member
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}