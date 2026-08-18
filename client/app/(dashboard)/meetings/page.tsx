"use client";

import {
  useEffect,
  useState,
} from "react";

import {
  AlertCircle,
  Loader2,
} from "lucide-react";

import { useRouter } from "next/navigation";

import { toast } from "sonner";

import DashboardLayout from "@/components/dashboard/DashboardLayout";

import DeleteMeetingDialog from "@/components/meetings/DeleteMeetingDialog";
import MeetingFormModal from "@/components/meetings/MeetingFormModal";
import MeetingParticipantsModal from "@/components/meetings/MeetingParticipantsModal";

import { useProjects } from "@/features/projects/hooks/useProjects";
import { useUsers } from "@/features/users/hooks/useUsers";

import MeetingsFilters from "@/features/meetings/components/MeetingsFilters";
import MeetingsHeader from "@/features/meetings/components/MeetingsHeader";
import MeetingsPagination from "@/features/meetings/components/MeetingsPagination";
import MeetingsTable from "@/features/meetings/components/MeetingsTable";

import { useCurrentUser } from "@/features/auth/hooks/useAuth";
import { authStorage } from "@/features/auth/services/auth-storage";

import {
  useCreateMeeting,
  useDeleteMeeting,
  useMeetings,
  useUpdateMeeting,
} from "@/features/meetings/hooks/useMeetings";

import {
  useAddMeetingParticipant,
  useMeetingParticipants,
  useRemoveMeetingParticipant,
} from "@/features/meetings/hooks/useMeetingParticipants";

import type {
  CreateMeetingPayload,
  Meeting,
  MeetingStatus,
  UpdateMeetingPayload,
} from "@/features/meetings/types/meeting.types";

const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 400;

