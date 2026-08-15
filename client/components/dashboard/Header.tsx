"use client";

import { LogOut, User } from "lucide-react";
import { useRouter } from "next/navigation";
import { authStorage } from "@/features/auth/services/auth-storage";
import type { MeResponse } from "@/features/auth/types/auth.types";

interface HeaderProps {
  user: MeResponse;
}

export default function Header({ user }: HeaderProps) {
  const router = useRouter();

  const handleLogout = () => {
    authStorage.removeToken();
    router.replace("/login");
  };

  return (
    <header className="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-slate-200 bg-white px-6">
      <div>
        <h2 className="text-lg font-semibold text-slate-900">
          Dashboard
        </h2>
      </div>

      <div className="flex items-center gap-4">
        {/* User */}
        <div className="hidden text-right sm:block">
          <p className="text-sm font-medium text-slate-900">
            {user.firstName} {user.lastName}
          </p>

          <p className="text-xs text-slate-500">
            {user.role.replace("_", " ")}
          </p>
        </div>

        {/* Avatar */}
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-slate-100">
          {user.profileImage ? (
            <img
              src={user.profileImage}
              alt={`${user.firstName} ${user.lastName}`}
              className="h-9 w-9 rounded-full object-cover"
            />
          ) : (
            <User className="h-4 w-4 text-slate-500" />
          )}
        </div>

        {/* Logout */}
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-600 transition hover:bg-slate-100 hover:text-slate-900"
        >
          <LogOut className="h-4 w-4" />
          <span className="hidden sm:inline">Logout</span>
        </button>
      </div>
    </header>
  );
}