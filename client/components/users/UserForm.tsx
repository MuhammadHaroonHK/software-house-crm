"use client";

import { useEffect, useState } from "react";

import {
  useDepartments,
} from "@/features/users/hooks/useUsers";

import type {
  CreateUserPayload,
  UpdateUserPayload,
  User,
} from "@/features/users/types/user.types";

interface UserFormProps {
  user?: User | null;
  error?: string | null;
  onCancel: () => void;
  onCreate: (data: CreateUserPayload) => void;
  onUpdate: (data: UpdateUserPayload) => void;
  isSubmitting?: boolean;
}

type FormState = {
  firstName: string;
  lastName: string;
  email: string;
  password: string;
  phone: string;
  role: CreateUserPayload["role"];
  departmentId: string;
};

const roles: CreateUserPayload["role"][] = [
  "SUPER_ADMIN",
  "PROJECT_MANAGER",
  "EMPLOYEE",
  "CLIENT",
];

export default function UserForm({
  user,
  error,
  onCancel,
  onCreate,
  onUpdate,
  isSubmitting = false,
}: UserFormProps) {
  const isEdit = Boolean(user);

  const { data: departments = [], isLoading: departmentsLoading } =
    useDepartments();

  const [errors, setErrors] = useState<
    Record<string, string>
  >({});

  const [form, setForm] = useState<FormState>({
    firstName: "",
    lastName: "",
    email: "",
    password: "",
    phone: "",
    role: "EMPLOYEE",
    departmentId: "",
  });

  useEffect(() => {
    if (!user) {
      setForm({
        firstName: "",
        lastName: "",
        email: "",
        password: "",
        phone: "",
        role: "EMPLOYEE",
        departmentId: "",
      });

      setErrors({});
      return;
    }

    setForm({
      firstName: user.firstName,
      lastName: user.lastName,
      email: user.email,
      password: "",
      phone: user.phone ?? "",
      role: user.role.name,
      departmentId: user.department?.id ?? "",
    });

    setErrors({});
  }, [user]);

  function updateField(
    field: keyof FormState,
    value: string
  ) {
    setForm((current) => ({
      ...current,
      [field]: value,
    }));

    setErrors((current) => {
      const next = { ...current };
      delete next[field];
      delete next.general;
      return next;
    });
  }

  function validate(): boolean {
    const nextErrors: Record<string, string> = {};

    if (form.firstName.trim().length < 2) {
      nextErrors.firstName =
        "First name must be at least 2 characters.";
    }

    if (form.lastName.trim().length < 2) {
      nextErrors.lastName =
        "Last name must be at least 2 characters.";
    }

    if (!form.email.trim()) {
      nextErrors.email = "Email is required.";
    }

    if (!isEdit && form.password.length < 8) {
      nextErrors.password =
        "Password must be at least 8 characters.";
    }

    if (!form.role) {
      nextErrors.role = "Role is required.";
    }

    setErrors(nextErrors);

    return Object.keys(nextErrors).length === 0;
  }

  function handleSubmit(
    event: React.FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    if (!validate()) {
      return;
    }

    if (isEdit) {
      const payload: UpdateUserPayload = {
        firstName: form.firstName.trim(),
        lastName: form.lastName.trim(),
        email: form.email.trim(),
        phone: form.phone.trim(),
        role: form.role,
        departmentId:
          form.departmentId || null,
      };

      onUpdate(payload);
      return;
    }

    const payload: CreateUserPayload = {
      firstName: form.firstName.trim(),
      lastName: form.lastName.trim(),
      email: form.email.trim(),
      password: form.password,
      phone: form.phone.trim() || undefined,
      role: form.role,
      departmentId:
        form.departmentId || undefined,
    };

    onCreate(payload);
  }

  return (
    <form
      onSubmit={handleSubmit}
      className="space-y-5"
    >
      {/* Backend/general error */}
{(error || errors.general) && (
  <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-600">
    {error || errors.general}
  </div>
)}

      {/* Name */}
      <div className="grid gap-4 sm:grid-cols-2">
        <Field
          label="First Name"
          required
          value={form.firstName}
          error={errors.firstName}
          onChange={(value) =>
            updateField("firstName", value)
          }
          disabled={isSubmitting}
        />

        <Field
          label="Last Name"
          required
          value={form.lastName}
          error={errors.lastName}
          onChange={(value) =>
            updateField("lastName", value)
          }
          disabled={isSubmitting}
        />
      </div>

      {/* Email */}
      <Field
        label="Email"
        type="email"
        required
        value={form.email}
        error={errors.email}
        onChange={(value) =>
          updateField("email", value)
        }
        disabled={isSubmitting}
      />

      {/* Password */}
      {!isEdit && (
        <Field
          label="Password"
          type="password"
          required
          value={form.password}
          error={errors.password}
          onChange={(value) =>
            updateField("password", value)
          }
          disabled={isSubmitting}
          placeholder="Minimum 8 characters"
        />
      )}

      {/* Phone */}
      <Field
        label="Phone"
        value={form.phone}
        error={errors.phone}
        onChange={(value) =>
          updateField("phone", value)
        }
        disabled={isSubmitting}
        placeholder="Optional"
      />

      {/* Role + Department */}
      <div className="grid gap-4 sm:grid-cols-2">
        {/* Role */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Role <span className="text-red-500">*</span>
          </label>

          <select
            value={form.role}
            onChange={(event) =>
              updateField(
                "role",
                event.target.value
              )
            }
            disabled={isSubmitting}
            className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
          >
            {roles.map((role) => (
              <option
                key={role}
                value={role}
              >
                {role.replaceAll("_", " ")}
              </option>
            ))}
          </select>

          {errors.role && (
            <p className="mt-1 text-xs text-red-500">
              {errors.role}
            </p>
          )}
        </div>

        {/* Department */}
        <div>
          <label className="mb-1.5 block text-sm font-medium text-slate-700">
            Department
          </label>

          <select
            value={form.departmentId}
            onChange={(event) =>
              updateField(
                "departmentId",
                event.target.value
              )
            }
            disabled={
              isSubmitting ||
              departmentsLoading
            }
            className="h-10 w-full rounded-lg border border-slate-300 bg-white px-3 text-sm text-slate-900 outline-none focus:border-slate-500 focus:ring-1 focus:ring-slate-500"
          >
            <option value="">
              {departmentsLoading
                ? "Loading departments..."
                : "No department"}
            </option>

            {departments.map((department) => (
              <option
                key={department.id}
                value={department.id}
              >
                {department.name}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Actions */}
      <div className="flex justify-end gap-3 border-t border-slate-200 pt-5">
        <button
          type="button"
          onClick={onCancel}
          disabled={isSubmitting}
          className="rounded-lg border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
        >
          Cancel
        </button>

        <button
          type="submit"
          disabled={isSubmitting}
          className="rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {isSubmitting
            ? "Saving..."
            : isEdit
              ? "Update User"
              : "Create User"}
        </button>
      </div>
    </form>
  );
}

interface FieldProps {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: string;
  required?: boolean;
  disabled?: boolean;
  placeholder?: string;
  error?: string;
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  required = false,
  disabled = false,
  placeholder,
  error,
}: FieldProps) {
  return (
    <div>
      <label className="mb-1.5 block text-sm font-medium text-slate-700">
        {label}{" "}
        {required && (
          <span className="text-red-500">
            *
          </span>
        )}
      </label>

      <input
        type={type}
        value={value}
        placeholder={placeholder}
        disabled={disabled}
        onChange={(event) =>
          onChange(event.target.value)
        }
        className={`h-10 w-full rounded-lg border bg-white px-3 text-sm text-slate-900 outline-none placeholder:text-slate-400 focus:ring-1 ${
          error
            ? "border-red-400 focus:border-red-500 focus:ring-red-500"
            : "border-slate-300 focus:border-slate-500 focus:ring-slate-500"
        }`}
      />

      {error && (
        <p className="mt-1 text-xs text-red-500">
          {error}
        </p>
      )}
    </div>
  );
}