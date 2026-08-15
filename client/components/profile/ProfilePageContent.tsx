"use client";

import {
  useEffect,
  useState,
  type FormEvent,
  type ReactNode,
} from "react";

import {
  AlertCircle,
  CheckCircle2,
  Eye,
  EyeOff,
  KeyRound,
  Loader2,
  Mail,
  Pencil,
  Phone,
  Save,
  ShieldCheck,
  User,
  X,
} from "lucide-react";

import {
  useChangePassword,
  useProfile,
  useUpdateProfile,
} from "@/features/profile/useProfile";

interface ProfileForm {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
}

interface PasswordForm {
  currentPassword: string;
  newPassword: string;
  confirmPassword: string;
}

export default function ProfilePageContent() {
  const {
    data: profile,
    isLoading,
    isError,
    refetch,
  } = useProfile();

  const updateProfile = useUpdateProfile();
  const changePassword = useChangePassword();

  const [isEditing, setIsEditing] = useState(false);

  const [profileForm, setProfileForm] =
    useState<ProfileForm>({
      firstName: "",
      lastName: "",
      email: "",
      phone: "",
    });

  const [passwordForm, setPasswordForm] =
    useState<PasswordForm>({
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    });

  const [showCurrentPassword, setShowCurrentPassword] =
    useState(false);

  const [showNewPassword, setShowNewPassword] =
    useState(false);

  const [showConfirmPassword, setShowConfirmPassword] =
    useState(false);

  const [profileMessage, setProfileMessage] =
    useState<string | null>(null);

  const [profileError, setProfileError] =
    useState<string | null>(null);

  const [passwordMessage, setPasswordMessage] =
    useState<string | null>(null);

  const [passwordError, setPasswordError] =
    useState<string | null>(null);

  useEffect(() => {
    if (!profile) {
      return;
    }

    setProfileForm({
      firstName: profile.firstName ?? "",
      lastName: profile.lastName ?? "",
      email: profile.email ?? "",
      phone: profile.phone ?? "",
    });
  }, [profile]);

  const handleProfileChange = (
    field: keyof ProfileForm,
    value: string
  ) => {
    setProfileForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const handlePasswordChange = (
    field: keyof PasswordForm,
    value: string
  ) => {
    setPasswordForm((previous) => ({
      ...previous,
      [field]: value,
    }));
  };

  const resetProfileForm = () => {
    if (!profile) {
      return;
    }

    setProfileForm({
      firstName: profile.firstName ?? "",
      lastName: profile.lastName ?? "",
      email: profile.email ?? "",
      phone: profile.phone ?? "",
    });
  };

  const handleEdit = () => {
    resetProfileForm();

    setProfileMessage(null);
    setProfileError(null);

    setIsEditing(true);
  };

  const handleCancelEdit = () => {
    resetProfileForm();

    setProfileMessage(null);
    setProfileError(null);

    setIsEditing(false);
  };

  const handleProfileSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setProfileMessage(null);
    setProfileError(null);

    if (
      !profileForm.firstName.trim() ||
      !profileForm.lastName.trim() ||
      !profileForm.email.trim()
    ) {
      setProfileError(
        "First name, last name and email are required."
      );

      return;
    }

    try {
      const response =
        await updateProfile.mutateAsync({
          firstName: profileForm.firstName.trim(),
          lastName: profileForm.lastName.trim(),
          email: profileForm.email.trim(),
          phone: profileForm.phone.trim(),
        });

      setProfileMessage(
        response.message ||
          "Profile updated successfully."
      );

      setIsEditing(false);
    } catch (error: any) {
      setProfileError(
        error?.response?.data?.message ||
          "Failed to update profile."
      );
    }
  };

  const handlePasswordSubmit = async (
    event: FormEvent<HTMLFormElement>
  ) => {
    event.preventDefault();

    setPasswordMessage(null);
    setPasswordError(null);

    if (
      !passwordForm.currentPassword ||
      !passwordForm.newPassword ||
      !passwordForm.confirmPassword
    ) {
      setPasswordError(
        "Please fill in all password fields."
      );

      return;
    }

    if (
      passwordForm.newPassword !==
      passwordForm.confirmPassword
    ) {
      setPasswordError(
        "New password and confirmation password do not match."
      );

      return;
    }

    if (passwordForm.newPassword.length < 8) {
      setPasswordError(
        "New password must be at least 8 characters."
      );

      return;
    }

    if (
      !/[A-Z]/.test(
        passwordForm.newPassword
      ) ||
      !/[a-z]/.test(
        passwordForm.newPassword
      ) ||
      !/\d/.test(
        passwordForm.newPassword
      )
    ) {
      setPasswordError(
        "New password must contain at least one uppercase letter, one lowercase letter, and one number."
      );

      return;
    }

    try {
      const response =
        await changePassword.mutateAsync({
          currentPassword:
            passwordForm.currentPassword,
          newPassword:
            passwordForm.newPassword,
        });

      setPasswordMessage(
        response.message ||
          "Password changed successfully."
      );

      setPasswordForm({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });

      setShowCurrentPassword(false);
      setShowNewPassword(false);
      setShowConfirmPassword(false);
    } catch (error: any) {
      setPasswordError(
        error?.response?.data?.message ||
          "Failed to change password."
      );
    }
  };

  if (isLoading) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="flex items-center gap-2 text-sm text-slate-600">
          <Loader2 className="h-5 w-5 animate-spin" />
          Loading profile...
        </div>
      </div>
    );
  }

  if (isError || !profile) {
    return (
      <div className="flex min-h-[60vh] items-center justify-center">
        <div className="rounded-xl border border-red-200 bg-red-50 p-6 text-center">
          <AlertCircle className="mx-auto h-8 w-8 text-red-500" />

          <h2 className="mt-3 text-lg font-semibold text-red-700">
            Unable to load profile
          </h2>

          <p className="mt-1 text-sm text-red-600">
            Something went wrong while loading your
            profile.
          </p>

          <button
            type="button"
            onClick={() => refetch()}
            className="mt-4 rounded-lg bg-slate-900 px-4 py-2 text-sm font-medium text-white transition hover:bg-slate-800"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  const fullName =
    `${profile.firstName} ${profile.lastName}`;

  const initials =
    `${profile.firstName?.charAt(0) ?? ""}${profile.lastName?.charAt(0) ?? ""}`.toUpperCase();

  const roleName =
    profile.role?.name?.replaceAll(
      "_",
      " "
    ) ?? "N/A";

  const accountStatus =
    profile.status?.replaceAll(
      "_",
      " "
    ) ?? "N/A";

  return (
    <div className="mx-auto max-w-5xl space-y-6">
      {/* Page heading */}
      <div>
        <h1 className="text-2xl font-bold text-slate-900">
          My Profile
        </h1>

        <p className="mt-1 text-sm text-slate-500">
          View and manage your personal account
          information.
        </p>
      </div>

      {/* Personal Information */}
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-5">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Personal Information
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Your basic account information.
              </p>
            </div>

            {!isEditing && (
              <button
                type="button"
                onClick={handleEdit}
                className="flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800"
              >
                <Pencil className="h-4 w-4" />
                Edit Profile
              </button>
            )}
          </div>
        </div>

        {/* Avatar */}
        <div className="border-b border-slate-200 px-6 py-6">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center overflow-hidden rounded-full bg-slate-900 text-lg font-semibold text-white">
              {profile.profileImage ? (
                <img
                  src={profile.profileImage}
                  alt={fullName}
                  className="h-full w-full object-cover"
                />
              ) : (
                initials || (
                  <User className="h-7 w-7" />
                )
              )}
            </div>

            <div>
              <h3 className="text-base font-semibold text-slate-900">
                {fullName}
              </h3>

              <p className="mt-0.5 text-sm text-slate-500">
                {profile.email}
              </p>
            </div>
          </div>
        </div>

        {isEditing ? (
          <form
            onSubmit={handleProfileSubmit}
            className="p-6"
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <FormField
                id="firstName"
                label="First Name"
                value={profileForm.firstName}
                onChange={(value) =>
                  handleProfileChange(
                    "firstName",
                    value
                  )
                }
              />

              <FormField
                id="lastName"
                label="Last Name"
                value={profileForm.lastName}
                onChange={(value) =>
                  handleProfileChange(
                    "lastName",
                    value
                  )
                }
              />

              <FormField
                id="email"
                label="Email Address"
                type="email"
                value={profileForm.email}
                icon={
                  <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                }
                className="pl-9"
                onChange={(value) =>
                  handleProfileChange(
                    "email",
                    value
                  )
                }
              />

              <FormField
                id="phone"
                label="Phone Number"
                type="tel"
                value={profileForm.phone}
                icon={
                  <Phone className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
                }
                className="pl-9"
                onChange={(value) =>
                  handleProfileChange(
                    "phone",
                    value
                  )
                }
              />
            </div>

            {profileError && (
              <Message
                type="error"
                message={profileError}
              />
            )}

            {profileMessage && (
              <Message
                type="success"
                message={profileMessage}
              />
            )}

            <div className="mt-6 flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
              <button
                type="button"
                onClick={handleCancelEdit}
                disabled={
                  updateProfile.isPending
                }
                className="flex items-center justify-center gap-2 rounded-lg border border-slate-300 px-4 py-2.5 text-sm font-medium text-slate-700 transition hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X className="h-4 w-4" />
                Cancel
              </button>

              <button
                type="submit"
                disabled={
                  updateProfile.isPending
                }
                className="flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {updateProfile.isPending ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    Saving...
                  </>
                ) : (
                  <>
                    <Save className="h-4 w-4" />
                    Save Changes
                  </>
                )}
              </button>
            </div>
          </form>
        ) : (
          <div className="grid gap-x-8 gap-y-6 p-6 sm:grid-cols-2">
            <ProfileDetail
              label="First Name"
              value={profile.firstName}
              icon={<User className="h-4 w-4" />}
            />

            <ProfileDetail
              label="Last Name"
              value={profile.lastName}
              icon={<User className="h-4 w-4" />}
            />

            <ProfileDetail
              label="Email Address"
              value={profile.email}
              icon={<Mail className="h-4 w-4" />}
            />

            <ProfileDetail
              label="Phone Number"
              value={
                profile.phone ||
                "Not provided"
              }
              icon={<Phone className="h-4 w-4" />}
            />

            <ProfileDetail
              label="Role"
              value={roleName}
              icon={
                <ShieldCheck className="h-4 w-4" />
              }
            />

            <ProfileDetail
              label="Department"
              value={
                profile.department?.name ||
                "Not assigned"
              }
              icon={
                <ShieldCheck className="h-4 w-4" />
              }
            />

            <div>
              <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
                Account Status
              </p>

              <div className="mt-2 flex items-center gap-2">
                <span
                  className={`h-2 w-2 rounded-full ${
                    profile.status === "ACTIVE"
                      ? "bg-green-500"
                      : "bg-slate-400"
                  }`}
                />

                <span className="text-sm font-medium text-slate-700">
                  {accountStatus}
                </span>
              </div>
            </div>
          </div>
        )}
      </section>

      {/* Change Password */}
      <section className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm">
        <div className="border-b border-slate-200 px-6 py-5">
          <div className="flex items-start gap-3">
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-100">
              <KeyRound className="h-5 w-5 text-slate-700" />
            </div>

            <div>
              <h2 className="text-lg font-semibold text-slate-900">
                Change Password
              </h2>

              <p className="mt-1 text-sm text-slate-500">
                Update your password using your
                current password.
              </p>
            </div>
          </div>
        </div>

        <form
          onSubmit={handlePasswordSubmit}
          className="p-6"
        >
          <div className="max-w-2xl space-y-5">
            <PasswordInput
              id="currentPassword"
              label="Current Password"
              value={
                passwordForm.currentPassword
              }
              visible={
                showCurrentPassword
              }
              onToggle={() =>
                setShowCurrentPassword(
                  (previous) => !previous
                )
              }
              onChange={(value) =>
                handlePasswordChange(
                  "currentPassword",
                  value
                )
              }
            />

            <PasswordInput
              id="newPassword"
              label="New Password"
              value={
                passwordForm.newPassword
              }
              visible={showNewPassword}
              onToggle={() =>
                setShowNewPassword(
                  (previous) => !previous
                )
              }
              onChange={(value) =>
                handlePasswordChange(
                  "newPassword",
                  value
                )
              }
            />

            <PasswordInput
              id="confirmPassword"
              label="Confirm New Password"
              value={
                passwordForm.confirmPassword
              }
              visible={
                showConfirmPassword
              }
              onToggle={() =>
                setShowConfirmPassword(
                  (previous) => !previous
                )
              }
              onChange={(value) =>
                handlePasswordChange(
                  "confirmPassword",
                  value
                )
              }
            />
          </div>

          <div className="mt-5 rounded-lg bg-slate-50 p-4">
            <p className="text-xs font-medium text-slate-600">
              Password requirements
            </p>

            <ul className="mt-2 space-y-1 text-xs text-slate-500">
              <li>• At least 8 characters</li>
              <li>
                • At least one uppercase letter
              </li>
              <li>
                • At least one lowercase letter
              </li>
              <li>• At least one number</li>
              <li>
                • Must be different from your
                current password
              </li>
            </ul>
          </div>

          {passwordError && (
            <Message
              type="error"
              message={passwordError}
              maxWidth
            />
          )}

          {passwordMessage && (
            <Message
              type="success"
              message={passwordMessage}
              maxWidth
            />
          )}

          <div className="mt-6">
            <button
              type="submit"
              disabled={
                changePassword.isPending
              }
              className="flex items-center justify-center gap-2 rounded-lg bg-slate-900 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {changePassword.isPending ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  Changing Password...
                </>
              ) : (
                <>
                  <KeyRound className="h-4 w-4" />
                  Change Password
                </>
              )}
            </button>
          </div>
        </form>
      </section>
    </div>
  );
}

