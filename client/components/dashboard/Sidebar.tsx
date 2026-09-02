"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Users,
  Building2,
  FolderKanban,
  CheckSquare,
  CalendarDays,
  FileText,
  Receipt,
  CreditCard,
  Bell,
  File,
  UserRound,
  Settings,
  X,
} from "lucide-react";

import type { UserRole } from "@/features/auth/types/auth.types";

interface SidebarProps {
  role: UserRole;
  collapsed: boolean;
  mobileOpen: boolean;
  onCloseMobile: () => void;
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
    label: "Users",
    href: "/users",
    icon: Users,
    roles: ["SUPER_ADMIN"],
  },

  
  {
    label: "Departments",
    href: "/departments",
    icon: Building2,
    roles: ["SUPER_ADMIN"],
  },

  {
    label: "Clients",
    href: "/clients",
    icon: Building2,
    roles: ["SUPER_ADMIN", "PROJECT_MANAGER"],
  },

  {
    label: "Contact Persons",
    href: "/contact-persons",
    icon: UserRound,
    roles: ["SUPER_ADMIN", "PROJECT_MANAGER"],
  },

  // {
  //   label: "Company",
  //   href: "/company",
  //   icon: Building2,
  //   roles: ["SUPER_ADMIN"],
  // },

  {
    label: "Projects",
    href: "/projects",
    icon: FolderKanban,
    roles: ["SUPER_ADMIN", "PROJECT_MANAGER"],
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
    roles: ["SUPER_ADMIN", "PROJECT_MANAGER", "EMPLOYEE"],
  },

  {
    label: "Quotations",
    href: "/quotations",
    icon: FileText,
    roles: ["SUPER_ADMIN", "PROJECT_MANAGER", "CLIENT"],
  },

  {
    label: "Invoices",
    href: "/invoices",
    icon: Receipt,
    roles: ["SUPER_ADMIN", "PROJECT_MANAGER", "CLIENT"],
  },

  {
    label: "Payments",
    href: "/payments",
    icon: CreditCard,
    roles: ["SUPER_ADMIN", "PROJECT_MANAGER", "EMPLOYEE", "CLIENT"],
  },

  {
    label: "Notifications",
    href: "/notifications",
    icon: Bell,
    roles: ["SUPER_ADMIN", "PROJECT_MANAGER", "EMPLOYEE", "CLIENT"],
  },

  // {
  //   label: "Files",
  //   href: "/files",
  //   icon: File,
  //   roles: ["SUPER_ADMIN", "PROJECT_MANAGER", "EMPLOYEE", "CLIENT"],
  // },


  {
    label: "Settings",
    href: "/settings",
    icon: Settings,
    roles: ["SUPER_ADMIN", "PROJECT_MANAGER", "EMPLOYEE", "CLIENT"],
  },
];

export default function Sidebar({
  role,
  collapsed,
  mobileOpen,
  onCloseMobile,
}: SidebarProps) {
  const pathname = usePathname();

  const visibleItems = navigationItems.filter((item) =>
    item.roles.includes(role),
  );

  /*
   * Mobile sidebar should ALWAYS be fully expanded.
   *
   * Desktop/tablet:
   *   collapsed = icons only
   *
   * Mobile:
   *   mobileOpen = icons + text
   */
  const showText = !collapsed || mobileOpen;

  return (
    <>
      {/* Mobile overlay */}
      {mobileOpen && (
        <button
          type="button"
          aria-label="Close sidebar"
          onClick={onCloseMobile}
          className="fixed inset-0 z-40 bg-slate-900/30 md:hidden"
        />
      )}

      <aside
        className={`
          fixed inset-y-0 left-0 z-50 flex flex-col
          border-r border-slate-200 bg-white
          transition-all duration-300 ease-in-out

          ${mobileOpen ? "w-64" : collapsed ? "w-20" : "w-64"}

          ${mobileOpen ? "translate-x-0" : "-translate-x-full md:translate-x-0"}
        `}
      >
        {/* Logo */}
        <div
          className={`
            flex h-16 shrink-0 items-center
            border-b border-slate-200
            ${showText ? "px-6" : "justify-center px-3"}
          `}
        >
          <Link
            href="/dashboard"
            onClick={onCloseMobile}
            className="flex items-center"
            title="Software House CRM"
          >
            {showText ? (
              <span className="text-xl font-bold text-slate-900">
                Software House CRM
              </span>
            ) : (
              <span className="text-xl font-bold text-slate-900">CRM</span>
            )}
          </Link>

          {/* Mobile close button */}
          <button
            type="button"
            onClick={onCloseMobile}
            className="ml-auto flex h-8 w-8 items-center justify-center rounded-lg text-slate-500 hover:bg-slate-100 md:hidden"
            aria-label="Close sidebar"
          >
            <X className="h-5 w-5" />
          </button>
        </div>

        {/* Navigation */}
        <nav className="flex-1 overflow-y-auto px-3 py-5">
          {showText && (
            <p className="mb-3 px-3 text-xs font-semibold uppercase tracking-wider text-slate-400">
              Main Menu
            </p>
          )}

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
                  onClick={onCloseMobile}
                  title={!showText ? item.label : undefined}
                  className={`
                    flex items-center rounded-lg
                    py-2.5 text-sm font-medium
                    transition

                    ${showText ? "gap-3 px-3" : "justify-center px-3"}

                    ${
                      isActive
                        ? "bg-slate-900 text-white"
                        : "text-slate-600 hover:bg-slate-100 hover:text-slate-900"
                    }
                  `}
                >
                  <Icon className="h-4 w-4 shrink-0" />

                  {showText && <span>{item.label}</span>}
                </Link>
              );
            })}
          </div>
        </nav>

        {/* Current Role */}
        <div className="shrink-0 border-t border-slate-200 p-4">
          {showText ? (
            <>
              <p className="text-xs text-slate-400">Current role</p>

              <p className="mt-1 text-sm font-medium text-slate-700">
                {role.replaceAll("_", " ")}
              </p>
            </>
          ) : (
            <div
              className="flex justify-center"
              title={role.replaceAll("_", " ")}
            >
              <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-100 text-xs font-semibold text-slate-600">
                {role.charAt(0)}
              </div>
            </div>
          )}
        </div>
      </aside>
    </>
  );
}
