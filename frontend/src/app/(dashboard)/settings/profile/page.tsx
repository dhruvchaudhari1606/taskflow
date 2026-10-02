"use client";

import React, { useState } from "react";
import Link from "next/link";
import {
  User,
  Shield,
  KeyRound,
  Mail,
  Check,
  Eye,
  EyeOff,
  Sparkles,
  Lock,
  CheckCircle2,
  AlertCircle,
  Save,
  ArrowLeft,
  Smartphone,
  Laptop,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Avatar } from "@/components/common/avatar";
import { useQueryClient } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/auth-store";
import { useCurrentUser, CURRENT_USER_QUERY_KEY } from "@/features/auth/hooks/use-current-user";
import { authApi } from "@/lib/api/auth";
import { ROUTES } from "@/constants/routes";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

export default function ProfileSettingsPage() {
  const queryClient = useQueryClient();
  const { user, setUser } = useCurrentUser();

  // Profile Form State
  const [name, setName] = useState(user?.name || "");
  const [email, setEmail] = useState(user?.email || "");
  const [avatarUrl, setAvatarUrl] = useState(user?.avatarUrl || "");
  const [savingProfile, setSavingProfile] = useState(false);

  // Password Change Form State
  const [currentPassword, setCurrentPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [changingPassword, setChangingPassword] = useState(false);

  // Sync profile fields when the user loads (adjusted during render rather than in an effect)
  const [syncedDeps, setSyncedDeps] = useState<unknown[] | null>(null);
  const userDeps = [user?.id, user?.name, user?.email, user?.avatarUrl];
  if (!syncedDeps || userDeps.some((dep, i) => dep !== syncedDeps[i])) {
    setSyncedDeps(userDeps);
    if (user) {
      setName(user.name);
      setEmail(user.email);
      if (user.avatarUrl) setAvatarUrl(user.avatarUrl);
    }
  }

  // Password policy checks
  const hasMinLength = newPassword.length >= 8;
  const hasUppercase = /[A-Z]/.test(newPassword);
  const hasLowercase = /[a-z]/.test(newPassword);
  const hasNumber = /[0-9]/.test(newPassword);
  const hasSymbol = /[^A-Za-z0-9]/.test(newPassword);
  const passwordsMatch = newPassword.length > 0 && newPassword === confirmPassword;
  const isPasswordValid =
    hasMinLength &&
    hasUppercase &&
    hasLowercase &&
    (hasNumber || hasSymbol) &&
    passwordsMatch;

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim()) {
      toast.error("Please provide a valid display name");
      return;
    }

    setSavingProfile(true);
    try {
      const updated = await authApi.updateProfile({
        name: name.trim(),
        avatar_url: avatarUrl.trim() || undefined,
      });

      const updatedUser = {
        id: updated?.id || user?.id || "user-id",
        name: name.trim(),
        email: email || user?.email || "",
        avatarUrl: avatarUrl.trim() || null,
      };

      setUser(updatedUser);
      queryClient.setQueryData(CURRENT_USER_QUERY_KEY, updatedUser);
      queryClient.invalidateQueries({ queryKey: CURRENT_USER_QUERY_KEY });
      toast.success("Profile updated successfully!");
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Failed to update profile";
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setSavingProfile(false);
    }
  };

  const handleChangePassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentPassword) {
      toast.error("Please enter your current password");
      return;
    }
    if (!isPasswordValid) {
      toast.error("Please meet all password security requirements");
      return;
    }

    setChangingPassword(true);
    try {
      await authApi.changePassword({
        currentPassword,
        newPassword,
      });
      toast.success("Password changed successfully! All sessions secured.");
      setCurrentPassword("");
      setNewPassword("");
      setConfirmPassword("");
    } catch (err: any) {
      const msg =
        err?.response?.data?.message || "Failed to change password. Verify your current password.";
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setChangingPassword(false);
    }
  };

  return (
    <div className="w-full max-w-4xl mx-auto space-y-8 pb-16">
      {/* ─── Top Header Section ─── */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-2 border-b border-slate-200/80 dark:border-slate-800">
        <div>
          <div className="flex items-center gap-2">
            <Link
              href={ROUTES.SETTINGS}
              className="text-xs text-slate-500 hover:text-slate-900 dark:hover:text-white flex items-center gap-1 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Settings</span>
            </Link>
            <span className="text-slate-300 dark:text-slate-700">•</span>
            <span className="text-xs uppercase font-bold tracking-wider text-[#4F46E5]">
              Personal Identity
            </span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-slate-900 dark:text-white mt-1">
            Account & Security Settings
          </h1>
          <p className="text-xs text-slate-500 dark:text-slate-400 mt-1">
            Manage your personal profile, authenticated email credentials, and security password.
          </p>
        </div>
      </div>

      <div className="space-y-6">
        {/* ─── Profile Identity Section ─── */}
        <form
          onSubmit={handleSaveProfile}
          className="p-6 rounded-2xl bg-white dark:bg-[#131b2e] border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6"
        >
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800/80">
            <div className="w-9 h-9 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 text-[#4F46E5] flex items-center justify-center">
              <User className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Personal Identity & Avatar
              </h2>
              <p className="text-xs text-slate-500">
                Your name and avatar appear on assigned tasks and discussion comments
              </p>
            </div>
          </div>

          <div className="flex flex-col sm:flex-row items-start sm:items-center gap-5">
            <Avatar name={name} src={avatarUrl || undefined} fallback={name || "User"} size="lg" />
            <div className="flex-1 space-y-1 w-full">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Avatar Image URL (optional)
              </label>
              <input
                type="url"
                placeholder="https://example.com/avatar.jpg"
                value={avatarUrl}
                onChange={(e) => setAvatarUrl(e.target.value)}
                className="w-full text-xs bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/40"
              />
            </div>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Full Display Name
              </label>
              <input
                type="text"
                required
                value={name}
                onChange={(e) => setName(e.target.value)}
                className="w-full text-xs bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/40"
              />
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Primary Email
                </label>
                <span className="text-[10px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-full">
                  Verified
                </span>
              </div>
              <input
                type="email"
                disabled
                value={email}
                className="w-full text-xs bg-slate-100 dark:bg-slate-800/80 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-500 cursor-not-allowed"
              />
            </div>
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              disabled={savingProfile}
              className="bg-[#4F46E5] hover:bg-[#3525cd] text-white text-xs font-bold rounded-xl h-9 px-4 shadow-sm flex items-center gap-1.5"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{savingProfile ? "Saving..." : "Save Profile Changes"}</span>
            </Button>
          </div>
        </form>

        {/* ─── Security & Change Password Section ─── */}
        <form
          onSubmit={handleChangePassword}
          className="p-6 rounded-2xl bg-white dark:bg-[#131b2e] border border-slate-200/80 dark:border-slate-800 shadow-xs space-y-6"
        >
          <div className="flex items-center gap-3 pb-4 border-b border-slate-100 dark:border-slate-800/80">
            <div className="w-9 h-9 rounded-xl bg-purple-50 dark:bg-purple-950/60 text-purple-600 flex items-center justify-center">
              <KeyRound className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-slate-900 dark:text-white">
                Change Password & Session Security
              </h2>
              <p className="text-xs text-slate-500">
                Updating your password automatically revokes stale sessions across other devices
              </p>
            </div>
          </div>

          <div className="space-y-4">
            {/* Current Password */}
            <div className="space-y-1.5">
              <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                Current Password
              </label>
              <div className="relative">
                <input
                  type={showCurrent ? "text" : "password"}
                  required
                  placeholder="Enter your current password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className="w-full text-xs bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 pr-9 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/40"
                />
                <button
                  type="button"
                  onClick={() => setShowCurrent(!showCurrent)}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                >
                  {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* New Password & Confirm Password Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  New Password
                </label>
                <div className="relative">
                  <input
                    type={showNew ? "text" : "password"}
                    required
                    placeholder="Minimum 8 characters"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    className="w-full text-xs bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 pr-9 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/40"
                  />
                  <button
                    type="button"
                    onClick={() => setShowNew(!showNew)}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
                  >
                    {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-slate-700 dark:text-slate-300">
                  Confirm New Password
                </label>
                <input
                  type="password"
                  required
                  placeholder="Repeat new password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  className="w-full text-xs bg-slate-50 dark:bg-slate-900/60 border border-slate-200 dark:border-slate-700 rounded-xl px-3 py-2 text-slate-800 dark:text-slate-200 focus:outline-none focus:ring-2 focus:ring-[#4F46E5]/40"
                />
              </div>
            </div>

            {/* Password Policy Checklist */}
            {newPassword.length > 0 && (
              <div className="p-3 rounded-xl bg-slate-50 dark:bg-slate-900/40 border border-slate-100 dark:border-slate-800 text-[11px] grid grid-cols-2 sm:grid-cols-3 gap-2">
                <span
                  className={cn(
                    "flex items-center gap-1.5",
                    hasMinLength ? "text-emerald-600 dark:text-emerald-400 font-semibold" : "text-slate-400"
                  )}
                >
                  <Check className="w-3 h-3" /> 8+ Characters
                </span>
                <span
                  className={cn(
                    "flex items-center gap-1.5",
                    hasUppercase ? "text-emerald-600 dark:text-emerald-400 font-semibold" : "text-slate-400"
                  )}
                >
                  <Check className="w-3 h-3" /> Uppercase letter
                </span>
                <span
                  className={cn(
                    "flex items-center gap-1.5",
                    hasLowercase ? "text-emerald-600 dark:text-emerald-400 font-semibold" : "text-slate-400"
                  )}
                >
                  <Check className="w-3 h-3" /> Lowercase letter
                </span>
                <span
                  className={cn(
                    "flex items-center gap-1.5",
                    hasNumber || hasSymbol
                      ? "text-emerald-600 dark:text-emerald-400 font-semibold"
                      : "text-slate-400"
                  )}
                >
                  <Check className="w-3 h-3" /> Number or Symbol
                </span>
                <span
                  className={cn(
                    "flex items-center gap-1.5",
                    passwordsMatch ? "text-emerald-600 dark:text-emerald-400 font-semibold" : "text-slate-400"
                  )}
                >
                  <Check className="w-3 h-3" /> Passwords match
                </span>
              </div>
            )}
          </div>

          <div className="flex justify-end pt-2">
            <Button
              type="submit"
              disabled={changingPassword || !isPasswordValid || !currentPassword}
              className="bg-purple-600 hover:bg-purple-700 text-white text-xs font-bold rounded-xl h-9 px-4 shadow-sm flex items-center gap-1.5"
            >
              <Lock className="w-3.5 h-3.5" />
              <span>{changingPassword ? "Updating..." : "Update Password"}</span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
