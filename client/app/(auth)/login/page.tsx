import LoginForm from "@/features/auth/components/LoginForm";

export default function LoginPage() {
  return (
    <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4">
      <div className="w-full max-w-md">
        <div className="rounded-lg border border-slate-200 bg-white p-8 shadow-sm">
          <div className="mb-8">
            <h1 className="text-2xl font-semibold tracking-tight text-slate-900">
              Welcome back
            </h1>

            <p className="mt-2 text-sm text-slate-500">
              Sign in to access your CRM account.
            </p>
          </div>

          <LoginForm />
        </div>
      </div>
    </main>
  );
}