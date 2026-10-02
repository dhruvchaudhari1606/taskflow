"use client";

import React, { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import { ROUTES } from "@/constants/routes";
import { authApi } from "@/lib/api/auth";
import {
  Check,
  Eye,
  EyeOff,
  ArrowRight,
  ArrowLeft,
  Shield,
  Loader2,
  Lock,
  KeyRound,
  AlertCircle,
  CheckCircle2,
} from "lucide-react";
import { toast } from "sonner";

function ResetPasswordForm() {
  const router = useRouter();
  const searchParams = useSearchParams();

  // Read initial params from URL if present
  const initialEmail = searchParams.get("email") || "";
  const initialToken = searchParams.get("token") || "";

  const [email, setEmail] = useState(initialEmail);
  const [token, setToken] = useState(initialToken);
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  // Status & Validation
  const [isLoading, setIsLoading] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [redirectCountdown, setRedirectCountdown] = useState(3);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Auto redirect countdown on success
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (isSuccess && redirectCountdown > 0) {
      timer = setInterval(() => {
        setRedirectCountdown((prev) => prev - 1);
      }, 1000);
    } else if (isSuccess && redirectCountdown === 0) {
      router.push(ROUTES.LOGIN);
    }
    return () => clearInterval(timer);
  }, [isSuccess, redirectCountdown, router]);

  // Password rules validation
  const rules = {
    hasLength: password.length >= 8 && password.length <= 128,
    hasUpper: /[A-Z]/.test(password),
    hasLower: /[a-z]/.test(password),
    hasNumberOrSpecial: /[0-9]|[!@#$%^&*(),.?":{}|<>]/.test(password),
  };

  const isPasswordValid =
    rules.hasLength &&
    rules.hasUpper &&
    rules.hasLower &&
    rules.hasNumberOrSpecial;

  const passwordsMatch = password.length > 0 && password === confirmPassword;

  const validate = () => {
    const errs: Record<string, string> = {};

    if (!email.trim()) {
      errs.email = "Email address is required";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email.trim())) {
      errs.email = "Please enter a valid work email address";
    }

    if (!token.trim()) {
      errs.token = "Reset token is required";
    } else if (token.trim().length < 8) {
      errs.token = "Token appears to be invalid or incomplete";
    }

    if (!password) {
      errs.password = "New password is required";
    } else if (!isPasswordValid) {
      errs.password =
        "Password must be at least 8 characters and include uppercase, lowercase, and a number or symbol";
    }

    if (!confirmPassword) {
      errs.confirmPassword = "Please confirm your new password";
    } else if (password !== confirmPassword) {
      errs.confirmPassword = "Passwords do not match";
    }

    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setTouched({
      email: true,
      token: true,
      password: true,
      confirmPassword: true,
    });

    if (!validate()) {
      toast.error("Please fix the validation errors before submitting");
      return;
    }

    setIsLoading(true);

    try {
      const res = await authApi.resetPassword({
        email: email.trim().toLowerCase(),
        token: token.trim(),
        password,
      });

      setIsSuccess(true);
      toast.success(res?.message || "Password has been successfully reset!");
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Failed to reset password. The token may be expired or invalid.";
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
                  <Lock className="w-3.5 h-3.5" />
                  Password Update
                </span>
                <h1 className="text-3xl lg:text-4xl font-extrabold text-white leading-tight tracking-tight">
                  Set a new
                  <br />
                  strong password.
                </h1>
                <p className="text-sm text-slate-300 leading-relaxed max-w-sm">
                  Choose a robust password to safeguard your workspace, tasks,
                  and sensitive team documents.
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
                      Bcrypt multi-round hashing
                    </span>
                    <span className="text-xs text-slate-300">
                      State-of-the-art cryptographic salt protection.
                    </span>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-5 h-5 rounded-full bg-[#4F46E5]/40 flex items-center justify-center text-[#c3c0ff] mt-0.5 flex-shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <div className="text-sm text-white/90">
                    <span className="font-semibold block text-white">
                      All sessions revoked
                    </span>
                    <span className="text-xs text-slate-300">
                      Any existing sessions or compromised devices are kicked out.
                    </span>
                  </div>
                </div>

                <div className="flex items-start space-x-3">
                  <div className="w-5 h-5 rounded-full bg-[#4F46E5]/40 flex items-center justify-center text-[#c3c0ff] mt-0.5 flex-shrink-0">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <div className="text-sm text-white/90">
                    <span className="font-semibold block text-white">
                      Instant single-use invalidation
                    </span>
                    <span className="text-xs text-slate-300">
                      This reset token cannot be reused once submitted.
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
                  Security Notification
                </span>
                You will receive an email confirmation as soon as your password is updated.
              </div>
            </div>
          </div>

          {/* ─── Right Form Pane (White / Dark Surface) ───────────────────── */}
          <div className="lg:col-span-7 bg-white dark:bg-[#0d1c2d] p-8 sm:p-12 lg:p-16 flex flex-col justify-between">
            <div className="max-w-md w-full mx-auto space-y-6">
              {/* Back to sign in link */}
              <div>
                <Link
                  href={ROUTES.LOGIN}
                  className="inline-flex items-center text-xs font-semibold text-slate-500 hover:text-[#4F46E5] dark:text-slate-400 dark:hover:text-indigo-400 transition-colors group cursor-pointer"
                >
                  <ArrowLeft className="w-4 h-4 mr-1.5 transition-transform group-hover:-translate-x-1" />
                  Back to sign in
                </Link>
              </div>

              {!isSuccess ? (
                /* Password Reset Form */
                <div className="space-y-6">
                  <div className="space-y-1.5">
                    <h2 className="text-2xl font-bold text-[#131b2e] dark:text-white tracking-tight">
                      Reset your password
                    </h2>
                    <p className="text-sm text-[#464555] dark:text-slate-400">
                      Enter your account email, confirmation token, and new password.
                    </p>
                  </div>

                  {!initialToken && (
                    <div className="p-3 rounded-xl bg-indigo-50 dark:bg-indigo-950/40 border border-indigo-200 dark:border-indigo-800 text-xs text-indigo-900 dark:text-indigo-200 flex items-start gap-2.5">
                      <AlertCircle className="w-4 h-4 text-[#4F46E5] flex-shrink-0 mt-0.5" />
                      <span>
                        If you clicked a reset link from your email, the token will be filled
                        automatically. Otherwise, please paste your reset token below.
                      </span>
                    </div>
                  )}

                  <form onSubmit={handleSubmit} className="space-y-4">
                    {/* Email Input */}
                    <div className="space-y-1.5">
                      <label
                        className="block text-xs font-bold text-[#131b2e] dark:text-slate-200"
                        htmlFor="email"
                      >
                        Email address
                      </label>
                      <input
                        id="email"
                        type="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (touched.email) validate();
                        }}
                        placeholder="name@company.com"
                        required
                        className={`w-full h-11 px-3.5 bg-slate-50 dark:bg-[#08121f] border text-[#131b2e] dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:bg-white dark:focus:bg-[#08121f] transition-all font-sans ${
                          errors.email && touched.email
                            ? "border-red-500 focus:ring-red-400"
                            : "border-slate-200 dark:border-[#1e2d42]"
                        }`}
                      />
                      {errors.email && touched.email && (
                        <p className="text-xs text-red-600 dark:text-red-400 font-medium">
                          {errors.email}
                        </p>
                      )}
                    </div>

                    {/* Reset Token Input */}
                    <div className="space-y-1.5">
                      <label
                        className="block text-xs font-bold text-[#131b2e] dark:text-slate-200"
                        htmlFor="token"
                      >
                        Reset token
                      </label>
                      <input
                        id="token"
                        type="text"
                        value={token}
                        onChange={(e) => {
                          setToken(e.target.value);
                          if (touched.token) validate();
                        }}
                        placeholder="Paste your 64-character token"
                        required
                        className={`w-full h-11 px-3.5 font-mono text-xs bg-slate-50 dark:bg-[#08121f] border text-[#131b2e] dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:bg-white dark:focus:bg-[#08121f] transition-all ${
                          errors.token && touched.token
                            ? "border-red-500 focus:ring-red-400"
                            : "border-slate-200 dark:border-[#1e2d42]"
                        }`}
                      />
                      {errors.token && touched.token && (
                        <p className="text-xs text-red-600 dark:text-red-400 font-medium">
                          {errors.token}
                        </p>
                      )}
                    </div>

                    {/* New Password Input */}
                    <div className="space-y-1.5">
                      <label
                        className="block text-xs font-bold text-[#131b2e] dark:text-slate-200"
                        htmlFor="new-password"
                      >
                        New password
                      </label>
                      <div className="relative flex items-center">
                        <input
                          id="new-password"
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => {
                            setPassword(e.target.value);
                            if (touched.password) validate();
                          }}
                          placeholder="Min 8 chars, uppercase, lowercase & symbol"
                          required
                          className={`w-full h-11 pl-3.5 pr-10 bg-slate-50 dark:bg-[#08121f] border text-[#131b2e] dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:bg-white dark:focus:bg-[#08121f] transition-all font-sans ${
                            errors.password && touched.password
                              ? "border-red-500 focus:ring-red-400"
                              : "border-slate-200 dark:border-[#1e2d42]"
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() => setShowPassword(!showPassword)}
                          className="absolute right-3 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded cursor-pointer"
                        >
                          {showPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>

                      {/* Password Criteria Checklist */}
                      <div className="grid grid-cols-2 gap-1.5 pt-1 text-[11px]">
                        <span
                          className={`flex items-center gap-1.5 ${
                            rules.hasLength
                              ? "text-emerald-600 dark:text-emerald-400 font-semibold"
                              : "text-slate-400 dark:text-slate-500"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              rules.hasLength ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-600"
                            }`}
                          />
                          8+ characters
                        </span>
                        <span
                          className={`flex items-center gap-1.5 ${
                            rules.hasUpper
                              ? "text-emerald-600 dark:text-emerald-400 font-semibold"
                              : "text-slate-400 dark:text-slate-500"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              rules.hasUpper ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-600"
                            }`}
                          />
                          1 uppercase
                        </span>
                        <span
                          className={`flex items-center gap-1.5 ${
                            rules.hasLower
                              ? "text-emerald-600 dark:text-emerald-400 font-semibold"
                              : "text-slate-400 dark:text-slate-500"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              rules.hasLower ? "bg-emerald-500" : "bg-slate-300 dark:bg-slate-600"
                            }`}
                          />
                          1 lowercase
                        </span>
                        <span
                          className={`flex items-center gap-1.5 ${
                            rules.hasNumberOrSpecial
                              ? "text-emerald-600 dark:text-emerald-400 font-semibold"
                              : "text-slate-400 dark:text-slate-500"
                          }`}
                        >
                          <span
                            className={`w-1.5 h-1.5 rounded-full ${
                              rules.hasNumberOrSpecial
                                ? "bg-emerald-500"
                                : "bg-slate-300 dark:bg-slate-600"
                            }`}
                          />
                          1 number/symbol
                        </span>
                      </div>

                      {errors.password && touched.password && (
                        <p className="text-xs text-red-600 dark:text-red-400 font-medium pt-1">
                          {errors.password}
                        </p>
                      )}
                    </div>

                    {/* Confirm Password Input */}
                    <div className="space-y-1.5">
                      <label
                        className="block text-xs font-bold text-[#131b2e] dark:text-slate-200"
                        htmlFor="confirm-password"
                      >
                        Confirm new password
                      </label>
                      <div className="relative flex items-center">
                        <input
                          id="confirm-password"
                          type={showConfirmPassword ? "text" : "password"}
                          value={confirmPassword}
                          onChange={(e) => {
                            setConfirmPassword(e.target.value);
                            if (touched.confirmPassword) validate();
                          }}
                          placeholder="Re-enter your new password"
                          required
                          className={`w-full h-11 pl-3.5 pr-10 bg-slate-50 dark:bg-[#08121f] border text-[#131b2e] dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:bg-white dark:focus:bg-[#08121f] transition-all font-sans ${
                            errors.confirmPassword && touched.confirmPassword
                              ? "border-red-500 focus:ring-red-400"
                              : passwordsMatch
                                ? "border-emerald-500 dark:border-emerald-500"
                                : "border-slate-200 dark:border-[#1e2d42]"
                          }`}
                        />
                        <button
                          type="button"
                          onClick={() =>
                            setShowConfirmPassword(!showConfirmPassword)
                          }
                          className="absolute right-3 p-1 text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 rounded cursor-pointer"
                        >
                          {showConfirmPassword ? (
                            <EyeOff className="w-4 h-4" />
                          ) : (
                            <Eye className="w-4 h-4" />
                          )}
                        </button>
                      </div>
                      {errors.confirmPassword && touched.confirmPassword && (
                        <p className="text-xs text-red-600 dark:text-red-400 font-medium">
                          {errors.confirmPassword}
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
                            <span>Updating password...</span>
                          </>
                        ) : (
                          <>
                            <span>Update Password</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </div>
              ) : (
                /* Success State Card */
                <div className="space-y-6 text-center animate-in fade-in zoom-in-95 duration-200 py-4">
                  <div className="w-16 h-16 rounded-2xl bg-emerald-50 dark:bg-emerald-950/60 border border-emerald-200 dark:border-emerald-800 flex items-center justify-center text-emerald-600 dark:text-emerald-400 mx-auto shadow-md">
                    <CheckCircle2 className="w-8 h-8" />
                  </div>
                  <div className="space-y-2">
                    <h2 className="text-2xl font-bold text-[#131b2e] dark:text-white">
                      Password Reset Complete!
                    </h2>
                    <p className="text-sm text-[#464555] dark:text-slate-300 leading-relaxed max-w-sm mx-auto">
                      Your password has been securely updated and all previous
                      sessions have been signed out.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-xl bg-slate-50 dark:bg-[#08121f] border border-slate-200 dark:border-[#1e2d42] text-xs text-[#464555] dark:text-slate-400">
                    Redirecting to sign in page in{" "}
                    <span className="font-bold text-[#4F46E5] dark:text-indigo-400">
                      {redirectCountdown} seconds
                    </span>
                    ...
                  </div>

                  <Link
                    href={ROUTES.LOGIN}
                    className="w-full h-11 bg-[#4F46E5] hover:bg-[#3525cd] text-white font-bold text-sm rounded-xl shadow-md transition-all duration-150 flex items-center justify-center space-x-2"
                  >
                    <span>Sign In Now</span>
                    <ArrowRight className="w-4 h-4" />
                  </Link>
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

export default function ResetPasswordPage() {
  return (
    <Suspense
      fallback={
        <div className="w-full min-h-screen bg-[#faf8ff] dark:bg-[#051424] flex items-center justify-center">
          <Loader2 className="w-8 h-8 text-[#4F46E5] animate-spin" />
        </div>
      }
    >
      <ResetPasswordForm />
    </Suspense>
  );
}
