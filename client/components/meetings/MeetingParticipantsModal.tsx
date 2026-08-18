"use client";

import {
  Loader2,
  UserMinus,
  UserPlus,
  UserRound,
  Users,
  X,
} from "lucide-react";

import {
  useEffect,
  useMemo,
  useState,
} from "react";

import { toast } from "sonner";

import {
  useProjectMembers,
} from "@/features/projects/hooks/useProjectMembers";

import type { Meeting } from "@/features/meetings/types/meeting.types";

import type {
  MeetingParticipant,
} from "@/features/meetings/types/meetingParticipant.types";

interface MeetingParticipantsModalProps {
  meeting: Meeting | null;

  participants: MeetingParticipant[];

  isLoading?: boolean;
  isAdding?: boolean;
  removingUserId?: string | null;

  isParticipantsError?: boolean;

  canManage?: boolean;

  error?: string | null;

  onClose: () => void;

  onAddParticipant: (
    userId: string
  ) => Promise<void>;

  onRemoveParticipant: (
    userId: string
  ) => Promise<void>;
}

export default function MeetingParticipantsModal({
  meeting,
  participants,
  isLoading = false,
  isAdding = false,
  removingUserId = null,
  isParticipantsError = false,
  canManage = false,
  error,
  onClose,
  onAddParticipant,
  onRemoveParticipant,
}: MeetingParticipantsModalProps) {
  const [selectedUserId, setSelectedUserId] =
    useState("");

  const [removeCandidate, setRemoveCandidate] =
    useState<MeetingParticipant | null>(null);

  const {
    data: membersData,
    isLoading: isMembersLoading,
    isError: isMembersError,
  } = useProjectMembers(
    meeting?.projectId
  );

  useEffect(() => {
    setSelectedUserId("");
    setRemoveCandidate(null);
  }, [meeting]);

  const projectMembers =
    membersData?.data ?? [];

  const availableMembers =
    useMemo(() => {
      const participantIds = new Set(
        participants.map(
          (participant) =>
            participant.id
        )
      );

      return projectMembers.filter(
        (member) =>
          member.user.status === "ACTIVE" &&
          !participantIds.has(member.userId)
      );
    }, [
      participants,
      projectMembers,
    ]);

  if (!meeting) {
    return null;
  }

  const handleAdd = async () => {
    if (!selectedUserId) {
      toast.error(
        "Please select a participant."
      );

      return;
    }

    try {
      await onAddParticipant(
        selectedUserId
      );

      setSelectedUserId("");
    } catch {
      // Parent handles the error.
    }
  };

  const handleRemove = async () => {
    if (!removeCandidate) {
      return;
    }

    try {
      await onRemoveParticipant(
        removeCandidate.id
      );

      setRemoveCandidate(null);
    } catch {
      // Parent handles the error.
    }
  };

  return (
    <div className="fixed inset-0 z-[130] flex items-start justify-center overflow-y-auto bg-slate-900/40 p-4 sm:p-6">
      <div className="my-4 flex w-full max-w-2xl flex-col overflow-hidden rounded-xl bg-white shadow-xl sm:my-8">
        <div className="flex items-start justify-between border-b border-slate-200 px-6 py-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100">
              <Users className="h-5 w-5 text-slate-600" />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Meeting Participants
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Manage participants for{" "}
                <span className="font-medium text-slate-700">
                  {meeting.title}
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

        <div className="max-h-[calc(100vh-10rem)] overflow-y-auto p-6">
          {error && (
            <div className="mb-5 rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          {canManage && (
            <section className="rounded-xl border border-slate-200 bg-slate-50 p-4">
              <div className="flex items-start gap-3">
                <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-white">
                  <UserPlus className="h-4 w-4 text-slate-600" />
                </div>

                <div className="min-w-0 flex-1">
                  <h3 className="text-sm font-semibold text-slate-900">
                    Add Participant
                  </h3>

                  <p className="mt-1 text-xs text-slate-500">
                    Only active members of this project can be added.
                  </p>

                  <div className="mt-3 flex flex-col gap-3 sm:flex-row">
                    <select
                      value={selectedUserId}
                      onChange={(event) =>
                        setSelectedUserId(
                          event.target.value
                        )
                      }
                      disabled={
                        isAdding ||
                        isMembersLoading
                      }
                      className="w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm text-slate-900 outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 disabled:cursor-not-allowed disabled:bg-slate-50 disabled:opacity-70"
                    >
                      <option value="">
                        {isMembersLoading
                          ? "Loading project members..."
                          : "Select participant"}
                      </option>

                      {availableMembers.map(
                        (member) => (
                          <option
                            key={member.userId}
                            value={member.userId}
                          >
                            {member.user.firstName}{" "}
                            {member.user.lastName}
                          </option>
                        )
                      )}
                    </select>

                    <button
                      type="button"
                      onClick={handleAdd}
                      disabled={
                        isAdding ||
                        isMembersLoading ||
                        !selectedUserId
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
                          Add
                        </>
                      )}
                    </button>
                  </div>

                  {isMembersError && (
                    <p className="mt-2 text-xs text-red-600">
                      Unable to load project members.
                    </p>
                  )}

                  {!isMembersLoading &&
                    !isMembersError &&
                    availableMembers.length === 0 && (
                      <p className="mt-2 text-xs text-slate-400">
                        All active project members are already participants.
                      </p>
                    )}
                </div>
              </div>
            </section>
          )}

          <section className={canManage ? "mt-6" : ""}>
            <div className="flex items-center justify-between">
              <div>
                <h3 className="text-sm font-semibold text-slate-900">
                  Current Participants
                </h3>

                <p className="mt-1 text-xs text-slate-500">
                  {participants.length}{" "}
                  {participants.length === 1
                    ? "participant"
                    : "participants"}
                </p>
              </div>

              {isLoading && (
                <Loader2 className="h-4 w-4 animate-spin text-slate-400" />
              )}
            </div>

            {isLoading ? (
              <div className="mt-4 flex min-h-[180px] items-center justify-center rounded-xl border border-slate-200 bg-slate-50">
                <div className="flex items-center gap-2 text-sm text-slate-500">
                  <Loader2 className="h-5 w-5 animate-spin" />
                  Loading participants...
                </div>
              </div>
            ) : isParticipantsError ? (
              <div className="mt-4 rounded-xl border border-red-200 bg-red-50 px-4 py-4 text-sm text-red-700">
                Unable to load participants for this meeting.
              </div>
            ) : participants.length === 0 ? (
              <div className="mt-4 flex min-h-[180px] flex-col items-center justify-center rounded-xl border border-slate-200 bg-slate-50 px-6 text-center">
                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-white">
                  <Users className="h-5 w-5 text-slate-400" />
                </div>

                <h4 className="mt-3 text-sm font-semibold text-slate-900">
                  No participants
                </h4>

                <p className="mt-1 text-xs text-slate-500">
                  No participants have been added to this meeting.
                </p>
              </div>
            ) : (
              <div className="mt-4 overflow-hidden rounded-xl border border-slate-200">
                <div className="divide-y divide-slate-100">
                  {participants.map(
                    (participant) => {
                      const isRemoving =
                        removingUserId ===
                        participant.id;

                      return (
                        <div
                          key={participant.id}
                          className="flex items-center justify-between gap-4 px-4 py-4"
                        >
                          <div className="flex min-w-0 items-center gap-3">
                            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-slate-100">
                              <UserRound className="h-5 w-5 text-slate-500" />
                            </div>

                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-slate-900">
                                {participant.firstName}{" "}
                                {participant.lastName}
                              </p>

                              <p className="mt-0.5 truncate text-xs text-slate-500">
                                {participant.email}
                              </p>
                            </div>
                          </div>

                          {canManage && (
                            <button
                              type="button"
                              onClick={() =>
                                setRemoveCandidate(
                                  participant
                                )
                              }
                              disabled={isRemoving}
                              className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg text-red-500 transition hover:bg-red-50 hover:text-red-700 disabled:cursor-not-allowed disabled:opacity-50"
                              title="Remove participant"
                              aria-label="Remove participant"
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

      {removeCandidate && (
        <div className="fixed inset-0 z-[140] flex items-center justify-center bg-slate-900/40 p-4">
          <div className="w-full max-w-md rounded-xl bg-white p-6 shadow-xl">
            <h2 className="text-lg font-semibold text-slate-900">
              Remove Participant?
            </h2>

            <p className="mt-2 text-sm leading-6 text-slate-500">
              Are you sure you want to remove{" "}
              <span className="font-medium text-slate-700">
                {removeCandidate.firstName}{" "}
                {removeCandidate.lastName}
              </span>{" "}
              from this meeting?
            </p>

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={() =>
                  setRemoveCandidate(null)
                }
                disabled={Boolean(removingUserId)}
                className="rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Cancel
              </button>

              <button
                type="button"
                onClick={handleRemove}
                disabled={Boolean(removingUserId)}
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
                    Remove Participant
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