/* -------------------------------------------------------------------------- */
/* Reusable components                                                        */
/* -------------------------------------------------------------------------- */

function FormField({
  id,
  label,
  value,
  type = "text",
  icon,
  className = "",
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  type?: string;
  icon?: ReactNode;
  className?: string;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 block text-sm font-medium text-slate-700"
      >
        {label}
      </label>

      <div className="relative">
        {icon}

        <input
          id={id}
          type={type}
          value={value}
          onChange={(event) =>
            onChange(event.target.value)
          }
          className={`w-full rounded-lg border border-slate-300 px-3 py-2.5 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200 ${className}`}
        />
      </div>
    </div>
  );
}

function ProfileDetail({
  label,
  value,
  icon,
}: {
  label: string;
  value: string;
  icon: ReactNode;
}) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
        {label}
      </p>

      <div className="mt-2 flex items-center gap-2">
        <span className="text-slate-400">
          {icon}
        </span>

        <p className="text-sm font-medium text-slate-700">
          {value}
        </p>
      </div>
    </div>
  );
}

function PasswordInput({
  id,
  label,
  value,
  visible,
  onToggle,
  onChange,
}: {
  id: string;
  label: string;
  value: string;
  visible: boolean;
  onToggle: () => void;
  onChange: (value: string) => void;
}) {
  return (
    <div>
      <label
        htmlFor={id}
        className="mb-1.5 block text-sm font-medium text-slate-700"
      >
        {label}
      </label>

      <div className="relative">
        <input
          id={id}
          type={visible ? "text" : "password"}
          value={value}
          onChange={(event) =>
            onChange(event.target.value)
          }
          className="w-full rounded-lg border border-slate-300 px-3 py-2.5 pr-11 text-sm outline-none transition focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
        />

        <button
          type="button"
          onClick={onToggle}
          className="absolute right-2 top-1/2 flex h-8 w-8 -translate-y-1/2 items-center justify-center rounded-md text-slate-400 transition hover:bg-slate-100 hover:text-slate-600"
          aria-label={
            visible
              ? `Hide ${label}`
              : `Show ${label}`
          }
        >
          {visible ? (
            <EyeOff className="h-4 w-4" />
          ) : (
            <Eye className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  );
}

function Message({
  type,
  message,
  maxWidth = false,
}: {
  type: "error" | "success";
  message: string;
  maxWidth?: boolean;
}) {
  const isError = type === "error";

  return (
    <div
      className={`${maxWidth ? "max-w-2xl " : ""}mt-5 flex items-start gap-2 rounded-lg border px-4 py-3 text-sm ${
        isError
          ? "border-red-200 bg-red-50 text-red-700"
          : "border-green-200 bg-green-50 text-green-700"
      }`}
    >
      {isError ? (
        <AlertCircle className="mt-0.5 h-4 w-4 shrink-0" />
      ) : (
        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0" />
      )}

      <span>{message}</span>
    </div>
  );
}