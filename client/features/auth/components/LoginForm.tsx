"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Eye, EyeOff, Loader2 } from "lucide-react";
import { toast } from "sonner";

import { loginSchema, type LoginFormData } from "../schemas/auth.schema";
import { useLogin } from "../hooks/useLogin";

export default function LoginForm() {
  const [showPassword, setShowPassword] = useState(false);

  const router = useRouter();
  const loginMutation = useLogin();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    try {
      const response = await loginMutation.mutateAsync(data);

      toast.success(response.message);

      router.push("/dashboard");
    } catch (error: any) {
      const message =
        error?.response?.data?.message ||
        "Unable to sign in. Please try again.";

      toast.error(message);
    }
  };

  const isSubmitting = loginMutation.isPending;

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
      {/* Email */}
      <div className="space-y-2">
        <label
          htmlFor="email"
          className="text-sm font-medium text-slate-700"
        >
          Email
        </label>

        <input
          id="email"
          type="email"
          placeholder="Enter your email"
          autoComplete="email"
          disabled={isSubmitting}
          {...register("email")}
          className={`w-full rounded-md border px-3 py-2.5 text-sm outline-none transition focus:ring-2 ${
            errors.email
              ? "border-red-400 focus:ring-red-100"
              : "border-slate-300 focus:border-slate-500 focus:ring-slate-100"
          } disabled:cursor-not-allowed disabled:bg-slate-50`}
        />

        {errors.email && (
          <p className="text-sm text-red-600">{errors.email.message}</p>
        )}
      </div>

      {/* Password */}
      <div className="space-y-2">
        <label
          htmlFor="password"
          className="text-sm font-medium text-slate-700"
        >
          Password
        </label>

        <div className="relative">
          <input
            id="password"
            type={showPassword ? "text" : "password"}
            placeholder="Enter your password"
            autoComplete="current-password"
            disabled={isSubmitting}
            {...register("password")}
            className={`w-full rounded-md border px-3 py-2.5 pr-10 text-sm outline-none transition focus:ring-2 ${
              errors.password
                ? "border-red-400 focus:ring-red-100"
                : "border-slate-300 focus:border-slate-500 focus:ring-slate-100"
            } disabled:cursor-not-allowed disabled:bg-slate-50`}
          />

          <button
            type="button"
            onClick={() => setShowPassword((previous) => !previous)}
            disabled={isSubmitting}
            className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-700 disabled:cursor-not-allowed"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>

        {errors.password && (
          <p className="text-sm text-red-600">{errors.password.message}</p>
        )}
      </div>

      {/* Forgot password */}
      <div className="flex justify-end">
        <button
          type="button"
          className="text-sm font-medium text-slate-600 hover:text-slate-900"
        >
          Forgot password?
        </button>
      </div>

      {/* Submit */}
      <button
        type="submit"
        disabled={isSubmitting}
        className="flex w-full items-center justify-center gap-2 rounded-md bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
      >
        {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
        {isSubmitting ? "Signing in..." : "Sign in"}
      </button>
    </form>
  );
}