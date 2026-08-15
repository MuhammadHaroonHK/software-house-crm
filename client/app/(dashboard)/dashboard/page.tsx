"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import DashboardLayout from "@/components/dashboard/DashboardLayout";
import { useCurrentUser } from "@/features/auth/hooks/useAuth";
import { authStorage } from "@/features/auth/services/auth-storage";

export default function DashboardPage() {
  const router = useRouter();

  const [mounted, setMounted] =
    useState(false);

  const {
    data: user,
    isLoading,
    isError,
  } = useCurrentUser();

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
    if (!mounted || !isError) {
      return;
    }

    authStorage.removeToken();

    router.replace("/login");
  }, [mounted, isError, router]);

  /*
   * Do not render authentication-dependent UI
   * until the browser has mounted.
   */
  if (!mounted) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading dashboard...
        </div>
      </main>
    );
  }

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading dashboard...
        </div>
      </main>
    );
  }

  if (!user) {
    return null;
  }

  return (
    <DashboardLayout user={user}>
      <div className="space-y-6">
        {/* Page heading */}
        <div>
          <h1 className="text-2xl font-bold text-slate-900">
            Dashboard
          </h1>

          <p className="mt-1 text-sm text-slate-500">
            Welcome back, {user.firstName}.
          </p>
        </div>

        {/* Statistics */}
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Projects
            </p>

            <p className="mt-2 text-2xl font-bold text-slate-900">
              0
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Active Tasks
            </p>

            <p className="mt-2 text-2xl font-bold text-slate-900">
              0
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Meetings
            </p>

            <p className="mt-2 text-2xl font-bold text-slate-900">
              0
            </p>
          </div>

          <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm">
            <p className="text-sm text-slate-500">
              Pending Invoices
            </p>

            <p className="mt-2 text-2xl font-bold text-slate-900">
              0
            </p>
          </div>
        </div>

        {/* Welcome card */}
        <div className="rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
          <h2 className="text-lg font-semibold text-slate-900">
            Welcome to Software House CRM
          </h2>

          <p className="mt-2 text-sm text-slate-500">
            You are signed in as{" "}
            <span className="font-medium text-slate-700">
              {user.role.replaceAll("_", " ")}
            </span>
            .
          </p>
        </div>
      </div>
    </DashboardLayout>
  );
}