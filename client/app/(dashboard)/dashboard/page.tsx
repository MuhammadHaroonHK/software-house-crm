"use client";

import { useEffect, useMemo, useState } from "react";

import {
  AlertCircle,
  ArrowDownRight,
  ArrowUpRight,
  Banknote,
  CalendarDays,
  CheckCircle2,
  Clock3,
  CreditCard,
  FileText,
  FolderKanban,
  Loader2,
  Receipt,
  Target,
  Users,
  WalletCards,
} from "lucide-react";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { useRouter } from "next/navigation";

import DashboardLayout from "@/components/dashboard/DashboardLayout";

import { useCurrentUser } from "@/features/auth/hooks/useAuth";

import { authStorage } from "@/features/auth/services/auth-storage";

import { useProjects } from "@/features/projects/hooks/useProjects";

import { useTasks } from "@/features/tasks/hooks/useTasks";

import { useMeetings } from "@/features/meetings/hooks/useMeetings";

import { useQuotations } from "@/features/quotations/hooks/useQuotations";

import { useInvoices } from "@/features/invoices/hooks/useInvoices";

import { usePayments } from "@/features/payments/hooks/usePayments";

import { useClients } from "@/features/clients/hooks/useClients";

import type { ProjectStatus } from "@/features/projects/types/project.types";

import type { Meeting } from "@/features/meetings/types/meeting.types";

import type { QuotationStatus } from "@/features/quotations/types/quotation.types";

import type {
  Project,
} from "@/features/projects/types/project.types";

import type {
  Task,
  TaskPriority,
  TaskStatus,
} from "@/features/tasks/types/task.types";

import type {
  Payment,
  PaymentStatus,
} from "@/features/payments/types/payment.types";

import type {
  Invoice,
  InvoiceStatus,
} from "@/features/invoices/types/invoice.types";

const DATA_LIMIT = 100;

/* -------------------------------------------------------------------------- */
/* Types                                                                      */
/* -------------------------------------------------------------------------- */

type DashboardRole = "SUPER_ADMIN" | "PROJECT_MANAGER" | "EMPLOYEE" | "CLIENT";

/* -------------------------------------------------------------------------- */
/* Page                                                                       */
/* -------------------------------------------------------------------------- */

