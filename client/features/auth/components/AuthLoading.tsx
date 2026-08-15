"use client";

import { Loader2 } from "lucide-react";

export default function AuthLoading() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="flex items-center gap-2 text-sm text-slate-600">
        <Loader2 className="h-5 w-5 animate-spin" />
        Loading...
      </div>
    </main>
  );
}