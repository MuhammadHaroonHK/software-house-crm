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

import ChangeProjectStatusDialog from "@/components/projects/ChangeProjectStatusDialog";
import DeleteProjectDialog from "@/components/projects/DeleteProjectDialog";
import ProjectFormModal from "@/components/projects/ProjectFormModal";
import ProjectMembersModal from "@/components/projects/ProjectMembersModal";

import { useClients } from "@/features/clients/hooks/useClients";
import { useUsers } from "@/features/users/hooks/useUsers";

import ProjectsHeader from "@/features/projects/components/ProjectsHeader";
import ProjectsPagination from "@/features/projects/components/ProjectsPagination";
import ProjectsTable from "@/features/projects/components/ProjectsTable";

import { useCurrentUser } from "@/features/auth/hooks/useAuth";
import { authStorage } from "@/features/auth/services/auth-storage";

import {
  useChangeProjectStatus,
  useCreateProject,
  useDeleteProject,
  useProjects,
  useUpdateProject,
} from "@/features/projects/hooks/useProjects";

import {
  useAddProjectMember,
  useProjectMembers,
  useRemoveProjectMember,
} from "@/features/projects/hooks/useProjectMembers";

import type {
  CreateProjectPayload,
  Project,
  UpdateProjectPayload,
} from "@/features/projects/types/project.types";

/* -------------------------------------------------------------------------- */
/* Constants                                                                  */
/* -------------------------------------------------------------------------- */

const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 400;

/* -------------------------------------------------------------------------- */
/* Page                                                                       */
/* -------------------------------------------------------------------------- */

