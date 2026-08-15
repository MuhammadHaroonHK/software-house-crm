"use client";

import { useCurrentUser } from "@/features/auth/hooks/useAuth";
import DashboardLayout from "@/components/dashboard/DashboardLayout";
import ProfilePageContent from "@/components/profile/ProfilePageContent";

export default function ProfilePage() {
  const {
  data: user,
  isLoading,
  isError,
} = useCurrentUser();

const isAuthenticated = !!user && !isError;

  if (isLoading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-slate-50">
        <div className="text-sm text-slate-600">
          Loading profile...
        </div>
      </div>
    );
  }

  if (!isAuthenticated || !user) {
    return null;
  }

  return (
    <DashboardLayout user={user}>
      <ProfilePageContent />
    </DashboardLayout>
  );
}