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

import ChangeTaskStatusDialog from "@/components/tasks/ChangeTaskStatusDialog";
import DeleteTaskDialog from "@/components/tasks/DeleteTaskDialog";
import TaskFormModal from "@/components/tasks/TaskFormModal";

import { useProjects } from "@/features/projects/hooks/useProjects";

import TasksHeader from "@/features/tasks/components/TasksHeader";
import TasksFilters from "@/features/tasks/components/TasksFilters";
import TasksPagination from "@/features/tasks/components/TasksPagination";
import TasksTable from "@/features/tasks/components/TasksTable";

import { useCurrentUser } from "@/features/auth/hooks/useAuth";
import { authStorage } from "@/features/auth/services/auth-storage";

import { useUsers } from "@/features/users/hooks/useUsers";

import {
  useCreateTask,
  useDeleteTask,
  useTasks,
  useUpdateTask,
  useUpdateTaskStatus,
} from "@/features/tasks/hooks/useTasks";

import type {
  CreateTaskPayload,
  Task,
  TaskPriority,
  TaskStatus,
  UpdateTaskPayload,
} from "@/features/tasks/types/task.types";

/* -------------------------------------------------------------------------- */
/* Constants                                                                  */
/* -------------------------------------------------------------------------- */

const PAGE_SIZE = 10;
const SEARCH_DEBOUNCE_MS = 400;

/* -------------------------------------------------------------------------- */
/* Page                                                                       */
/* -------------------------------------------------------------------------- */

