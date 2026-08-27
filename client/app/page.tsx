"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { Loader2 } from "lucide-react";

import { authStorage } from "@/features/auth/services/auth-storage";

export default function Home() {
  const router = useRouter();

  useEffect(() => {
    const token = authStorage.getToken();

    if (token) {
      router.replace("/dashboard");
    } else {
      router.replace("/login");
    }
  }, [router]);

  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50">
      <div className="flex items-center gap-2 text-sm text-slate-600">
        <Loader2 className="h-5 w-5 animate-spin" />
        Loading Software House CRM...
      </div>
    </main>
  );
}
