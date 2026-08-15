"use client";

import type { ReactNode } from "react";
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
  return (
    <div className="min-h-screen bg-slate-50">
      <Sidebar role={user.role} />

      <div className="pl-64">
        <Header user={user} />

        <main className="p-6">
          {children}
        </main>
      </div>
    </div>
  );
}