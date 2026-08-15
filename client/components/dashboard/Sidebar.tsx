"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  CheckSquare,
  CalendarDays,
  FileText,
  Receipt,
  CreditCard,
  Bell,
  Settings,
} from "lucide-react";
import type { UserRole } from "@/features/auth/types/auth.types";

interface SidebarProps {
  role: UserRole;
}

interface NavigationItem {
  label: string;
  href: string;
  icon: React.ElementType;
  roles: UserRole[];
}

const navigationItems: NavigationItem[] = [
  {
    label: "Dashboard",
    href: "/dashboard",
    icon: LayoutDashboard,
    roles: ["SUPER_ADMIN", "PROJECT_MANAGER", "EMPLOYEE", "CLIENT"],
  },
  {
    label: "Clients",
    href: "/clients",
    icon: Users,
    roles: ["SUPER_ADMIN", "PROJECT_MANAGER", "EMPLOYEE"],
  },
  {
    label: "Projects",
    href: "/projects",
    icon: FolderKanban,
    roles: ["SUPER_ADMIN", "PROJECT_MANAGER", "EMPLOYEE", "CLIENT"],
  },
  {
    label: "Tasks",
    href: "/tasks",
    icon: CheckSquare,
    roles: ["SUPER_ADMIN", "PROJECT_MANAGER", "EMPLOYEE"],
  },
  {
    label: "Meetings",
    href: "/meetings",
    icon: CalendarDays,
    roles: ["SUPER_ADMIN", "PROJECT_MANAGER", "EMPLOYEE", "CLIENT"],
  },
  {
    label: "Quotations",
    href: "/quotations",
    icon: FileText,
    roles: ["SUPER_ADMIN", "PROJECT_MANAGER", "EMPLOYEE"],
  },
  {
    label: "Invoices",
    href: "/invoices",
    icon: Receipt,
    roles: ["SUPER_ADMIN", "PROJECT_MANAGER"],
  },
  {
    label: "Payments",
    href: "/payments",
    icon: CreditCard,
    roles: ["SUPER_ADMIN", "PROJECT_MANAGER"],
  },
  {
    label: "Notifications",
    href: "/notifications",
    icon: Bell,
    roles: ["SUPER_ADMIN", "PROJECT_MANAGER", "EMPLOYEE", "CLIENT"],
  },
  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
    roles: ["SUPER_ADMIN", "PROJECT_MANAGER", "EMPLOYEE", "CLIENT"],
  },
];

export default function Sidebar({ role }: SidebarProps) {
  const pathname = usePathname();

  const visibleItems = navigationItems.filter((item) =>
    item.roles.includes(role)
  );

  return (
    <aside className="fixed inset-y-0 left-0 z-40 flex w-64 flex-col border-r border-slate-200 bg-white">
      {/* Logo */}
      <div className="flex h-16 items-center border-b border-slate-200 px-6">
        <Link
          href="/dashboard"
          className="text-xl font-bold text-slate-900"
        >
          Software House CRM
        </Link>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto px-3 py-5">
        <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
          Main Menu
        </p>

        <div className="space-y-1">
          {visibleItems.map((item) => {
            const Icon = item.icon;

            const isActive =
              pathname === item.href ||
              (item.href !== "/dashboard" &&
                pathname.startsWith(`${item.href}/`));

            return (
              <Link
                key={item.href}
                href={item.href}
                className={`flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm font-medium transition ${
                  isActive
                    ? "bg-slate-900 text-white"
                    : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                }`}
              >
                <Icon className="h-4 w-4 shrink-0" />

                <span>{item.label}</span>
              </Link>
            );
          })}
        </div>
      </nav>

      {/* Role */}
      <div className="border-t border-slate-200 p-4">
        <p className="text-xs text-slate-400">
          Current role
        </p>

        <p className="mt-1 text-sm font-medium text-slate-700">
          {role.replace("_", " ")}
        </p>
      </div>
    </aside>
  );
}