export default function ProjectsPage() {
  const router = useRouter();

  /* ------------------------------------------------------------------------ */
  /* Supporting data                                                          */
  /* ------------------------------------------------------------------------ */

  const {
    data: clientsData,
  } = useClients({
    limit: 100,
  });

  const {
    data: usersData,
  } = useUsers({
    limit: 100,
    role: "PROJECT_MANAGER",
  });

  const {
    data: employeesData,
    isLoading: isEmployeesLoading,
  } = useUsers({
    limit: 100,
    role: "EMPLOYEE",
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

  const [isModalOpen, setIsModalOpen] =
    useState(false);

  const [editingProject, setEditingProject] =
    useState<Project | null>(null);

  const [viewingProject, setViewingProject] =
    useState<Project | null>(null);

  const [deleteProject, setDeleteProject] =
    useState<Project | null>(null);

  const [statusProject, setStatusProject] =
    useState<Project | null>(null);

  const [membersProject, setMembersProject] =
    useState<Project | null>(null);

  const [formError, setFormError] =
    useState<string | null>(null);

  const [membersError, setMembersError] =
    useState<string | null>(null);

  /* ------------------------------------------------------------------------ */
  /* Authentication                                                           */
  /* ------------------------------------------------------------------------ */

  const {
    data: user,
    isLoading: isUserLoading,
    isError: isUserError,
  } = useCurrentUser();

  /* ------------------------------------------------------------------------ */
  /* Projects                                                                 */
  /* ------------------------------------------------------------------------ */

  const {
    data,
    isLoading: isProjectsLoading,
    isFetching,
    isError: isProjectsError,
    refetch,
  } = useProjects({
    page,
    limit: PAGE_SIZE,
    search:
      search || undefined,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  /* ------------------------------------------------------------------------ */
  /* Project members                                                          */
  /* ------------------------------------------------------------------------ */

  const {
    data: membersData,
    isLoading: isMembersLoading,
    isError: isMembersError,
  } = useProjectMembers(
    membersProject?.id
  );

  const addProjectMember =
    useAddProjectMember();

  const removeProjectMember =
    useRemoveProjectMember();

  /* ------------------------------------------------------------------------ */
  /* Mutations                                                                */
  /* ------------------------------------------------------------------------ */

  const createProject =
    useCreateProject();

  const updateProject =
    useUpdateProject();

  const changeProjectStatus =
    useChangeProjectStatus();

  const deleteProjectMutation =
    useDeleteProject();

  /* ------------------------------------------------------------------------ */
  /* Mount                                                                    */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    setMounted(true);
  }, []);

  /* ------------------------------------------------------------------------ */
  /* Authentication redirect                                                 */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    if (!mounted) {
      return;
    }

    if (!authStorage.getToken()) {
      router.replace("/login");
    }
  }, [
    mounted,
    router,
  ]);

  /* ------------------------------------------------------------------------ */
  /* Authentication error                                                     */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    if (
      !mounted ||
      !isUserError
    ) {
      return;
    }

    authStorage.removeToken();

    router.replace("/login");
  }, [
    mounted,
    isUserError,
    router,
  ]);

  /* ------------------------------------------------------------------------ */
  /* Search debounce                                                          */
  /* ------------------------------------------------------------------------ */

  useEffect(() => {
    const timeout =
      setTimeout(() => {
        const trimmedSearch =
          searchInput.trim();

        setSearch(trimmedSearch);
        setPage(1);
      }, SEARCH_DEBOUNCE_MS);

    return () => {
      clearTimeout(timeout);
    };
  }, [searchInput]);

  /* ------------------------------------------------------------------------ */
  /* Modal helpers                                                            */
  /* ------------------------------------------------------------------------ */

  const openCreateModal = () => {
    setEditingProject(null);
    setFormError(null);
    setIsModalOpen(true);
  };

  const openEditModal = (
    project: Project
  ) => {
    setEditingProject(project);
    setFormError(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    if (
      createProject.isPending ||
      updateProject.isPending
    ) {
      return;
    }

    setIsModalOpen(false);
    setEditingProject(null);
    setFormError(null);
  };

  const openMembersModal = (
    project: Project
  ) => {
    setMembersError(null);
    setMembersProject(project);
  };

  const closeMembersModal = () => {
    if (
      addProjectMember.isPending ||
      removeProjectMember.isPending
    ) {
      return;
    }

    setMembersProject(null);
    setMembersError(null);
  };

  /* ------------------------------------------------------------------------ */
  /* View Project                                                             */
  /* ------------------------------------------------------------------------ */

  const handleView = (
    project: Project
  ) => {
    setViewingProject(project);
  };

  /* ------------------------------------------------------------------------ */
  /* Create Project                                                           */
  /* ------------------------------------------------------------------------ */

  const handleCreate = async (
    payload: CreateProjectPayload
  ) => {
    setFormError(null);

    try {
      const response =
        await createProject.mutateAsync(
          payload
        );

      toast.success(
        response.message ||
          "Project created successfully."
      );

      setIsModalOpen(false);
      setEditingProject(null);

      setPage(1);
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        "Failed to create project. Please try again.";

      setFormError(message);

      toast.error(message);

      throw error;
    }
  };

  /* ------------------------------------------------------------------------ */
  /* Update Project                                                           */
  /* ------------------------------------------------------------------------ */

  const handleUpdate = async (
    payload: UpdateProjectPayload
  ) => {
    if (!editingProject) {
      return;
    }

    setFormError(null);

    try {
      const response =
        await updateProject.mutateAsync({
          id: editingProject.id,
          data: payload,
        });

      toast.success(
        response.message ||
          "Project updated successfully."
      );

      setIsModalOpen(false);
      setEditingProject(null);
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        "Failed to update project. Please try again.";

      setFormError(message);

      toast.error(message);

      throw error;
    }
  };

  /* ------------------------------------------------------------------------ */
  /* Change Project Status                                                    */
  /* ------------------------------------------------------------------------ */

  const handleChangeStatus = async (
    status: Project["status"]
  ) => {
    if (!statusProject) {
      return;
    }

    try {
      const response =
        await changeProjectStatus.mutateAsync(
          {
            id: statusProject.id,
            data: {
              status,
            },
          }
        );

      toast.success(
        response.message ||
          "Project status updated successfully."
      );

      setStatusProject(null);
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        "Failed to update project status. Please try again.";

      toast.error(message);
    }
  };

  /* ------------------------------------------------------------------------ */
  /* Add Project Member                                                       */
  /* ------------------------------------------------------------------------ */

  const handleAddMember = async (
    userId: string
  ) => {
    if (!membersProject) {
      return;
    }

    setMembersError(null);

    try {
      const response =
        await addProjectMember.mutateAsync({
          projectId:
            membersProject.id,
          data: {
            userId,
          },
        });

      toast.success(
        response.message ||
          "Project member added successfully."
      );
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        "Failed to add project member. Please try again.";

      setMembersError(message);

      toast.error(message);

      throw error;
    }
  };

  /* ------------------------------------------------------------------------ */
  /* Remove Project Member                                                    */
  /* ------------------------------------------------------------------------ */

  const handleRemoveMember = async (
    userId: string
  ) => {
    if (!membersProject) {
      return;
    }

    setMembersError(null);

    try {
      const response =
        await removeProjectMember.mutateAsync({
          projectId:
            membersProject.id,
          userId,
        });

      toast.success(
        response.message ||
          "Project member removed successfully."
      );
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        "Failed to remove project member. Please try again.";

      setMembersError(message);

      toast.error(message);

      throw error;
    }
  };

  /* ------------------------------------------------------------------------ */
  /* Delete Project                                                           */
  /* ------------------------------------------------------------------------ */

  const handleDelete = async () => {
    if (!deleteProject) {
      return;
    }

    try {
      const response =
        await deleteProjectMutation.mutateAsync(
          deleteProject.id
        );

      toast.success(
        response.message ||
          "Project deleted successfully."
      );

      setDeleteProject(null);

      if (
        data?.data.length === 1 &&
        page > 1
      ) {
        setPage(
          (previous) =>
            previous - 1
        );
      }
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        "Failed to delete project. Please try again.";

      toast.error(message);

      setDeleteProject(null);
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
          Loading projects...
        </div>
      </main>
    );
  }

  /* ------------------------------------------------------------------------ */
  /* User loading                                                             */
  /* ------------------------------------------------------------------------ */

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

  const canManageProjects =
    user.role === "SUPER_ADMIN" ||
    user.role === "PROJECT_MANAGER";

  if (!canManageProjects) {
    return (
      <DashboardLayout user={user}>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="max-w-md rounded-xl border border-red-200 bg-red-50 p-6 text-center">
            <AlertCircle className="mx-auto h-8 w-8 text-red-500" />

            <h2 className="mt-3 text-lg font-semibold text-red-700">
              Access Denied
            </h2>

            <p className="mt-1 text-sm text-red-600">
              You do not have permission
              to manage projects.
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  /* ------------------------------------------------------------------------ */
  /* Projects loading                                                         */
  /* ------------------------------------------------------------------------ */

  const showInitialLoading =
    isProjectsLoading &&
    !data;

  if (showInitialLoading) {
    return (
      <DashboardLayout user={user}>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading projects...
          </div>
        </div>
      </DashboardLayout>
    );
  }

  /* ------------------------------------------------------------------------ */
  /* Projects error                                                           */
  /* ------------------------------------------------------------------------ */

  if (
    isProjectsError ||
    !data
  ) {
    return (
      <DashboardLayout user={user}>
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
            <AlertCircle className="mx-auto h-8 w-8 text-red-500" />

            <h2 className="mt-3 text-lg font-semibold text-red-700">
              Unable to load projects
            </h2>

            <p className="mt-1 text-sm text-red-600">
              Something went wrong while
              loading projects.
            </p>

            <button
              type="button"
              onClick={() =>
                refetch()
              }
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

  const projects = data.data;
  const meta = data.meta;

  const clients =
    clientsData?.data ?? [];

  const managers =
    usersData?.users ?? [];

  const employees =
    employeesData?.users ?? [];

  const members =
    membersData?.data ?? [];

  const canManageSelectedMembers =
    Boolean(
      membersProject &&
      (
        user.role ===
          "SUPER_ADMIN" ||
        (
          user.role ===
            "PROJECT_MANAGER" &&
          membersProject.managerId ===
            user.id
        )
      )
    );

  /* ------------------------------------------------------------------------ */
  /* Render                                                                   */
  /* ------------------------------------------------------------------------ */

  return (
    <DashboardLayout user={user}>
      <div className="mx-auto max-w-7xl space-y-6">
        <ProjectsHeader
          search={searchInput}
          onSearchChange={
            setSearchInput
          }
          onCreate={
            openCreateModal
          }
        />

        <ProjectsTable
          projects={projects}
          search={search}
          isFetching={isFetching}

          canEdit={(project) =>
            user.role ===
              "SUPER_ADMIN" ||
            (
              user.role ===
                "PROJECT_MANAGER" &&
              project.manager?.id ===
                user.id
            )
          }

          canDelete={() =>
            user.role ===
            "SUPER_ADMIN"
          }

          canChangeStatus={(
            project
          ) =>
            user.role ===
              "SUPER_ADMIN" ||
            (
              user.role ===
                "PROJECT_MANAGER" &&
              project.manager?.id ===
                user.id
            )
          }

          canManageMembers={(
            project
          ) =>
            user.role ===
              "SUPER_ADMIN" ||
            (
              user.role ===
                "PROJECT_MANAGER" &&
              project.manager?.id ===
                user.id
            )
          }

          onView={handleView}
          onEdit={openEditModal}
          onDelete={setDeleteProject}
          onChangeStatus={
            setStatusProject
          }
          onManageMembers={
            openMembersModal
          }
        />

        <ProjectsPagination
          page={meta.page}
          totalPages={
            meta.totalPages
          }
          isFetching={isFetching}
          onPageChange={setPage}
        />
      </div>

      {/* Create / Edit modal */}
      <ProjectFormModal
        open={isModalOpen}
        project={editingProject}
        clients={clients}
        managers={managers}
        error={formError}
        isSubmitting={
          createProject.isPending ||
          updateProject.isPending
        }
        onClose={closeModal}
        onCreate={handleCreate}
        onUpdate={handleUpdate}
      />

      {/* Delete dialog */}
      <DeleteProjectDialog
        project={deleteProject}
        isDeleting={
          deleteProjectMutation.isPending
        }
        onCancel={() =>
          setDeleteProject(null)
        }
        onConfirm={handleDelete}
      />

      {/* Change status dialog */}
      <ChangeProjectStatusDialog
        project={statusProject}
        isUpdating={
          changeProjectStatus.isPending
        }
        onCancel={() =>
          setStatusProject(null)
        }
        onConfirm={handleChangeStatus}
      />

      {/* Project members */}
      <ProjectMembersModal
        project={membersProject}
        members={members}
        employees={employees}
        isLoading={
          isMembersLoading
        }
        isLoadingEmployees={
          isEmployeesLoading
        }
        isAdding={
          addProjectMember.isPending
        }
        removingUserId={
          removeProjectMember.isPending
            ? removeProjectMember.variables
                ?.userId ?? null
            : null
        }
        canManageMembers={
          canManageSelectedMembers
        }
        error={
          membersError ??
          (
            isMembersError
              ? "Unable to load project members."
              : null
          )
        }
        onClose={
          closeMembersModal
        }
        onAddMember={
          handleAddMember
        }
        onRemoveMember={
          handleRemoveMember
        }
      />

      {/* View project */}
      {viewingProject && (
        <ProjectViewPlaceholder
          project={viewingProject}
          onClose={() =>
            setViewingProject(null)
          }
        />
      )}
    </DashboardLayout>
  );
}

/* -------------------------------------------------------------------------- */
/* Temporary View Placeholder                                                 */
/* -------------------------------------------------------------------------- */

function ProjectViewPlaceholder({
  project,
  onClose,
}: {
  project: Project;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-slate-900/40 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              {project.name}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Project details
            </p>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="rounded-lg px-3 py-2 text-sm text-slate-500 hover:bg-slate-100"
          >
            Close
          </button>
        </div>

        <div className="mt-6 rounded-lg border border-slate-200 bg-slate-50 p-4">
          <p className="text-sm text-slate-600">
            Project details view will be
            implemented in the project
            details workflow.
          </p>
        </div>
      </div>
    </div>
  );
}