export default function MeetingsPage() {
  const router = useRouter();

  /* ------------------------------------------------------------------------ */
  /* Supporting data                                                          */
  /* ------------------------------------------------------------------------ */

  const {
    data: projectsData,
  } = useProjects({
    limit: 100,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const {
    data: usersData,
  } = useUsers({
    limit: 100,
    role: "PROJECT_MANAGER",
  });

  /* ------------------------------------------------------------------------ */
  /* Local state                                                              */
  /* ------------------------------------------------------------------------ */

  const [mounted, setMounted] =
    useState(false);

  const [page, setPage] =
    useState(1);

  const [searchInput, setSearchInput] =
    useState("");

  const [search, setSearch] =
    useState("");

  const [projectId, setProjectId] =
    useState("");

  const [organizerId, setOrganizerId] =
    useState("");

  const [status, setStatus] =
    useState<MeetingStatus | "">("");

  const [isModalOpen, setIsModalOpen] =
    useState(false);

  const [editingMeeting, setEditingMeeting] =
    useState<Meeting | null>(null);

  const [viewingMeeting, setViewingMeeting] =
    useState<Meeting | null>(null);

  const [deleteMeeting, setDeleteMeeting] =
    useState<Meeting | null>(null);

  const [participantsMeeting, setParticipantsMeeting] =
    useState<Meeting | null>(null);

  const [formError, setFormError] =
    useState<string | null>(null);

  const [participantsError, setParticipantsError] =
    useState<string | null>(null);

  /* ------------------------------------------------------------------------ */
  /* Auth                                                                     */
  /* ------------------------------------------------------------------------ */

  const {
    data: user,
    isLoading: isUserLoading,
    isError: isUserError,
  } = useCurrentUser();

  /* ------------------------------------------------------------------------ */
  /* Meetings                                                                 */
  /* ------------------------------------------------------------------------ */

  const {
    data,
    isLoading: isMeetingsLoading,
    isFetching,
    isError: isMeetingsError,
    refetch,
  } = useMeetings({
    page,
    limit: PAGE_SIZE,
    search:
      search || undefined,
    projectId:
      projectId || undefined,
    organizerId:
      organizerId || undefined,
    status:
      status || undefined,
    sortBy: "meetingDate",
    sortOrder: "asc",
  });

  /* ------------------------------------------------------------------------ */
  /* Participants                                                             */
  /* ------------------------------------------------------------------------ */

  const {
    data: participantsData,
    isLoading: isParticipantsLoading,
    isError: isParticipantsError,
  } = useMeetingParticipants(
    participantsMeeting?.id
  );

  const addParticipant =
    useAddMeetingParticipant();

  const removeParticipant =
    useRemoveMeetingParticipant();

  /* ------------------------------------------------------------------------ */
  /* Mutations                                                                */
  /* ------------------------------------------------------------------------ */

  const createMeeting =
    useCreateMeeting();

  const updateMeeting =
    useUpdateMeeting();

  const deleteMeetingMutation =
    useDeleteMeeting();

  /* ------------------------------------------------------------------------ */
  /* Mount                                                                    */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) {
      return;
    }

    if (!authStorage.getToken()) {
      router.replace("/login");
    }
  }, [mounted, router]);

  useEffect(() => {
    if (!mounted || !isUserError) {
      return;
    }

    authStorage.removeToken();
    router.replace("/login");
  }, [mounted, isUserError, router]);

  /* ------------------------------------------------------------------------ */
  /* Search debounce                                                          */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    const timeout = setTimeout(() => {
      setSearch(searchInput.trim());
      setPage(1);
    }, SEARCH_DEBOUNCE_MS);

    return () => clearTimeout(timeout);
  }, [searchInput]);

  /* ------------------------------------------------------------------------ */
  /* Filters                                                                  */
  /* ------------------------------------------------------------------------ */

  const resetFilters = () => {
    setProjectId("");
    setOrganizerId("");
    setStatus("");
    setSearchInput("");
    setSearch("");
    setPage(1);
  };

  const handleProjectChange = (
    value: string
  ) => {
    setProjectId(value);
    setPage(1);
  };

  const handleOrganizerChange = (
    value: string
  ) => {
    setOrganizerId(value);
    setPage(1);
  };

  const handleStatusChange = (
    value: MeetingStatus | ""
  ) => {
    setStatus(value);
    setPage(1);
  };

  /* ------------------------------------------------------------------------ */
  /* Meeting modal helpers                                                    */
  /* ------------------------------------------------------------------------ */

  const openCreateModal = () => {
    setEditingMeeting(null);
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (
    meeting: Meeting
  ) => {
    setEditingMeeting(meeting);
    setFormError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (
      createMeeting.isPending ||
      updateMeeting.isPending
    ) {
      return;
    }

    setIsModalOpen(false);
    setEditingMeeting(null);
    setFormError(null);
  };

  /* ------------------------------------------------------------------------ */
  /* Participants                                                              */
  /* ------------------------------------------------------------------------ */

  const openParticipantsModal = (
    meeting: Meeting
  ) => {
    setParticipantsError(null);
    setParticipantsMeeting(meeting);
  };

  const closeParticipantsModal = () => {
    if (
      addParticipant.isPending ||
      removeParticipant.isPending
    ) {
      return;
    }

    setParticipantsMeeting(null);
    setParticipantsError(null);
  };

  /* ------------------------------------------------------------------------ */
  /* View                                                                     */
  /* ------------------------------------------------------------------------ */

  const handleView = (
    meeting: Meeting
  ) => {
    setViewingMeeting(meeting);
  };

  /* ------------------------------------------------------------------------ */
  /* Create                                                                   */
  /* ------------------------------------------------------------------------ */

  const handleCreate = async (
    payload: CreateMeetingPayload
  ) => {
    setFormError(null);

    try {
      const response =
        await createMeeting.mutateAsync(
          payload
        );

      toast.success(
        response.message ||
          "Meeting created successfully."
      );

      setIsModalOpen(false);
      setEditingMeeting(null);
      setPage(1);
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        "Failed to create meeting. Please try again.";

      setFormError(message);
      toast.error(message);

      throw error;
    }
  };

  /* ------------------------------------------------------------------------ */
  /* Update                                                                   */
  /* ------------------------------------------------------------------------ */

  const handleUpdate = async (
    payload: UpdateMeetingPayload
  ) => {
    if (!editingMeeting) {
      return;
    }

    setFormError(null);

    try {
      const response =
        await updateMeeting.mutateAsync({
          id: editingMeeting.id,
          data: payload,
        });

      toast.success(
        response.message ||
          "Meeting updated successfully."
      );

      setIsModalOpen(false);
      setEditingMeeting(null);
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        "Failed to update meeting. Please try again.";

      setFormError(message);
      toast.error(message);

      throw error;
    }
  };

  /* ------------------------------------------------------------------------ */
  /* Delete                                                                   */
  /* ------------------------------------------------------------------------ */

  const handleDelete = async () => {
    if (!deleteMeeting) {
      return;
    }

    try {
      const response =
        await deleteMeetingMutation.mutateAsync(
          deleteMeeting.id
        );

      toast.success(
        response.message ||
          "Meeting deleted successfully."
      );

      setDeleteMeeting(null);

      if (
        data?.data.length === 1 &&
        page > 1
      ) {
        setPage((previous) => previous - 1);
      }
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        "Failed to delete meeting. Please try again.";

      toast.error(message);
      setDeleteMeeting(null);
    }
  };

  /* ------------------------------------------------------------------------ */
  /* Add participant                                                           */
  /* ------------------------------------------------------------------------ */

  const handleAddParticipant = async (
    userId: string
  ) => {
    if (!participantsMeeting) {
      return;
    }

    setParticipantsError(null);

    try {
      const response =
        await addParticipant.mutateAsync({
          meetingId:
            participantsMeeting.id,
          data: {
            userId,
          },
        });

      toast.success(
        response.message ||
          "Participant added successfully."
      );
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        "Failed to add participant. Please try again.";

      setParticipantsError(message);
      toast.error(message);

      throw error;
    }
  };

  /* ------------------------------------------------------------------------ */
  /* Remove participant                                                        */
  /* ------------------------------------------------------------------------ */

  const handleRemoveParticipant = async (
    userId: string
  ) => {
    if (!participantsMeeting) {
      return;
    }

    setParticipantsError(null);

    try {
      const response =
        await removeParticipant.mutateAsync({
          meetingId:
            participantsMeeting.id,
          userId,
        });

      toast.success(
        response.message ||
          "Participant removed successfully."
      );
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        "Failed to remove participant. Please try again.";

      setParticipantsError(message);
      toast.error(message);

      throw error;
    }
  };

  /* ------------------------------------------------------------------------ */
  /* Initial mounting                                                         */
  /* ------------------------------------------------------------------------ */

  if (!mounted) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading meetings...
        </div>
      </main>
    );
  }

  if (
    isUserLoading ||
    !user
  ) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading...
        </div>
      </main>
    );
  }

  /* ------------------------------------------------------------------------ */
  /* Authorization                                                            */
  /* ------------------------------------------------------------------------ */

  const canAccessMeetings =
    user.role === "SUPER_ADMIN" ||
    user.role === "PROJECT_MANAGER" ||
    user.role === "EMPLOYEE";

  if (!canAccessMeetings) {
    return (
      <DashboardLayout user={user}>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="max-w-md rounded-xl border border-red-200 bg-red-50 p-6 text-center">
            <AlertCircle className="mx-auto h-8 w-8 text-red-500" />

            <h2 className="mt-3 text-lg font-semibold text-red-700">
              Access Denied
            </h2>

            <p className="mt-1 text-sm text-red-600">
              You do not have permission to access meetings.
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  /* ------------------------------------------------------------------------ */
  /* Meetings loading                                                         */
  /* ------------------------------------------------------------------------ */

  if (
    isMeetingsLoading &&
    !data
  ) {
    return (
      <DashboardLayout user={user}>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading meetings...
          </div>
        </div>
      </DashboardLayout>
    );
  }

  if (
    isMeetingsError ||
    !data
  ) {
    return (
      <DashboardLayout user={user}>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
            <AlertCircle className="mx-auto h-8 w-8 text-red-500" />

            <h2 className="mt-3 text-lg font-semibold text-red-700">
              Unable to load meetings
            </h2>

            <p className="mt-1 text-sm text-red-600">
              Something went wrong while loading meetings.
            </p>

            <button
              type="button"
              onClick={() => refetch()}
              className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
            >
              Try Again
            </button>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  /* ------------------------------------------------------------------------ */
  /* Data                                                                     */
  /* ------------------------------------------------------------------------ */

  const meetings = data.data;
  const meta = data.meta;

  const projects =
    projectsData?.data ?? [];

  const organizers =
    usersData?.users ?? [];

  const participants =
    participantsData?.data ?? [];

  /* ------------------------------------------------------------------------ */
  /* Permissions                                                              */
  /* ------------------------------------------------------------------------ */

  const canManageMeetings =
    user.role === "SUPER_ADMIN" ||
    user.role === "PROJECT_MANAGER";

  const canCreateMeeting =
    canManageMeetings;

  const canEditMeeting = (
    meeting: Meeting
  ) =>
    canManageMeetings &&
    (
      user.role === "SUPER_ADMIN" ||
      meeting.project.status !== "COMPLETED" &&
      meeting.project.status !== "CANCELLED"
    );

  const canDeleteMeeting = (
    meeting: Meeting
  ) =>
    canManageMeetings &&
    (
      user.role === "SUPER_ADMIN" ||
      (
        meeting.project.status !== "COMPLETED" &&
        meeting.project.status !== "CANCELLED"
      )
    );

  const canManageParticipants = (
    meeting: Meeting
  ) =>
    canManageMeetings &&
    (
      user.role === "SUPER_ADMIN" ||
      (
        meeting.project.status !== "COMPLETED" &&
        meeting.project.status !== "CANCELLED"
      )
    );

  const canManageSelectedParticipants =
    Boolean(
      participantsMeeting &&
      (
        user.role === "SUPER_ADMIN" ||
        (
          user.role === "PROJECT_MANAGER" &&
          participantsMeeting.projectId &&
          meetings.find(
            (meeting) =>
              meeting.id ===
              participantsMeeting.id
          )?.organizerId !== undefined
        )
      )
    );

  const selectedMeeting =
    participantsMeeting
      ? meetings.find(
          (meeting) =>
            meeting.id ===
            participantsMeeting.id
        )
      : null;

  const canManageSelectedParticipantsFinal =
    Boolean(
      participantsMeeting &&
      canManageMeetings &&
      (
        user.role === "SUPER_ADMIN" ||
        selectedMeeting?.project !== undefined
      )
    );

  /* ------------------------------------------------------------------------ */
  /* Render                                                                   */
  /* ------------------------------------------------------------------------ */

  return (
    <DashboardLayout user={user}>
      <div className="mx-auto max-w-7xl space-y-6">
        <MeetingsHeader
          search={searchInput}
          onSearchChange={setSearchInput}
          onCreate={openCreateModal}
          canCreate={canCreateMeeting}
        />

        <MeetingsFilters
          projects={projects}
          organizers={organizers}
          projectId={projectId}
          organizerId={organizerId}
          status={status}
          onProjectChange={handleProjectChange}
          onOrganizerChange={handleOrganizerChange}
          onStatusChange={handleStatusChange}
          onReset={resetFilters}
        />

        <MeetingsTable
          meetings={meetings}
          search={search}
          isFetching={isFetching}
          canEdit={canEditMeeting}
          canDelete={canDeleteMeeting}
          canManageParticipants={
            canManageParticipants
          }
          onView={handleView}
          onEdit={openEditModal}
          onDelete={setDeleteMeeting}
          onManageParticipants={
            openParticipantsModal
          }
        />

        <MeetingsPagination
          page={meta.page}
          totalPages={meta.totalPages}
          isFetching={isFetching}
          onPageChange={setPage}
        />
      </div>

      {/* Create / Edit */}
      {canCreateMeeting && (
        <MeetingFormModal
          open={isModalOpen}
          meeting={editingMeeting}
          projects={projects}
          error={formError}
          isSubmitting={
            createMeeting.isPending ||
            updateMeeting.isPending
          }
          onClose={closeModal}
          onCreate={handleCreate}
          onUpdate={handleUpdate}
        />
      )}

      {/* Delete */}
      <DeleteMeetingDialog
        meeting={deleteMeeting}
        isDeleting={
          deleteMeetingMutation.isPending
        }
        onCancel={() =>
          setDeleteMeeting(null)
        }
        onConfirm={handleDelete}
      />

      {/* Participants */}
      <MeetingParticipantsModal
        meeting={participantsMeeting}
        participants={participants}
        isLoading={isParticipantsLoading}
        isParticipantsError={
          isParticipantsError
        }
        isAdding={
          addParticipant.isPending
        }
        removingUserId={
          removeParticipant.isPending
            ? removeParticipant.variables
                ?.userId ?? null
            : null
        }
        canManage={
          canManageSelectedParticipantsFinal
        }
        error={
          participantsError ??
          (
            isParticipantsError
              ? "Unable to load meeting participants."
              : null
          )
        }
        onClose={
          closeParticipantsModal
        }
        onAddParticipant={
          handleAddParticipant
        }
        onRemoveParticipant={
          handleRemoveParticipant
        }
      />

      {/* Meeting view */}
      {viewingMeeting && (
        <MeetingViewPlaceholder
          meeting={viewingMeeting}
          onClose={() =>
            setViewingMeeting(null)
          }
        />
      )}
    </DashboardLayout>
  );
}

/* -------------------------------------------------------------------------- */
/* Meeting View                                                               */
/* -------------------------------------------------------------------------- */

function MeetingViewPlaceholder({
  meeting,
  onClose,
}: {
  meeting: Meeting;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/40 p-4">
      <div className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              {meeting.title}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Meeting details
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-3 py-2 text-sm text-slate-500 transition hover:bg-slate-100"
          >
            Close
          </button>
        </div>

        <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-2">
          <DetailCard
            label="Project"
            value={meeting.project.name}
          />

          <DetailCard
            label="Organizer"
            value={`${meeting.organizer.firstName} ${meeting.organizer.lastName}`}
          />

          <DetailCard
            label="Date & Time"
            value={formatDateTime(
              meeting.meetingDate
            )}
          />

          <DetailCard
            label="Location"
            value={
              meeting.location ||
              "No location"
            }
          />
        </div>

        <div className="mt-4 space-y-4">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Agenda
            </p>

            <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">
              {meeting.agenda ||
                "No agenda provided."}
            </p>
          </div>

          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Notes
            </p>

            <p className="mt-1 whitespace-pre-wrap text-sm text-slate-700">
              {meeting.notes ||
                "No notes provided."}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}

function DetailCard({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="rounded-lg border border-slate-200 p-4">
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 truncate text-sm font-medium text-slate-800">
        {value}
      </p>
    </div>
  );
}

function formatDateTime(
  value: string
): string {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
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