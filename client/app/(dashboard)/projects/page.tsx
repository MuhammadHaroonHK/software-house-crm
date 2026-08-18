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

import { useClients } from "@/features/clients/hooks/useClients";
import { useUsers } from "@/features/users/hooks/useUsers";

import ProjectFormModal from "@/components/projects/ProjectFormModal";
import DeleteProjectDialog from "@/components/projects/DeleteProjectDialog";

import ProjectsHeader from "@/features/projects/components/ProjectsHeader";
import ProjectsTable from "@/features/projects/components/ProjectsTable";
import ProjectsPagination from "@/features/projects/components/ProjectsPagination";

import { useCurrentUser } from "@/features/auth/hooks/useAuth";
import { authStorage } from "@/features/auth/services/auth-storage";

import {
  useProjects,
  useCreateProject,
  useUpdateProject,
  useDeleteProject,
} from "@/features/projects/hooks/useProjects";

import type {
  Project,
  CreateProjectPayload,
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

  const {
  data: clientsData,
  isLoading: isClientsLoading,
} = useClients({
  limit: 100,
});

const {
  data: usersData,
  isLoading: isUsersLoading,
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

  const [isModalOpen, setIsModalOpen] =
    useState(false);

  const [editingProject, setEditingProject] =
    useState<Project | null>(null);

  const [viewingProject, setViewingProject] =
    useState<Project | null>(null);

  const [deleteProject, setDeleteProject] =
    useState<Project | null>(null);

  const [formError, setFormError] =
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

  const createProject =
    useCreateProject();

  const updateProject =
    useUpdateProject();

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
  }, [mounted, router]);

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

      /*
       * If the deleted project was the last
       * item on the current page, move back one page.
       */
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

  const clients = clientsData?.data ?? [];

  const managers = usersData?.users ?? [];

  /* ------------------------------------------------------------------------ */
  /* Render                                                                   */
  /* ------------------------------------------------------------------------ */

  return (
    <DashboardLayout user={user}>
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header + Search */}
        <ProjectsHeader
          search={searchInput}
          onSearchChange={
            setSearchInput
          }
          onCreate={
            openCreateModal
          }
        />

        {/* Projects table */}
        <ProjectsTable
          projects={projects}
          search={search}
          isFetching={isFetching}
          canEdit={true}
          canDelete={
            user.role ===
            "SUPER_ADMIN"
          }
          onView={handleView}
          onEdit={openEditModal}
          onDelete={setDeleteProject}
        />

        {/* Pagination */}
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