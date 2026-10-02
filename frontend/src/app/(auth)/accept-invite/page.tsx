"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ROUTES } from "@/constants/routes";
import { workspacesApi, InvitationDetailsResponse } from "@/lib/api/workspaces";
import { useAuthStore } from "@/stores/auth-store";
import { useWorkspaceStore } from "@/stores/workspace-store";
import {
  Lock,
  Eye,
  EyeOff,
  ArrowRight,
  Shield,
  Loader2,
  Building2,
  CheckCircle2,
  AlertCircle,
  UserCheck,
} from "lucide-react";
import { toast } from "sonner";

function AcceptInviteContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const token = searchParams.get("token") || "";

  const [invitation, setInvitation] = useState<InvitationDetailsResponse | null>(null);
  // A missing token is known up front, so derive the initial state from it
  const [isVerifyingToken, setIsVerifyingToken] = useState(Boolean(token));
  const [tokenError, setTokenError] = useState<string | null>(
    token
      ? null
      : "No invitation token provided. Please check your invitation link."
  );

  // Form Fields
  const [name, setName] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Submission
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Password strength calculation
  const getPasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[a-z]/.test(pass)) score++;
    if (/[0-9]|[^A-Za-z0-9]/.test(pass)) score++;
    return score;
  };
  const passwordScore = getPasswordStrength(password);

  // Fetch invitation details on mount
  useEffect(() => {
    if (!token) return;

    let isMounted = true;
    const fetchInvite = async () => {
      try {
        const data = await workspacesApi.getInvitationByToken(token);
        if (isMounted) {
          setInvitation(data);
          setIsVerifyingToken(false);
        }
      } catch (err: any) {
        if (isMounted) {
          const msg =
            err?.response?.data?.message ||
            "This invitation link is invalid or has expired.";
          setTokenError(Array.isArray(msg) ? msg[0] : msg);
          setIsVerifyingToken(false);
        }
      }
    };

    fetchInvite();
    return () => {
      isMounted = false;
    };
  }, [token]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Please enter your full name");
      return;
    }

    if (password.length < 8) {
      toast.error("Password must be at least 8 characters long");
      return;
    }

    if (password !== confirmPassword) {
      toast.error("Passwords do not match");
      return;
    }

    setIsSubmitting(true);
    try {
      const response = await workspacesApi.acceptInvitation(token, {
        name: name.trim(),
        password,
      });

      // Update auth store
      if (response.user) {
        useAuthStore.getState().setUser({
          id: response.user.id,
          name: response.user.name,
          email: response.user.email,
        });
      }

      // Update workspace store
      if (response.workspace) {
        useWorkspaceStore.getState().setActiveWorkspace({
          id: response.workspace.id,
          name: response.workspace.name,
          slug: response.workspace.slug,
        });
      }

      toast.success(
        `Welcome to ${response.workspace?.name || "TaskFlow"}! Launching dashboard...`
      );

      setTimeout(() => {
        router.push(ROUTES.DASHBOARD);
      }, 600);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        "Failed to accept invitation. Please try again.";
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="w-full min-h-screen bg-[#faf8ff] dark:bg-[#051424] text-[#131b2e] dark:text-slate-100 flex items-center justify-center p-4 sm:p-6 lg:p-10 font-sans selection:bg-[#4F46E5] selection:text-white">
      <div className="w-full max-w-xl mx-auto my-auto">
        <div className="overflow-hidden rounded-2xl shadow-2xl bg-white dark:bg-[#0d1c2d] border border-slate-200/80 dark:border-[#1e2d42]">
          
          {/* Header Banner */}
          <div className="bg-[#283044] dark:bg-[#071321] text-white p-8 relative overflow-hidden border-b border-slate-700/60">
            <div className="absolute -top-12 -right-12 w-48 h-48 rounded-full bg-[#4F46E5]/30 blur-2xl pointer-events-none" />
            <div className="relative z-10 space-y-3">
              <Link href="/" className="inline-flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#4F46E5] flex items-center justify-center font-bold text-white shadow-xs">
                  TF
                </div>
                <span className="text-lg font-bold tracking-tight text-white">
                  TaskFlow
                </span>
              </Link>

              <div>
                <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-bold bg-[#4F46E5]/30 text-[#c3c0ff] border border-[#4F46E5]/40 mb-2">
                  <UserCheck className="w-3.5 h-3.5" />
                  Workspace Invitation
                </span>
                <h1 className="text-2xl sm:text-3xl font-extrabold text-white tracking-tight">
                  {invitation
                    ? `Join ${invitation.workspace.name}`
                    : "Accept Your Invitation"}
                </h1>
                <p className="text-xs sm:text-sm text-slate-300 mt-1">
                  {invitation
                    ? `Invited by ${invitation.inviter.name} as a ${invitation.role.toLowerCase()}`
                    : "Collaborate in real-time with your team on projects and tasks"}
                </p>
              </div>
            </div>
          </div>

          {/* Body Content */}
          <div className="p-8 sm:p-10">
            {isVerifyingToken ? (
              <div className="py-12 flex flex-col items-center justify-center space-y-3 text-center">
                <Loader2 className="w-8 h-8 text-[#4F46E5] animate-spin" />
                <p className="text-sm font-semibold text-slate-600 dark:text-slate-300">
                  Verifying your invitation link...
                </p>
              </div>
            ) : tokenError ? (
              <div className="py-8 text-center space-y-5">
                <div className="w-14 h-14 rounded-full bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900/60 text-rose-500 mx-auto flex items-center justify-center shadow-xs">
                  <AlertCircle className="w-7 h-7" />
                </div>
                <div className="space-y-1.5 max-w-sm mx-auto">
                  <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                    Invalid Invitation
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
                    {tokenError}
                  </p>
                </div>
                <div className="pt-2">
                  <Link
                    href={ROUTES.LOGIN}
                    className="inline-flex items-center justify-center px-5 py-2.5 rounded-xl bg-[#4F46E5] text-white text-xs font-bold shadow-md hover:bg-[#3525cd] transition-colors"
                  >
                    Go to Sign In
                  </Link>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-5">
                {/* 1. Invited Email (READ-ONLY) */}
                <div className="space-y-1.5">
                  <div className="flex items-center justify-between">
                    <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                      Email Address
                    </label>
                    <span className="text-[10px] font-semibold uppercase tracking-wider text-slate-400 flex items-center gap-1">
                      <Lock className="w-3 h-3 text-slate-400" />
                      Read-only / Locked
                    </span>
                  </div>

                  <div className="relative flex items-center">
                    <input
                      type="email"
                      readOnly
                      disabled
                      value={invitation?.email || ""}
                      className="w-full h-11 pl-3.5 pr-10 bg-slate-100/80 dark:bg-[#071321] border border-slate-300/80 dark:border-[#1e2d42] rounded-xl text-sm font-mono text-slate-600 dark:text-slate-300 cursor-not-allowed select-none shadow-xs"
                    />
                    <Lock className="w-4 h-4 text-slate-400 absolute right-3.5 pointer-events-none" />
                  </div>
                  <p className="text-[11px] text-slate-400 dark:text-slate-500">
                    This account is bound to your invited workspace invitation.
                  </p>
                </div>

                {/* 2. Full Name */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Full Name <span className="text-rose-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Dhruv Test"
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    className="w-full h-11 px-3.5 bg-slate-50 dark:bg-[#08121f] border border-slate-200 dark:border-[#1e2d42] rounded-xl text-sm font-sans text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:bg-white dark:focus:bg-[#08121f] transition-all"
                  />
                </div>

                {/* 3. Password */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Create Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type={showPassword ? "text" : "password"}
                      required
                      placeholder="Min. 8 characters"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      className="w-full h-11 pl-3.5 pr-10 bg-slate-50 dark:bg-[#08121f] border border-slate-200 dark:border-[#1e2d42] rounded-xl text-sm font-sans text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:bg-white dark:focus:bg-[#08121f] transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowPassword(!showPassword)}
                      className="absolute right-3 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded cursor-pointer"
                      aria-label="Toggle password visibility"
                    >
                      {showPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>

                  {/* Password Strength Indicator */}
                  {password && (
                    <div className="space-y-1 pt-1">
                      <div className="flex gap-1 h-1.5 w-full">
                        {[1, 2, 3, 4].map((level) => (
                          <div
                            key={level}
                            className={`h-full flex-1 rounded-full transition-all duration-300 ${
                              passwordScore >= level
                                ? passwordScore === 1
                                  ? "bg-rose-500"
                                  : passwordScore === 2
                                  ? "bg-amber-500"
                                  : passwordScore === 3
                                  ? "bg-indigo-500"
                                  : "bg-emerald-500"
                                : "bg-slate-200 dark:bg-slate-800"
                            }`}
                          />
                        ))}
                      </div>
                      <div className="flex items-center justify-between text-[11px] text-slate-400">
                        <span>
                          {passwordScore <= 1 && "Weak password"}
                          {passwordScore === 2 && "Fair strength"}
                          {passwordScore === 3 && "Good password"}
                          {passwordScore === 4 && "Strong password"}
                        </span>
                        <span className="text-[10px]">
                          Requires 8+ chars
                        </span>
                      </div>
                    </div>
                  )}
                </div>

                {/* 4. Confirm Password */}
                <div className="space-y-1.5">
                  <label className="block text-xs font-bold text-slate-700 dark:text-slate-300">
                    Confirm Password <span className="text-rose-500">*</span>
                  </label>
                  <div className="relative flex items-center">
                    <input
                      type={showConfirmPassword ? "text" : "password"}
                      required
                      placeholder="Repeat your password"
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      className="w-full h-11 pl-3.5 pr-10 bg-slate-50 dark:bg-[#08121f] border border-slate-200 dark:border-[#1e2d42] rounded-xl text-sm font-sans text-slate-900 dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:bg-white dark:focus:bg-[#08121f] transition-all"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                      className="absolute right-3 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded cursor-pointer"
                      aria-label="Toggle confirm password visibility"
                    >
                      {showConfirmPassword ? (
                        <EyeOff className="w-4 h-4" />
                      ) : (
                        <Eye className="w-4 h-4" />
                      )}
                    </button>
                  </div>
                  {confirmPassword && password !== confirmPassword && (
                    <p className="text-xs text-rose-500 flex items-center gap-1">
                      <AlertCircle className="w-3.5 h-3.5" />
                      Passwords do not match
                    </p>
                  )}
                </div>

                {/* Submit Action */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full h-11 bg-[#4F46E5] hover:bg-[#3525cd] text-white font-bold text-sm rounded-xl shadow-md transition-all duration-150 active:scale-[0.98] flex items-center justify-center space-x-2 disabled:opacity-70 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Joining Workspace...</span>
                      </>
                    ) : (
                      <>
                        <span>Join Workspace & Launch Dashboard</span>
                        <ArrowRight className="w-4 h-4" />
                      </>
                    )}
                  </button>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </main>
  );
}

export default function AcceptInvitePage() {
  return (
    <Suspense
      fallback={
        <div className="w-full min-h-screen flex items-center justify-center bg-[#faf8ff] dark:bg-[#051424]">
          <Loader2 className="w-8 h-8 text-[#4F46E5] animate-spin" />
        </div>
      }
    >
      <AcceptInviteContent />
    </Suspense>
  );
}