export default function TasksPage() {
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
    data: employeesData,
  } = useUsers({
    limit: 100,
    role: "EMPLOYEE",
    status: "ACTIVE",
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

  const [assignedToId, setAssignedToId] =
    useState("");

  const [priority, setPriority] =
    useState<TaskPriority | "">(
      ""
    );

  const [status, setStatus] =
    useState<TaskStatus | "">(
      ""
    );

  const [isModalOpen, setIsModalOpen] =
    useState(false);

  const [editingTask, setEditingTask] =
    useState<Task | null>(null);

  const [viewingTask, setViewingTask] =
    useState<Task | null>(null);

  const [deleteTask, setDeleteTask] =
    useState<Task | null>(null);

  const [statusTask, setStatusTask] =
    useState<Task | null>(null);

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
  /* Tasks                                                                    */
  /* ------------------------------------------------------------------------ */

  const {
    data,
    isLoading: isTasksLoading,
    isFetching,
    isError: isTasksError,
    refetch,
  } = useTasks({
    page,
    limit: PAGE_SIZE,
    search:
      search || undefined,
    projectId:
      projectId || undefined,
    assignedToId:
      assignedToId ||
      undefined,
    priority:
      priority || undefined,
    status:
      status || undefined,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  /* ------------------------------------------------------------------------ */
  /* Mutations                                                                */
  /* ------------------------------------------------------------------------ */

  const createTask =
    useCreateTask();

  const updateTask =
    useUpdateTask();

  const updateTaskStatus =
    useUpdateTaskStatus();

  const deleteTaskMutation =
    useDeleteTask();

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

    if (
      !authStorage.getToken()
    ) {
      router.replace(
        "/login"
      );
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

    router.replace(
      "/login"
    );
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
        const trimmed =
          searchInput.trim();

        setSearch(
          trimmed
        );

        setPage(1);
      }, SEARCH_DEBOUNCE_MS);

    return () => {
      clearTimeout(
        timeout
      );
    };
  }, [searchInput]);

  /* ------------------------------------------------------------------------ */
  /* Filters                                                                  */
  /* ------------------------------------------------------------------------ */

  const resetFilters =
    () => {
      setProjectId("");
      setAssignedToId("");
      setPriority("");
      setStatus("");
      setSearchInput("");
      setSearch("");
      setPage(1);
    };

  const handleProjectFilterChange =
    (value: string) => {
      setProjectId(
        value
      );
      setPage(1);
    };

  const handleAssigneeFilterChange =
    (value: string) => {
      setAssignedToId(
        value
      );
      setPage(1);
    };

  const handlePriorityChange =
    (
      value:
        | TaskPriority
        | ""
    ) => {
      setPriority(
        value
      );
      setPage(1);
    };

  const handleStatusChange =
    (
      value:
        | TaskStatus
        | ""
    ) => {
      setStatus(
        value
      );
      setPage(1);
    };

  /* ------------------------------------------------------------------------ */
  /* Modal helpers                                                            */
  /* ------------------------------------------------------------------------ */

  const openCreateModal =
    () => {
      setEditingTask(null);
      setFormError(null);
      setIsModalOpen(true);
    };

  const openEditModal =
    (task: Task) => {
      setEditingTask(
        task
      );
      setFormError(null);
      setIsModalOpen(true);
    };

  const closeModal =
    () => {
      if (
        createTask.isPending ||
        updateTask.isPending
      ) {
        return;
      }

      setIsModalOpen(
        false
      );
      setEditingTask(
        null
      );
      setFormError(null);
    };

  /* ------------------------------------------------------------------------ */
  /* View                                                                     */
  /* ------------------------------------------------------------------------ */

  const handleView =
    (task: Task) => {
      setViewingTask(
        task
      );
    };

  /* ------------------------------------------------------------------------ */
  /* Create                                                                   */
  /* ------------------------------------------------------------------------ */

  const handleCreate =
    async (
      payload: CreateTaskPayload
    ) => {
      setFormError(null);

      try {
        const response =
          await createTask.mutateAsync(
            payload
          );

        toast.success(
          response.message ||
            "Task created successfully."
        );

        setIsModalOpen(
          false
        );

        setEditingTask(
          null
        );

        setPage(1);
      } catch (
        error: any
      ) {
        const message =
          error?.response
            ?.data
            ?.message ||
          "Failed to create task. Please try again.";

        setFormError(
          message
        );

        toast.error(
          message
        );

        throw error;
      }
    };

  /* ------------------------------------------------------------------------ */
  /* Update                                                                   */
  /* ------------------------------------------------------------------------ */

  const handleUpdate =
    async (
      payload: UpdateTaskPayload
    ) => {
      if (!editingTask) {
        return;
      }

      setFormError(null);

      try {
        const response =
          await updateTask.mutateAsync(
            {
              id: editingTask.id,
              data: payload,
            }
          );

        toast.success(
          response.message ||
            "Task updated successfully."
        );

        setIsModalOpen(
          false
        );

        setEditingTask(
          null
        );
      } catch (
        error: any
      ) {
        const message =
          error?.response
            ?.data
            ?.message ||
          "Failed to update task. Please try again.";

        setFormError(
          message
        );

        toast.error(
          message
        );

        throw error;
      }
    };

  /* ------------------------------------------------------------------------ */
  /* Change Status                                                            */
  /* ------------------------------------------------------------------------ */

  const handleChangeStatus =
    async (
      nextStatus: TaskStatus
    ) => {
      if (!statusTask) {
        return;
      }

      try {
        const response =
          await updateTaskStatus.mutateAsync(
            {
              id: statusTask.id,
              data: {
                status:
                  nextStatus,
              },
            }
          );

        toast.success(
          response.message ||
            "Task status updated successfully."
        );

        setStatusTask(
          null
        );
      } catch (
        error: any
      ) {
        const message =
          error?.response
            ?.data
            ?.message ||
          "Failed to update task status. Please try again.";

        toast.error(
          message
        );
      }
    };

  /* ------------------------------------------------------------------------ */
  /* Delete                                                                   */
  /* ------------------------------------------------------------------------ */

  const handleDelete =
    async () => {
      if (!deleteTask) {
        return;
      }

      try {
        const response =
          await deleteTaskMutation.mutateAsync(
            deleteTask.id
          );

        toast.success(
          response.message ||
            "Task deleted successfully."
        );

        setDeleteTask(
          null
        );

        if (
          data?.data
            .length ===
            1 &&
          page > 1
        ) {
          setPage(
            (
              previous
            ) =>
              previous - 1
          );
        }
      } catch (
        error: any
      ) {
        const message =
          error?.response
            ?.data
            ?.message ||
          "Failed to delete task. Please try again.";

        toast.error(
          message
        );

        setDeleteTask(
          null
        );
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
          Loading tasks...
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

  const canManageTasks =
    user.role ===
      "SUPER_ADMIN" ||
    user.role ===
      "PROJECT_MANAGER" ||
    user.role ===
      "EMPLOYEE";

  if (!canManageTasks) {
    return (
      <DashboardLayout
        user={user}
      >
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="max-w-md rounded-xl border border-red-200 bg-red-50 p-6 text-center">
            <AlertCircle className="mx-auto h-8 w-8 text-red-500" />

            <h2 className="mt-3 text-lg font-semibold text-red-700">
              Access Denied
            </h2>

            <p className="mt-1 text-sm text-red-600">
              You do not have permission to access tasks.
            </p>
          </div>
        </div>
      </DashboardLayout>
    );
  }

  /* ------------------------------------------------------------------------ */
  /* Tasks loading                                                            */
  /* ------------------------------------------------------------------------ */

  const showInitialLoading =
    isTasksLoading &&
    !data;

  if (
    showInitialLoading
  ) {
    return (
      <DashboardLayout
        user={user}
      >
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="flex items-center gap-2 text-sm text-slate-600">
            <Loader2 className="h-5 w-5 animate-spin" />
            Loading tasks...
          </div>
        </div>
      </DashboardLayout>
    );
  }

  /* ------------------------------------------------------------------------ */
  /* Tasks error                                                              */
  /* ------------------------------------------------------------------------ */

  if (
    isTasksError ||
    !data
  ) {
    return (
      <DashboardLayout
        user={user}
      >
        <div className="flex min-h-[60vh] items-center justify-center">
          <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
            <AlertCircle className="mx-auto h-8 w-8 text-red-500" />

            <h2 className="mt-3 text-lg font-semibold text-red-700">
              Unable to load tasks
            </h2>

            <p className="mt-1 text-sm text-red-600">
              Something went wrong while loading tasks.
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

  const tasks =
    data.data;

  const meta =
    data.meta;

  const projects =
    projectsData?.data ??
    [];

  const employees =
    employeesData?.users ??
    [];

  /* ------------------------------------------------------------------------ */
  /* Role permissions                                                         */
  /* ------------------------------------------------------------------------ */

  const canCreateTask =
    user.role ===
      "SUPER_ADMIN" ||
    user.role ===
      "PROJECT_MANAGER";

  const canEditTask =
    (
      task: Task
    ) =>
      (
        user.role ===
          "SUPER_ADMIN" ||
        (
          user.role ===
            "PROJECT_MANAGER" &&
          task.project
            .managerId ===
            user.id
        )
      ) &&
      task.status !==
        "COMPLETED";

  const canDeleteTask =
    (
      task: Task
    ) =>
      (
        user.role ===
          "SUPER_ADMIN" ||
        (
          user.role ===
            "PROJECT_MANAGER" &&
          task.project
            .managerId ===
            user.id
        )
      ) &&
      task.status !==
        "COMPLETED";

  const canChangeTaskStatus =
    (
      task: Task
    ) => {
      if (
        task.status ===
        "COMPLETED"
      ) {
        return false;
      }

      if (
        user.role ===
          "SUPER_ADMIN"
      ) {
        return true;
      }

      if (
        user.role ===
        "PROJECT_MANAGER"
      ) {
        return (
          task.project
            .managerId ===
          user.id
        );
      }

      if (
        user.role ===
        "EMPLOYEE"
      ) {
        return (
          task.assignedTo.id ===
          user.id
        );
      }

      return false;
    };

  const canCompleteTask =
    Boolean(
      statusTask &&
        (
          user.role ===
            "SUPER_ADMIN" ||
          (
            user.role ===
              "PROJECT_MANAGER" &&
            statusTask.project
              .managerId ===
              user.id
          )
        )
    );

  /* ------------------------------------------------------------------------ */
  /* Render                                                                   */
  /* ------------------------------------------------------------------------ */

  return (
    <DashboardLayout
      user={user}
    >
      <div className="mx-auto max-w-7xl space-y-6">
        <TasksHeader
          search={
            searchInput
          }
          onSearchChange={
            setSearchInput
          }
          onCreate={
            openCreateModal
          }
        />

        <TasksFilters
          projects={
            projects
          }
          users={
            employees
          }
          projectId={
            projectId
          }
          assignedToId={
            assignedToId
          }
          priority={
            priority
          }
          status={
            status
          }
          onProjectChange={
            handleProjectFilterChange
          }
          onAssigneeChange={
            handleAssigneeFilterChange
          }
          onPriorityChange={
            handlePriorityChange
          }
          onStatusChange={
            handleStatusChange
          }
          onReset={
            resetFilters
          }
        />

        <TasksTable
          tasks={tasks}
          search={search}
          isFetching={
            isFetching
          }
          canEdit={
            canEditTask
          }
          canDelete={
            canDeleteTask
          }
          canChangeStatus={
            canChangeTaskStatus
          }
          onView={
            handleView
          }
          onEdit={
            openEditModal
          }
          onDelete={
            setDeleteTask
          }
          onChangeStatus={
            setStatusTask
          }
        />

        <TasksPagination
          page={
            meta.page
          }
          totalPages={
            meta.totalPages
          }
          isFetching={
            isFetching
          }
          onPageChange={
            setPage
          }
        />
      </div>

      {/* Create / Edit */}
      {canCreateTask && (
        <TaskFormModal
          open={
            isModalOpen
          }
          task={
            editingTask
          }
          projects={
            projects
          }
          error={
            formError
          }
          isSubmitting={
            createTask.isPending ||
            updateTask.isPending
          }
          onClose={
            closeModal
          }
          onCreate={
            handleCreate
          }
          onUpdate={
            handleUpdate
          }
        />
      )}

      {/* Status */}
      <ChangeTaskStatusDialog
        task={
          statusTask
        }
        isUpdating={
          updateTaskStatus.isPending
        }
        canComplete={
          canCompleteTask
        }
        onCancel={() =>
          setStatusTask(
            null
          )
        }
        onConfirm={
          handleChangeStatus
        }
      />

      {/* Delete */}
      <DeleteTaskDialog
        task={
          deleteTask
        }
        isDeleting={
          deleteTaskMutation.isPending
        }
        onCancel={() =>
          setDeleteTask(
            null
          )
        }
        onConfirm={
          handleDelete
        }
      />

      {/* Temporary view */}
      {viewingTask && (
        <TaskViewPlaceholder
          task={
            viewingTask
          }
          onClose={() =>
            setViewingTask(
              null
            )
          }
        />
      )}
    </DashboardLayout>
  );
}

/* -------------------------------------------------------------------------- */
/* Temporary Task View                                                        */
/* -------------------------------------------------------------------------- */

function TaskViewPlaceholder({
  task,
  onClose,
}: {
  task: Task;
  onClose: () => void;
}) {
  return (
    <div className="fixed inset-0 z-[110] flex items-center justify-center bg-slate-900/40 p-4">
      <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-slate-900">
              {task.title}
            </h2>

            <p className="mt-1 text-sm text-slate-500">
              Task details
            </p>
          </div>

          <button
            type="button"
            onClick={
              onClose
            }
            className="rounded-lg px-3 py-2 text-sm text-slate-500 hover:bg-slate-100"
          >
            Close
          </button>
        </div>

        <div className="mt-6 space-y-4">
          <div className="rounded-lg border border-slate-200 bg-slate-50 p-4">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Description
            </p>

            <p className="mt-1 text-sm text-slate-700">
              {task.description ||
                "No description provided."}
            </p>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div className="rounded-lg border border-slate-200 p-3">
              <p className="text-xs text-slate-400">
                Project
              </p>

              <p className="mt-1 truncate text-sm font-medium text-slate-800">
                {
                  task.project
                    .name
                }
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 p-3">
              <p className="text-xs text-slate-400">
                Assignee
              </p>

              <p className="mt-1 truncate text-sm font-medium text-slate-800">
                {
                  task
                    .assignedTo
                    .firstName
                }{" "}
                {
                  task
                    .assignedTo
                    .lastName
                }
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}