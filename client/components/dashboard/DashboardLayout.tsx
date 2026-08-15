"use client";

import {
  type ReactNode,
  useEffect,
  useState,
} from "react";

import Sidebar from "./Sidebar";
import Header from "./Header";

import type { MeResponse } from "@/features/auth/types/auth.types";

interface DashboardLayoutProps {
  children: ReactNode;
  user: MeResponse;
}

export default function DashboardLayout({
  children,
  user,
}: DashboardLayoutProps) {
  const [sidebarCollapsed, setSidebarCollapsed] =
    useState(false);

  const [mobileSidebarOpen, setMobileSidebarOpen] =
    useState(false);

  /*
   * Automatically collapse sidebar on medium screens.
   *
   * lg = 1024px
   */
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth < 1024) {
        setSidebarCollapsed(true);
      } else {
        setSidebarCollapsed(false);
      }

      if (window.innerWidth >= 768) {
        setMobileSidebarOpen(false);
      }
    };

    handleResize();

    window.addEventListener(
      "resize",
      handleResize
    );

    return () => {
      window.removeEventListener(
        "resize",
        handleResize
      );
    };
  }, []);

  const toggleSidebar = () => {
    /*
     * On mobile/tablet we open the sidebar as an overlay.
     */
    if (window.innerWidth < 768) {
      setMobileSidebarOpen(
        (previous) => !previous
      );

      return;
    }

    setSidebarCollapsed(
      (previous) => !previous
    );
  };

  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar
        role={user.role}
        collapsed={sidebarCollapsed}
        mobileOpen={mobileSidebarOpen}
        onCloseMobile={() =>
          setMobileSidebarOpen(false)
        }
      />

      <div
        className={`
          min-h-screen transition-all duration-300
          ${
            sidebarCollapsed
              ? "md:pl-20"
              : "md:pl-64"
          }
        `}
      >
        <Header
          user={user}
          onToggleSidebar={toggleSidebar}
        />

        <main className="p-4 sm:p-6">
          {children}
        </main>
      </div>
    </div>
  );
}