export default function DashboardPage() {
  const router = useRouter();

  const [mounted, setMounted] = useState(false);

  const {
    data: user,
    isLoading: isUserLoading,
    isError: isUserError,
  } = useCurrentUser();

  const role = user?.role as DashboardRole | undefined;

  const isAdmin = role === "SUPER_ADMIN";

  const isProjectManager = role === "PROJECT_MANAGER";

  const isEmployee = role === "EMPLOYEE";

  const isClient = role === "CLIENT";

  const isManagement = isAdmin || isProjectManager;

  const canViewProjects = isManagement;

  const canViewTasks = isManagement || isEmployee;

  const canViewMeetings = isManagement || isEmployee;

  const canViewQuotations = isManagement || isClient;

  const canViewInvoices = isManagement || isClient;

  const canViewPayments = true;

  const canViewClients = isManagement;

  /* ------------------------------------------------------------------------ */
  /* Queries                                                                  */
  /* ------------------------------------------------------------------------ */

  const projectsQuery = useProjects(
    {
      page: 1,
      limit: DATA_LIMIT,
      sortBy: "createdAt",
      sortOrder: "desc",
    },
    {
      enabled: mounted && canViewProjects,
    },
  );

  const tasksQuery = useTasks(
    {
      page: 1,
      limit: DATA_LIMIT,
      sortBy: "createdAt",
      sortOrder: "desc",
    },
    {
      enabled: mounted && canViewTasks,
    },
  );

  const meetingsQuery = useMeetings(
    {
      page: 1,
      limit: DATA_LIMIT,
      sortBy: "meetingDate",
      sortOrder: "asc",
    },
    {
      enabled: mounted && canViewMeetings,
    },
  );

  const quotationsQuery = useQuotations({
    page: 1,
    limit: DATA_LIMIT,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const invoicesQuery = useInvoices({
    page: 1,
    limit: DATA_LIMIT,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const paymentsQuery = usePayments({
    page: 1,
    limit: DATA_LIMIT,
    sortBy: "createdAt",
    sortOrder: "desc",
  });

  const clientsQuery = useClients(
    {
      page: 1,
      limit: 1,
      sortBy: "createdAt",
      sortOrder: "desc",
    },
    {
      enabled: mounted && canViewClients,
    },
  );

  /* ------------------------------------------------------------------------ */
  /* Mount / auth                                                             */
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
  /* Data                                                                     */
  /* ------------------------------------------------------------------------ */

  const projects = projectsQuery.data?.data ?? [];

  const tasks = tasksQuery.data?.data ?? [];

  const meetings = meetingsQuery.data?.data ?? [];

  const quotations = quotationsQuery.data?.data ?? [];

  const invoices = invoicesQuery.data?.data ?? [];

  const payments = paymentsQuery.data?.data ?? [];

  const clientsTotal = clientsQuery.data?.meta?.total ?? 0;

  /* ------------------------------------------------------------------------ */
  /* Global loading                                                           */
  /* ------------------------------------------------------------------------ */

  const activeQueries = [
    canViewProjects ? projectsQuery : null,
    canViewTasks ? tasksQuery : null,
    canViewMeetings ? meetingsQuery : null,
    canViewQuotations ? quotationsQuery : null,
    canViewInvoices ? invoicesQuery : null,
    canViewPayments ? paymentsQuery : null,
    canViewClients ? clientsQuery : null,
  ].filter(Boolean);

  const isDashboardLoading = activeQueries.some((query) => query?.isLoading);

  /* ------------------------------------------------------------------------ */
  /* Project analytics                                                        */
  /* ------------------------------------------------------------------------ */

  const projectStatusData = useMemo(
    () =>
      buildStatusData(
        projects.map((project) => project.status),
        [
          "PLANNING",
          "IN_PROGRESS",
          "ON_HOLD",
          "COMPLETED",
          "CANCELLED",
        ] satisfies ProjectStatus[],
      ),
    [projects],
  );

  const activeProjects = projects.filter(
    (project) =>
      project.status === "IN_PROGRESS" || project.status === "PLANNING",
  ).length;

  const completedProjects = projects.filter(
    (project) => project.status === "COMPLETED",
  ).length;

  /* ------------------------------------------------------------------------ */
  /* Task analytics                                                           */
  /* ------------------------------------------------------------------------ */

  const taskStatusData = useMemo(
    () =>
      buildStatusData(
        tasks.map((task) => task.status),
        [
          "TODO",
          "IN_PROGRESS",
          "IN_REVIEW",
          "COMPLETED",
        ] satisfies TaskStatus[],
      ),
    [tasks],
  );

  const activeTasks = tasks.filter(
    (task) => task.status !== "COMPLETED",
  ).length;

  const completedTasks = tasks.filter(
    (task) => task.status === "COMPLETED",
  ).length;

  const urgentTasks = tasks.filter(
    (task) => task.priority === "URGENT" && task.status !== "COMPLETED",
  ).length;

  /* ------------------------------------------------------------------------ */
  /* Meeting analytics                                                        */
  /* ------------------------------------------------------------------------ */

  const upcomingMeetings = useMemo(() => {
    const now = new Date();

    return meetings
      .filter(
        (meeting) =>
          meeting.status === "SCHEDULED" &&
          new Date(meeting.meetingDate) >= now,
      )
      .sort(
        (a, b) =>
          new Date(a.meetingDate).getTime() - new Date(b.meetingDate).getTime(),
      )
      .slice(0, 5);
  }, [meetings]);

  const meetingsThisWeek = useMemo(() => {
    const now = new Date();

    const start = startOfWeek(now);

    const end = endOfWeek(now);

    return meetings.filter((meeting) => {
      const date = new Date(meeting.meetingDate);

      return meeting.status === "SCHEDULED" && date >= start && date <= end;
    }).length;
  }, [meetings]);

  /* ------------------------------------------------------------------------ */
  /* Quotation analytics                                                      */
  /* ------------------------------------------------------------------------ */

  const quotationStatusData = useMemo(
    () =>
      buildStatusData(
        quotations.map((quotation) => quotation.status),
        [
          "DRAFT",
          "SENT",
          "ACCEPTED",
          "REJECTED",
          "EXPIRED",
        ] satisfies QuotationStatus[],
      ),
    [quotations],
  );

  const pendingQuotations = quotations.filter(
    (quotation) => quotation.status === "SENT",
  ).length;

  const acceptedQuotations = quotations.filter(
    (quotation) => quotation.status === "ACCEPTED",
  ).length;

  /* ------------------------------------------------------------------------ */
  /* Invoice analytics                                                        */
  /* ------------------------------------------------------------------------ */

  const invoiceStatusData = useMemo(
    () =>
      buildStatusData(
        invoices.map((invoice) => invoice.status),
        [
          "DRAFT",
          "SENT",
          "PARTIALLY_PAID",
          "PAID",
          "OVERDUE",
        ] satisfies InvoiceStatus[],
      ),
    [invoices],
  );

  const pendingInvoices = invoices.filter(
    (invoice) =>
      invoice.status === "SENT" ||
      invoice.status === "PARTIALLY_PAID" ||
      invoice.status === "OVERDUE",
  ).length;

  const outstandingAmount = invoices.reduce(
    (total, invoice) => total + Number(invoice.balanceDue),
    0,
  );

  const totalInvoiceValue = invoices.reduce(
    (total, invoice) => total + Number(invoice.totalAmount),
    0,
  );

  const totalPaid = invoices.reduce(
    (total, invoice) => total + Number(invoice.amountPaid),
    0,
  );

  /* ------------------------------------------------------------------------ */
  /* Payment analytics                                                        */
  /* ------------------------------------------------------------------------ */

  const pendingPayments = payments.filter(
    (payment) => payment.status === "PENDING",
  ).length;

  const completedPayments = payments.filter(
    (payment) => payment.status === "COMPLETED",
  ).length;

  const totalPaymentValue = payments
    .filter((payment) => payment.status === "COMPLETED")
    .reduce((total, payment) => total + Number(payment.amount), 0);

  /* ------------------------------------------------------------------------ */
  /* Client-specific analytics                                               */
  /* ------------------------------------------------------------------------ */

  const clientOutstanding = invoices.reduce(
    (total, invoice) => total + Number(invoice.balanceDue),
    0,
  );

  const clientPaid = invoices.reduce(
    (total, invoice) => total + Number(invoice.amountPaid),
    0,
  );

  const clientProjectCount = new Set(
    payments
      .map((payment) => payment.invoice?.quotation?.project?.id)
      .filter(Boolean),
  ).size;

  /* ------------------------------------------------------------------------ */
  /* Recent data                                                              */
  /* ------------------------------------------------------------------------ */

  const recentProjects = projects.slice(0, 5);

  const recentPayments = payments.slice(0, 5);

  const recentTasks = tasks
    .filter((task) => task.status !== "COMPLETED")
    .slice(0, 5);

  /* ------------------------------------------------------------------------ */
  /* Financial chart                                                          */
  /* ------------------------------------------------------------------------ */

  const financialData = [
    {
      name: "Invoice Value",
      amount: totalInvoiceValue,
    },
    {
      name: "Paid",
      amount: totalPaid,
    },
    {
      name: "Outstanding",
      amount: outstandingAmount,
    },
  ];

  /* ------------------------------------------------------------------------ */
  /* Initial loading                                                          */
  /* ------------------------------------------------------------------------ */

  if (!mounted) {
    return <DashboardLoading text="Loading dashboard..." />;
  }

  if (isUserLoading || !user) {
    return <DashboardLoading text="Loading..." />;
  }

  if (isDashboardLoading) {
    return (
      <DashboardLayout user={user}>
        <DashboardLoadingContent />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout user={user}>
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div>
          <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <p className="text-sm font-medium text-slate-500">
                {getGreeting()}
              </p>

              <h1 className="mt-1 text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                {user.firstName} {user.lastName}
              </h1>

              <p className="mt-2 max-w-2xl text-sm text-slate-500">
                Here is your current CRM overview and operational progress.
              </p>
            </div>

            <div className="rounded-lg border border-slate-200 bg-white px-4 py-3 text-right shadow-sm">
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Current role
              </p>

              <p className="mt-1 text-sm font-semibold text-slate-800">
                {formatRole(user.role)}
              </p>
            </div>
          </div>
        </div>

        {/* Management dashboard */}
        {isManagement && (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                title="Total Clients"
                value={clientsTotal}
                description="Registered clients"
                icon={Users}
              />

              <StatCard
                title="Active Projects"
                value={activeProjects}
                description={`${completedProjects} completed`}
                icon={FolderKanban}
              />

              <StatCard
                title="Open Tasks"
                value={activeTasks}
                description={`${urgentTasks} urgent`}
                icon={Target}
              />

              <StatCard
                title="Outstanding"
                value={formatCurrency(outstandingAmount)}
                description={`${pendingInvoices} invoices needing attention`}
                icon={WalletCards}
              />
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
              <ChartCard
                title="Project Status"
                description="Current project distribution"
              >
                <StatusPieChart data={projectStatusData} />
              </ChartCard>

              <ChartCard
                title="Task Progress"
                description="Current task distribution"
              >
                <StatusBarChart data={taskStatusData} />
              </ChartCard>
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
              <ChartCard
                title="Quotation Pipeline"
                description="Quotation lifecycle overview"
              >
                <StatusBarChart data={quotationStatusData} horizontal />
              </ChartCard>

              <ChartCard
                title="Invoice Status"
                description="Current invoice portfolio"
              >
                <StatusBarChart data={invoiceStatusData} horizontal />
              </ChartCard>
            </div>

            <ChartCard
              title="Financial Overview"
              description="Invoice value versus paid and outstanding amounts"
            >
              <FinancialChart data={financialData} />
            </ChartCard>

            <div className="grid gap-6 xl:grid-cols-2">
              <RecentProjectsCard projects={recentProjects} />

              <UpcomingMeetingsCard meetings={upcomingMeetings} />
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
              <RecentPaymentsCard payments={recentPayments} />

              <RecentTasksCard tasks={recentTasks} />
            </div>
          </>
        )}

        {/* Employee dashboard */}
        {isEmployee && (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                title="Active Tasks"
                value={activeTasks}
                description="Assigned work still open"
                icon={Target}
              />

              <StatCard
                title="Completed Tasks"
                value={completedTasks}
                description="Completed assignments"
                icon={CheckCircle2}
              />

              <StatCard
                title="Urgent Tasks"
                value={urgentTasks}
                description="Needs immediate attention"
                icon={AlertCircle}
              />

              <StatCard
                title="Meetings This Week"
                value={meetingsThisWeek}
                description="Scheduled meetings"
                icon={CalendarDays}
              />
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
              <ChartCard
                title="My Task Progress"
                description="Current task status distribution"
              >
                <StatusPieChart data={taskStatusData} />
              </ChartCard>

              <UpcomingMeetingsCard meetings={upcomingMeetings} />
            </div>

            <RecentTasksCard tasks={recentTasks} />

            <RecentPaymentsCard payments={recentPayments} />
          </>
        )}

        {/* Client dashboard */}
        {isClient && (
          <>
            <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
              <StatCard
                title="My Invoices"
                value={invoices.length}
                description={`${pendingInvoices} currently open`}
                icon={Receipt}
              />

              <StatCard
                title="Outstanding"
                value={formatCurrency(clientOutstanding)}
                description="Current amount due"
                icon={WalletCards}
              />

              <StatCard
                title="Paid"
                value={formatCurrency(clientPaid)}
                description="Recorded paid amount"
                icon={CheckCircle2}
              />

              <StatCard
                title="Pending Payments"
                value={pendingPayments}
                description="Awaiting verification"
                icon={Clock3}
              />
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
              <ChartCard
                title="My Invoice Status"
                description="Your current invoice portfolio"
              >
                <StatusPieChart data={invoiceStatusData} />
              </ChartCard>

              <ClientFinancialCard
                outstanding={clientOutstanding}
                paid={clientPaid}
                total={clientPaid + clientOutstanding}
              />
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
              <RecentPaymentsCard payments={recentPayments} />

              <RecentInvoicesCard invoices={invoices} />
            </div>

            <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
              <div className="flex items-start gap-3">
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
                  <FileText className="h-5 w-5 text-slate-600" />
                </div>

                <div>
                  <h2 className="text-base font-semibold text-slate-900">
                    Quotation Overview
                  </h2>

                  <p className="mt-1 text-sm text-slate-500">
                    {pendingQuotations > 0
                      ? `You have ${pendingQuotations} quotation${pendingQuotations === 1 ? "" : "s"} awaiting your response.`
                      : acceptedQuotations > 0
                        ? `${acceptedQuotations} quotation${acceptedQuotations === 1 ? "" : "s"} accepted.`
                        : "No quotation requires your immediate attention."}
                  </p>
                </div>
              </div>

              <div className="mt-5 grid gap-3 sm:grid-cols-3">
                <MiniMetric label="Total" value={quotations.length} />

                <MiniMetric
                  label="Awaiting Response"
                  value={pendingQuotations}
                />

                <MiniMetric label="Accepted" value={acceptedQuotations} />
              </div>
            </div>

            {clientProjectCount > 0 && (
              <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-3">
                  <FolderKanban className="h-5 w-5 text-slate-500" />

                  <div>
                    <h2 className="text-base font-semibold text-slate-900">
                      Active Project References
                    </h2>

                    <p className="mt-1 text-sm text-slate-500">
                      Your invoices currently reference{" "}
                      <span className="font-semibold text-slate-700">
                        {clientProjectCount}
                      </span>{" "}
                      project
                      {clientProjectCount === 1 ? "" : "s"}.
                    </p>
                  </div>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </DashboardLayout>
  );
}

/* -------------------------------------------------------------------------- */
/* Stat Card                                                                  */
/* -------------------------------------------------------------------------- */

function StatCard({
  title,
  value,
  description,
  icon: Icon,
}: {
  title: string;
  value: string | number;
  description: string;
  icon: React.ElementType;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-sm font-medium text-slate-500">{title}</p>

          <p className="mt-2 text-2xl font-bold tracking-tight text-slate-900">
            {value}
          </p>
        </div>

        <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-slate-100">
          <Icon className="h-5 w-5 text-slate-600" />
        </div>
      </div>

      <p className="mt-3 text-xs text-slate-400">{description}</p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Chart Card                                                                 */
/* -------------------------------------------------------------------------- */

function ChartCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <div>
        <h2 className="text-base font-semibold text-slate-900">{title}</h2>

        <p className="mt-1 text-sm text-slate-500">{description}</p>
      </div>

      <div className="mt-5 h-[300px]">{children}</div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Pie Chart                                                                  */
/* -------------------------------------------------------------------------- */

function StatusPieChart({ data }: { data: ChartData[] }) {
  const visibleData = data.filter((item) => item.value > 0);

  if (visibleData.length === 0) {
    return <EmptyChartState text="No data available yet." />;
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <PieChart>
        <Pie
          data={visibleData}
          dataKey="value"
          nameKey="name"
          cx="50%"
          cy="50%"
          outerRadius={95}
          innerRadius={55}
          paddingAngle={3}
        >
          {visibleData.map((entry, index) => (
            <Cell
              key={`${entry.name}-${index}`}
              fill={chartColors[index % chartColors.length]}
            />
          ))}
        </Pie>

        <Tooltip />

        <Legend />
      </PieChart>
    </ResponsiveContainer>
  );
}

/* -------------------------------------------------------------------------- */
/* Bar Chart                                                                  */
/* -------------------------------------------------------------------------- */

function StatusBarChart({
  data,
  horizontal = false,
}: {
  data: ChartData[];
  horizontal?: boolean;
}) {
  if (data.length === 0) {
    return <EmptyChartState text="No data available yet." />;
  }

  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        layout={horizontal ? "vertical" : "horizontal"}
        margin={{
          top: 10,
          right: 20,
          left: 10,
          bottom: 10,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />

        {horizontal ? (
          <>
            <XAxis type="number" allowDecimals={false} />

            <YAxis dataKey="name" type="category" width={100} />
          </>
        ) : (
          <>
            <XAxis dataKey="name" angle={-15} textAnchor="end" height={60} />

            <YAxis allowDecimals={false} />
          </>
        )}

        <Tooltip />

        <Bar dataKey="value" radius={horizontal ? [0, 5, 5, 0] : [5, 5, 0, 0]}>
          {data.map((entry, index) => (
            <Cell
              key={`${entry.name}-${index}`}
              fill={chartColors[index % chartColors.length]}
            />
          ))}
        </Bar>
      </BarChart>
    </ResponsiveContainer>
  );
}

/* -------------------------------------------------------------------------- */
/* Financial Chart                                                            */
/* -------------------------------------------------------------------------- */

function FinancialChart({
  data,
}: {
  data: {
    name: string;
    amount: number;
  }[];
}) {
  return (
    <ResponsiveContainer width="100%" height="100%">
      <BarChart
        data={data}
        margin={{
          top: 10,
          right: 20,
          left: 10,
          bottom: 10,
        }}
      >
        <CartesianGrid strokeDasharray="3 3" />

        <XAxis dataKey="name" />

        <YAxis tickFormatter={(value) => formatCompactCurrency(value)} />

        <Tooltip formatter={(value) => formatCurrency(Number(value))} />

        <Legend />

        <Bar
          dataKey="amount"
          name="Amount"
          radius={[5, 5, 0, 0]}
          fill="#334155"
        />
      </BarChart>
    </ResponsiveContainer>
  );
}

/* -------------------------------------------------------------------------- */
/* Recent Projects                                                            */
/* -------------------------------------------------------------------------- */

function RecentProjectsCard({
  projects,
}: {
  projects: Project[];
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <SectionHeader
        icon={FolderKanban}
        title="Recent Projects"
        description="Latest project activity"
      />

      <div className="divide-y divide-slate-100">
        {projects.length === 0 ? (
          <EmptyList text="No projects available." />
        ) : (
          projects.map((project) => (
            <div
              key={project.id}
              className="flex items-center justify-between gap-4 px-5 py-4"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-900">
                  {project.name}
                </p>

                <p className="mt-1 truncate text-xs text-slate-400">
                  {project.client?.companyName ?? "No client"}
                </p>
              </div>

              <StatusPill status={project.status} />
            </div>
          ))
        )}
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Upcoming meetings                                                         */
/* -------------------------------------------------------------------------- */

function UpcomingMeetingsCard({ meetings }: { meetings: Meeting[] }) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <SectionHeader
        icon={CalendarDays}
        title="Upcoming Meetings"
        description="Your next scheduled meetings"
      />

      <div className="divide-y divide-slate-100">
        {meetings.length === 0 ? (
          <EmptyList text="No upcoming meetings." />
        ) : (
          meetings.map((meeting) => (
            <div key={meeting.id} className="flex items-start gap-3 px-5 py-4">
              <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100">
                <CalendarDays className="h-4 w-4 text-slate-600" />
              </div>

              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-900">
                  {meeting.title}
                </p>

                <p className="mt-1 text-xs text-slate-400">
                  {formatDateTime(meeting.meetingDate)}
                </p>

                <p className="mt-1 truncate text-xs text-slate-500">
                  {meeting.project?.name ?? "Project"}
                </p>
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Recent Payments                                                            */
/* -------------------------------------------------------------------------- */

function RecentPaymentsCard({
  payments,
}: {
  payments: Payment[];
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <SectionHeader
        icon={Banknote}
        title="Recent Payments"
        description="Latest payment records"
      />

      <div className="divide-y divide-slate-100">
        {payments.length === 0 ? (
          <EmptyList text="No payment records available." />
        ) : (
          payments.map((payment) => (
            <div
              key={payment.id}
              className="flex items-center justify-between gap-4 px-5 py-4"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-900">
                  {payment.invoice?.invoiceNumber ?? "Invoice"}
                </p>

                <p className="mt-1 truncate text-xs text-slate-400">
                  {payment.invoice?.quotation?.client?.companyName ?? "Client"}
                </p>
              </div>

              <div className="text-right">
                <p className="text-sm font-semibold text-slate-900">
                  {formatCurrency(payment.amount)}
                </p>

                <PaymentStatusPill status={payment.status} />
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Recent Tasks                                                               */
/* -------------------------------------------------------------------------- */

function RecentTasksCard({
  tasks,
}: {
  tasks: Task[];
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <SectionHeader
        icon={Target}
        title="Open Tasks"
        description="Tasks still requiring attention"
      />

      <div className="divide-y divide-slate-100">
        {tasks.length === 0 ? (
          <EmptyList text="No open tasks." />
        ) : (
          tasks.map((task) => (
            <div
              key={task.id}
              className="flex items-center justify-between gap-4 px-5 py-4"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-900">
                  {task.title}
                </p>

                <p className="mt-1 truncate text-xs text-slate-400">
                  {task.project?.name ?? "Project"}
                </p>
              </div>

              <div className="flex shrink-0 items-center gap-2">
                <PriorityPill priority={task.priority} />

                <StatusPill status={task.status} />
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Recent Invoices                                                            */
/* -------------------------------------------------------------------------- */

function RecentInvoicesCard({
  invoices,
}: {
  invoices: Invoice[];
}) {
  return (
    <section className="rounded-xl border border-slate-200 bg-white shadow-sm">
      <SectionHeader
        icon={Receipt}
        title="Recent Invoices"
        description="Latest invoices"
      />

      <div className="divide-y divide-slate-100">
        {invoices.length === 0 ? (
          <EmptyList text="No invoices available." />
        ) : (
          invoices.slice(0, 5).map((invoice) => (
            <div
              key={invoice.id}
              className="flex items-center justify-between gap-4 px-5 py-4"
            >
              <div className="min-w-0">
                <p className="truncate text-sm font-medium text-slate-900">
                  {invoice.invoiceNumber}
                </p>

                <p className="mt-1 truncate text-xs text-slate-400">
                  {formatDate(invoice.issueDate)}
                </p>
              </div>

              <div className="text-right">
                <p className="text-sm font-semibold text-slate-900">
                  {formatCurrency(invoice.totalAmount)}
                </p>

                <StatusPill status={invoice.status} />
              </div>
            </div>
          ))
        )}
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Client Financial                                                          */
/* -------------------------------------------------------------------------- */

function ClientFinancialCard({
  paid,
  outstanding,
  total,
}: {
  paid: number;
  outstanding: number;
  total: number;
}) {
  const paidPercent = total > 0 ? Math.min((paid / total) * 100, 100) : 0;

  return (
    <section className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
      <h2 className="text-base font-semibold text-slate-900">
        Financial Summary
      </h2>

      <p className="mt-1 text-sm text-slate-500">
        Your current invoice position
      </p>

      <div className="mt-6">
        <div className="flex items-center justify-between text-sm">
          <span className="text-slate-500">Paid</span>

          <span className="font-semibold text-slate-900">
            {formatCurrency(paid)}
          </span>
        </div>

        <div className="mt-3 h-3 overflow-hidden rounded-full bg-slate-100">
          <div
            className="h-full rounded-full bg-slate-800 transition-all"
            style={{
              width: `${paidPercent}%`,
            }}
          />
        </div>

        <div className="mt-4 grid grid-cols-2 gap-3">
          <MiniMetric label="Paid" value={formatCurrency(paid)} />

          <MiniMetric label="Outstanding" value={formatCurrency(outstanding)} />
        </div>
      </div>
    </section>
  );
}

/* -------------------------------------------------------------------------- */
/* Section Header                                                             */
/* -------------------------------------------------------------------------- */

function SectionHeader({
  icon: Icon,
  title,
  description,
}: {
  icon: React.ElementType;
  title: string;
  description: string;
}) {
  return (
    <div className="flex items-start gap-3 border-b border-slate-200 px-5 py-4">
      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100">
        <Icon className="h-4 w-4 text-slate-600" />
      </div>

      <div>
        <h2 className="text-sm font-semibold text-slate-900">{title}</h2>

        <p className="mt-1 text-xs text-slate-400">{description}</p>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Mini metric                                                                */
/* -------------------------------------------------------------------------- */

function MiniMetric({
  label,
  value,
}: {
  label: string;
  value: string | number;
}) {
  return (
    <div className="rounded-lg bg-slate-50 p-3">
      <p className="text-[11px] font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <p className="mt-1 text-sm font-semibold text-slate-800">{value}</p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Pills                                                                      */
/* -------------------------------------------------------------------------- */

function StatusPill({ status }: { status: string }) {
  const styles = getStatusStyle(status);

  return (
    <span
      className={`inline-flex rounded-full px-2.5 py-1 text-[11px] font-medium ${styles.className}`}
    >
      {styles.label}
    </span>
  );
}

function PaymentStatusPill({ status }: { status: PaymentStatus }) {
  return (
    <div className="mt-1">
      <StatusPill status={status} />
    </div>
  );
}

function PriorityPill({ priority }: { priority: TaskPriority }) {
  const styles = getPriorityStyle(priority);

  return (
    <span
      className={`inline-flex rounded-full px-2 py-1 text-[10px] font-semibold ${styles.className}`}
    >
      {styles.label}
    </span>
  );
}

/* -------------------------------------------------------------------------- */
/* Empty states                                                               */
/* -------------------------------------------------------------------------- */

function EmptyList({ text }: { text: string }) {
  return (
    <div className="px-5 py-10 text-center">
      <p className="text-sm text-slate-400">{text}</p>
    </div>
  );
}

function EmptyChartState({ text }: { text: string }) {
  return (
    <div className="flex h-full items-center justify-center">
      <p className="text-sm text-slate-400">{text}</p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Loading                                                                    */
/* -------------------------------------------------------------------------- */

function DashboardLoading({ text }: { text: string }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="flex items-center gap-2 text-sm text-slate-600">
        <Loader2 className="h-5 w-5 animate-spin" />
        {text}
      </div>
    </main>
  );
}

function DashboardLoadingContent() {
  return (
    <div className="space-y-6">
      <div className="h-24 animate-pulse rounded-xl bg-slate-200" />

      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {Array.from({
          length: 4,
        }).map((_, index) => (
          <div
            key={index}
            className="h-32 animate-pulse rounded-xl bg-slate-200"
          />
        ))}
      </div>

      <div className="grid gap-6 xl:grid-cols-2">
        <div className="h-80 animate-pulse rounded-xl bg-slate-200" />
        <div className="h-80 animate-pulse rounded-xl bg-slate-200" />
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Chart helpers                                                              */
/* -------------------------------------------------------------------------- */

interface ChartData {
  name: string;
  value: number;
}

const chartColors = ["#334155", "#64748b", "#0f766e", "#b45309", "#be123c"];

function buildStatusData(values: string[], statuses: string[]): ChartData[] {
  return statuses.map((status) => ({
    name: formatStatus(status),
    value: values.filter((value) => value === status).length,
  }));
}

/* -------------------------------------------------------------------------- */
/* Formatting                                                                 */
/* -------------------------------------------------------------------------- */

function formatRole(role: string) {
  return role
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatStatus(status: string) {
  return status
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function formatPriority(priority: string) {
  return priority
    .replaceAll("_", " ")
    .replace(/\b\w/g, (letter) => letter.toUpperCase());
}

function getStatusStyle(status: string) {
  switch (status) {
    case "COMPLETED":
    case "ACCEPTED":
    case "PAID":
      return {
        label: formatStatus(status),
        className: "bg-emerald-50 text-emerald-700",
      };

    case "IN_PROGRESS":
    case "SENT":
    case "PARTIALLY_PAID":
      return {
        label: formatStatus(status),
        className: "bg-blue-50 text-blue-700",
      };

    case "PENDING":
    case "TODO":
    case "DRAFT":
    case "PLANNING":
    case "SCHEDULED":
      return {
        label: formatStatus(status),
        className: "bg-amber-50 text-amber-700",
      };

    case "OVERDUE":
    case "REJECTED":
    case "FAILED":
    case "CANCELLED":
      return {
        label: formatStatus(status),
        className: "bg-red-50 text-red-700",
      };

    default:
      return {
        label: formatStatus(status),
        className: "bg-slate-100 text-slate-600",
      };
  }
}

function getPriorityStyle(priority: TaskPriority) {
  switch (priority) {
    case "URGENT":
      return {
        label: formatPriority(priority),
        className: "bg-red-50 text-red-700",
      };

    case "HIGH":
      return {
        label: formatPriority(priority),
        className: "bg-orange-50 text-orange-700",
      };

    case "MEDIUM":
      return {
        label: formatPriority(priority),
        className: "bg-amber-50 text-amber-700",
      };

    default:
      return {
        label: formatPriority(priority),
        className: "bg-slate-100 text-slate-600",
      };
  }
}

function formatDate(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "N/A";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(date);
}

function formatDateTime(value: string) {
  const date = new Date(value);

  if (Number.isNaN(date.getTime())) {
    return "N/A";
  }

  return new Intl.DateTimeFormat("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "2-digit",
  }).format(date);
}

function formatCurrency(value: string | number) {
  const amount = Number(value);

  if (!Number.isFinite(amount)) {
    return "PKR 0.00";
  }

  return new Intl.NumberFormat("en-PK", {
    style: "currency",
    currency: "PKR",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
  }).format(amount);
}

function formatCompactCurrency(value: number) {
  if (!Number.isFinite(value)) {
    return "0";
  }

  return new Intl.NumberFormat("en-PK", {
    notation: "compact",
    maximumFractionDigits: 1,
  }).format(value);
}

function getGreeting() {
  const hour = new Date().getHours();

  if (hour < 12) {
    return "Good morning";
  }

  if (hour < 18) {
    return "Good afternoon";
  }

  return "Good evening";
}

function startOfWeek(date: Date) {
  const result = new Date(date);

  const day = result.getDay();

  const diff = day === 0 ? -6 : 1 - day;

  result.setDate(result.getDate() + diff);

  result.setHours(0, 0, 0, 0);

  return result;
}

function endOfWeek(date: Date) {
  const result = startOfWeek(date);

  result.setDate(result.getDate() + 6);

  result.setHours(23, 59, 59, 999);

  return result;
}
