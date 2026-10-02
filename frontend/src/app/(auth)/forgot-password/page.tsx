"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { ROUTES } from "@/constants/routes";
import { authApi } from "@/lib/api/auth";
import {
  Check,
  ArrowRight,
  ArrowLeft,
  Mail,
  MailCheck,
  Loader2,
  Shield,
  KeyRound,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [touched, setTouched] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  // Resend cooldown timer
  const [countdown, setCountdown] = useState(60);

  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isSubmitted && countdown > 0) {
      timer = setInterval(() => {
        setCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [isSubmitted, countdown]);

  const validateEmail = (val: string) => {
    const trimmed = val.trim();
    if (!trimmed) {
      return "Work email is required";
    }
    const regex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!regex.test(trimmed)) {
      return "Please enter a valid work email address";
    }
    return null;
  };

  const handleEmailChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setEmail(val);
    if (touched) {
      setError(validateEmail(val));
    }
  };

  const handleBlur = () => {
    setTouched(true);
    setError(validateEmail(email));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched(true);
    const err = validateEmail(email);
    if (err) {
      setError(err);
      toast.error(err);
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const normalizedEmail = email.trim().toLowerCase();
      const res = await authApi.forgotPassword({ email: normalizedEmail });

      setIsSubmitted(true);
      setCountdown(60);
      toast.success(
        res?.message || "Password reset instructions sent if email exists",
      );
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to request password reset. Please try again.";
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setIsLoading(false);
    }
  };

  const handleResend = async () => {
    if (countdown > 0 || isLoading) return;
    setIsLoading(true);
    try {
      const normalizedEmail = email.trim().toLowerCase();
      await authApi.forgotPassword({ email: normalizedEmail });
      setCountdown(60);
      toast.success("A fresh reset link has been dispatched");
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Could not resend reset link";
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <main className="w-full min-h-screen bg-[#faf8ff] dark:bg-[#051424] text-[#131b2e] dark:text-slate-100 flex items-center justify-center p-4 sm:p-6 lg:p-10 font-sans selection:bg-[#4F46E5] selection:text-white">
      <div className="w-full max-w-6xl mx-auto my-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 overflow-hidden rounded-2xl shadow-2xl bg-white dark:bg-[#0d1c2d] border border-slate-100 dark:border-[#1e2d42]">
          {/* ─── Left Branded Pane (Enterprise Dark Slate) ────────────────── */}
          <div className="lg:col-span-5 bg-[#283044] dark:bg-[#071321] text-[#eef0ff] p-8 lg:p-12 flex flex-col justify-between relative overflow-hidden lg:border-r dark:border-[#1e2d42]">
            {/* Ambient glows */}
            <div className="absolute -right-24 -bottom-24 w-80 h-80 bg-[#4F46E5]/20 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -left-20 -top-20 w-64 h-64 bg-[#0051d5]/15 rounded-full blur-2xl pointer-events-none" />

            <div className="relative z-10 flex flex-col space-y-8">
              {/* Brand Header */}
              <Link href="/" className="flex items-center space-x-3 group">
                <svg
                  width="40"
                  height="40"
                  viewBox="0 0 40 40"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  className="rounded-lg shadow-sm flex-shrink-0 group-hover:scale-105 transition-transform"
                >
                  <rect width="40" height="40" rx="10" fill="#4F46E5" />
                  <path
                    d="M11 15L17 21L29 9"
                    stroke="white"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M11 27H29"
                    stroke="white"
                    strokeWidth="3.5"
                    strokeLinecap="round"
                  />
                  <circle cx="27" cy="27" r="3" fill="#EEF2FF" />
                </svg>
                <div className="flex flex-col">
                  <span className="text-xl font-bold tracking-tight text-white font-sans">
                    TaskFlow
                  </span>
                  <span className="text-[10px] text-slate-300 font-medium tracking-wider uppercase">
                    Enterprise Edition
                  </span>
                </div>
              </Link>

              {/* Pitch Statement */}
              <div className="space-y-3 pt-2">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold bg-[#4F46E5]/30 text-[#c3c0ff] tracking-wide border border-[#4F46E5]/40">
                  <KeyRound className="w-3.5 h-3.5" />
                  Account Recovery
                </span>
                <h1 className="text-3xl lg:text-4xl font-extrabold text-white leading-tight tracking-tight">
                  Secure access
                  <br />
                  recovery.
                </h1>
                <p className="text-sm text-slate-300 leading-relaxed max-w-sm">
                  Restoring access to your projects and team workspace is fast,
                  secure, and protected by enterprise-grade cryptographic guarantees.
                </p>
              </div>

              {/* Security Pillars */}
              <div className="space-y-3.5 pt-2">
                <div className="flex items-start space-x-3">
                  <div className="w-5 h-5 rounded-full bg-[#4F46E5]/40 flex items-center justify-center text-[#c3c0ff] mt-0.5 flex-shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <div className="text-sm text-white/90">
                    <span className="font-semibold block text-white">
                      Time-limited tokens
                    </span>
                    <span className="text-xs text-slate-300">
                      Reset links expire automatically in 15 minutes.
                    </span>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-5 h-5 rounded-full bg-[#4F46E5]/40 flex items-center justify-center text-[#c3c0ff] mt-0.5 flex-shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <div className="text-sm text-white/90">
                    <span className="font-semibold block text-white">
                      Session revocation
                    </span>
                    <span className="text-xs text-slate-300">
                      Instantly logs out all active devices upon password reset.
                    </span>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-5 h-5 rounded-full bg-[#4F46E5]/40 flex items-center justify-center text-[#c3c0ff] mt-0.5 flex-shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <div className="text-sm text-white/90">
                    <span className="font-semibold block text-white">
                      Zero enumeration leak
                    </span>
                    <span className="text-xs text-slate-300">
                      Protected against email scraping and user reconnaissance.
                    </span>
                  </div>
                </div>
              </div>
            </div>

            {/* Bottom Security Card */}
            <div className="relative z-10 pt-4 mt-8 bg-black/20 backdrop-blur-sm rounded-xl p-4 border border-white/10 flex items-center space-x-3">
              <div className="w-10 h-10 rounded-lg bg-[#4F46E5]/30 flex items-center justify-center text-[#c3c0ff] flex-shrink-0">
                <Shield className="w-5 h-5" />
              </div>
              <div className="text-xs text-slate-300">
                <span className="text-white font-bold block">
                  Enterprise Security Standard
                </span>
                Protected by rate limiting, SHA-256 token hashing, and audit logs.
              </div>
            </div>
          </div>

          {/* ─── Right Form Pane (White / Dark Surface) ───────────────────── */}
          <div className="lg:col-span-7 bg-white dark:bg-[#0d1c2d] p-8 sm:p-12 lg:p-16 flex flex-col justify-between">
            <div className="max-w-md w-full mx-auto space-y-7">
              {/* Back Link */}
              <div>
                <Link
                  href={ROUTES.LOGIN}
                  className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-[#4F46E5] dark:text-slate-400 dark:hover:text-indigo-400 transition-colors group cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4 mr-1.5 transition-transform group-hover:-translate-x-1" />
                  Back to sign in
                </Link>
              </div>

              {!isSubmitted ? (
                /* Step 1: Request Reset Link Form */
                <div className="space-y-6">
                  <div className="space-y-1.5">
                    <h2 className="text-2xl font-bold text-[#131b2e] dark:text-white tracking-tight">
                      Forgot password?
                    </h2>
                    <p className="text-sm text-[#464555] dark:text-slate-400 leading-relaxed">
                      No worries. Enter the work email associated with your account
                      and we’ll dispatch a secure password reset link.
                    </p>
                  </div>

                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div className="space-y-1.5">
                      <label
                        className="block text-xs font-bold text-[#131b2e] dark:text-slate-200"
                        htmlFor="reset-email"
                      >
                        Email address
                      </label>
                      <div className="relative">
                        <div className="absolute inset-y-0 left-0 pl-3.5 flex items-center pointer-events-none text-slate-400">
                          <Mail className="w-4 h-4" />
                        </div>
                        <input
                          id="reset-email"
                          type="email"
                          value={email}
                          onChange={handleEmailChange}
                          onBlur={handleBlur}
                          placeholder="name@company.com"
                          autoFocus
                          required
                          className={`w-full h-11 pl-10 pr-3.5 bg-slate-50 dark:bg-[#08121f] border text-[#131b2e] dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:bg-white dark:focus:bg-[#08121f] transition-all font-sans ${
                            error && touched
                              ? "border-red-500 focus:ring-red-400"
                              : "border-slate-200 dark:border-[#1e2d42]"
                          }`}
                        />
                      </div>
                      {error && touched && (
                        <p className="text-xs text-red-600 dark:text-red-400 font-medium">
                          {error}
                        </p>
                      )}
                    </div>

                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-11 bg-[#4F46E5] hover:bg-[#3525cd] text-white font-bold text-sm rounded-xl shadow-md transition-all duration-150 active:scale-[0.98] flex items-center justify-center space-x-2 disabled:opacity-70 cursor-pointer"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Sending reset link...</span>
                          </>
                        ) : (
                          <>
                            <span>Send Reset Instructions</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </div>
                  </form>

                  <div className="text-center pt-2">
                    <span className="text-xs text-[#464555] dark:text-slate-400">
                      Remember your password?
                    </span>
                    <Link
                      href={ROUTES.LOGIN}
                      className="text-xs text-[#4F46E5] dark:text-indigo-400 hover:text-[#3525cd] font-bold ml-1.5 transition-colors"
                    >
                      Sign in
                    </Link>
                  </div>
                </div>
              ) : (
                /* Step 2: Instructions Dispatched Confirmation */
                <div className="space-y-6 animate-in fade-in zoom-in-95 duration-200">
                  <div className="flex flex-col items-center text-center space-y-3">
                    <div className="w-16 h-16 rounded-2xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800 flex items-center justify-center text-[#4F46E5] dark:text-indigo-400 shadow-md">
                      <MailCheck className="w-8 h-8" />
                    </div>
                    <div className="space-y-1">
                      <h2 className="text-2xl font-bold text-[#131b2e] dark:text-white">
                        Check your email
                      </h2>
                      <p className="text-sm text-[#464555] dark:text-slate-300 max-w-sm">
                        If an account exists for{" "}
                        <span className="font-semibold text-[#131b2e] dark:text-white">
                          {email}
                        </span>
                        , we have sent instructions to reset your password.
                      </p>
                    </div>
                  </div>

                  {/* Resend & Change Email Actions */}
                  <div className="pt-2 border-t border-slate-100 dark:border-[#1e2d42] space-y-3 text-center">
                    <p className="text-xs text-[#464555] dark:text-slate-400">
                      Didn&apos;t receive the email? Check your spam folder or
                    </p>
                    <div className="flex items-center justify-center gap-3">
                      <button
                        type="button"
                        onClick={handleResend}
                        disabled={countdown > 0 || isLoading}
                        className="text-xs font-bold text-[#4F46E5] dark:text-indigo-400 hover:text-[#3525cd] disabled:opacity-50 disabled:cursor-not-allowed inline-flex items-center gap-1 cursor-pointer transition-colors"
                      >
                        <RotateCcw className="w-3 h-3" />
                        {countdown > 0
                          ? `Resend in ${countdown}s`
                          : "Resend email"}
                      </button>
                      <span className="text-slate-300 dark:text-slate-600">
                        •
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setIsSubmitted(false);
                        }}
                        className="text-xs font-semibold text-slate-600 dark:text-slate-300 hover:text-[#131b2e] dark:hover:text-white transition-colors cursor-pointer"
                      >
                        Try another email
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Legal bar */}
            <div className="max-w-md w-full mx-auto pt-8 mt-6 border-t border-slate-100 dark:border-[#1e2d42]">
              <div className="flex flex-wrap items-center justify-between text-slate-400 text-xs">
                <span>© 2026 TaskFlow Inc.</span>
                <div className="flex items-center space-x-3">
                  <Link
                    href="/terms"
                    className="hover:text-[#131b2e] dark:hover:text-white transition-colors"
                  >
                    Terms
                  </Link>
                  <span>•</span>
                  <Link
                    href="/privacy"
                    className="hover:text-[#131b2e] dark:hover:text-white transition-colors"
                  >
                    Privacy
                  </Link>
                  <span>•</span>
                  <span className="flex items-center space-x-1 text-slate-400">
                    <Shield className="w-3 h-3" />
                    <span>Security</span>
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}
