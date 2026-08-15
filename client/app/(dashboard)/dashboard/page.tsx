"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { Loader2 } from "lucide-react";
import { useMe } from "@/features/auth/hooks/useMe";
import { authStorage } from "@/features/auth/services/auth-storage";

export default function DashboardPage() {
  const router = useRouter();

  const { data: user, isLoading, isError } = useMe();

  useEffect(() => {
    if (!authStorage.getToken()) {
      router.replace("/login");
    }
  }, [router]);

  useEffect(() => {
    if (isError) {
      authStorage.removeToken();
      router.replace("/login");
    }
  }, [isError, router]);

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center">
        <div className="flex items-center gap-2 text-slate-600">
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
    <main className="min-h-screen bg-slate-50 p-8">
      <div className="mx-auto max-w-7xl">
        <div className="rounded-xl border bg-white p-6 shadow-sm">
          <p className="text-sm text-slate-500">
            Welcome back
          </p>

          <h1 className="mt-1 text-3xl font-bold text-slate-900">
            {user.firstName} {user.lastName}
          </h1>

          <div className="mt-4 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <div className="rounded-lg border p-4">
              <p className="text-sm text-slate-500">Email</p>
              <p className="mt-1 font-medium">{user.email}</p>
            </div>

            <div className="rounded-lg border p-4">
              <p className="text-sm text-slate-500">Role</p>
              <p className="mt-1 font-medium">{user.role}</p>
            </div>

            <div className="rounded-lg border p-4">
              <p className="text-sm text-slate-500">Department</p>
              <p className="mt-1 font-medium">
                {user.department ?? "Not assigned"}
              </p>
            </div>

            <div className="rounded-lg border p-4">
              <p className="text-sm text-slate-500">Status</p>
              <p className="mt-1 font-medium">{user.status}</p>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}