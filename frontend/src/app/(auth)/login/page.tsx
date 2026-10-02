"use client";

import React, { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants/routes";
import { authApi } from "@/lib/api/auth";
import { useAuthStore } from "@/stores/auth-store";
import {
  Check,
  Star,
  Eye,
  EyeOff,
  ArrowRight,
  Shield,
  Loader2,
  Sparkles,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

export default function LoginPage() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberDevice, setRememberDevice] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMessage(null);

    if (!email.trim()) {
      const msg = "Please enter your email address";
      setErrorMessage(msg);
      toast.error(msg);
      return;
    }
    if (!password) {
      const msg = "Please enter your password";
      setErrorMessage(msg);
      toast.error(msg);
      return;
    }

    setIsLoading(true);

    try {
      const response = await authApi.login({
        email: email.trim().toLowerCase(),
        password,
      });

      useAuthStore.getState().setUser({
        id: response.user?.id || "user-id",
        name: response.user?.name || email.split("@")[0].replace(".", " "),
        email: email.trim().toLowerCase(),
      });

      toast.success(response.message || "Welcome back! Entering workspace...");

      setTimeout(() => {
        router.push(ROUTES.DASHBOARD);
      }, 500);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Invalid email or password. Please try again.";

      const displayMsg = Array.isArray(msg) ? msg[0] : msg;
      setErrorMessage(displayMsg);

      if (
        typeof displayMsg === "string" &&
        displayMsg.toLowerCase().includes("verify your email")
      ) {
        toast.error("Please verify your email before logging in.", {
          action: {
            label: "Verify OTP",
            onClick: () => router.push(ROUTES.REGISTER),
          },
        });
      } else {
        toast.error(displayMsg);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const handleGoogleSignIn = () => {
    toast.info(
      "Google OAuth sign-in will be available soon. Please enter your registered email and password."
    );
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
                <span className="inline-flex items-center px-2.5 py-1 rounded-full text-xs font-semibold bg-[#4F46E5]/30 text-[#c3c0ff] tracking-wide border border-[#4F46E5]/40">
                  Productivity OS
                </span>
                <h1 className="text-3xl lg:text-4xl font-extrabold text-white leading-tight tracking-tight">
                  Plan better.
                  <br />
                  Work smarter.
                  <br />
                  Ship faster.
                </h1>
                <p className="text-sm text-slate-300 leading-relaxed max-w-sm">
                  Centralize projects, roadmaps, and cross-team dependencies in a
                  high-velocity workspace built for scale.
                </p>
              </div>

              {/* Value Pillars */}
              <div className="space-y-3 pt-2">
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 rounded-full bg-[#4F46E5]/40 flex items-center justify-center text-[#c3c0ff]">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <span className="text-sm text-white/90">
                    SOC-2 Type II compliant workspace
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 rounded-full bg-[#4F46E5]/40 flex items-center justify-center text-[#c3c0ff]">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <span className="text-sm text-white/90">
                    99.99% historical uptime SLA
                  </span>
                </div>
                <div className="flex items-center space-x-3">
                  <div className="w-5 h-5 rounded-full bg-[#4F46E5]/40 flex items-center justify-center text-[#c3c0ff]">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <span className="text-sm text-white/90">
                    End-to-end data encryption at rest
                  </span>
                </div>
              </div>
            </div>

            {/* Testimonial Quote Block */}
            <div className="relative z-10 pt-6 mt-8 bg-black/20 backdrop-blur-sm rounded-xl p-5 border border-white/10">
              <div className="flex items-center space-x-1 text-amber-400 mb-2.5">
                {[...Array(5)].map((_, i) => (
                  <Star key={i} className="w-3.5 h-3.5 fill-amber-400" />
                ))}
              </div>
              <p className="text-sm text-white/95 italic mb-4 leading-snug">
                &ldquo;TaskFlow cut our project chaos in half. It is the single
                most valuable tool in our product stack.&rdquo;
              </p>
              <div className="flex items-center space-x-3">
                <img
                  className="w-10 h-10 rounded-full object-cover shadow-sm ring-2 ring-[#4F46E5]/40"
                  src="/images/sarah-mitchell.jpg"
                  alt="Sarah Mitchell"
                />
                <div>
                  <div className="text-xs font-bold text-white">
                    Sarah Mitchell
                  </div>
                  <div className="text-[11px] text-slate-300">
                    VP Product at Northstar Labs
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* ─── Right Form Pane (White / Dark Surface) ───────────────────── */}
          <div className="lg:col-span-7 bg-white dark:bg-[#0d1c2d] p-8 sm:p-12 lg:p-16 flex flex-col justify-between">
            <div className="max-w-md w-full mx-auto space-y-7">
              {/* Header */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <h2 className="text-2xl font-bold text-[#131b2e] dark:text-white tracking-tight">
                    Welcome back
                  </h2>
                  <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded text-xs font-semibold bg-[#e2dfff] dark:bg-indigo-950/80 text-[#3525cd] dark:text-indigo-300">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#4F46E5] animate-pulse" />
                    v2.8 live
                  </span>
                </div>
                <p className="text-sm text-[#464555] dark:text-slate-400">
                  Enter your credentials to access your workspace
                </p>
              </div>

              {/* Social Login Button */}
              <div className="space-y-4">
                <button
                  type="button"
                  onClick={handleGoogleSignIn}
                  className="w-full h-11 px-4 flex items-center justify-center space-x-3 bg-slate-50 dark:bg-[#132337] hover:bg-slate-100 dark:hover:bg-[#162536] border border-slate-200 dark:border-[#1e2d42] transition-colors duration-150 rounded-xl shadow-xs text-sm font-semibold text-[#131b2e] dark:text-white active:scale-[0.99] cursor-pointer"
                >
                  <svg
                    aria-hidden="true"
                    className="w-5 h-5 flex-shrink-0"
                    viewBox="0 0 24 24"
                  >
                    <path
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                      fill="#4285F4"
                    />
                    <path
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                      fill="#34A853"
                    />
                    <path
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                      fill="#FBBC05"
                    />
                    <path
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                      fill="#EA4335"
                    />
                  </svg>
                  <span>Continue with Google</span>
                </button>

                <div className="relative flex items-center justify-center">
                  <div className="w-full h-px bg-slate-200 dark:bg-[#1e2d42]" />
                  <span className="absolute bg-white dark:bg-[#0d1c2d] px-3 text-[11px] font-bold text-slate-400 uppercase tracking-wider">
                    or continue with email
                  </span>
                </div>

                {/* Email Form */}
                <form onSubmit={handleLogin} className="space-y-4">
                  {/* Inline Error Alert */}
                  {errorMessage && (
                    <div
                      id="login-error-alert"
                      role="alert"
                      className="flex items-start gap-2.5 p-3.5 rounded-xl bg-rose-500/10 dark:bg-rose-500/15 border border-rose-500/30 text-rose-600 dark:text-rose-400 text-xs font-semibold leading-relaxed animate-in fade-in duration-200"
                    >
                      <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                      <div className="flex-1">
                        <span>{errorMessage}</span>
                      </div>
                    </div>
                  )}

                  <div className="space-y-1.5">
                    <label
                      className="block text-xs font-bold text-[#131b2e] dark:text-slate-200"
                      htmlFor="email-field"
                    >
                      Email address
                    </label>
                    <input
                      id="email-field"
                      type="email"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (errorMessage) setErrorMessage(null);
                      }}
                      placeholder="name@company.com"
                      required
                      className="w-full h-11 px-3.5 bg-slate-50 dark:bg-[#08121f] border border-slate-200 dark:border-[#1e2d42] text-[#131b2e] dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:bg-white dark:focus:bg-[#08121f] transition-all font-sans"
                    />
                  </div>

                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <label
                        className="block text-xs font-bold text-[#131b2e] dark:text-slate-200"
                        htmlFor="password-field"
                      >
                        Password
                      </label>
                      <Link
                        href={ROUTES.FORGOT_PASSWORD}
                        className="text-xs text-[#4F46E5] dark:text-indigo-400 hover:text-[#3525cd] font-semibold transition-colors cursor-pointer"
                      >
                        Forgot password?
                      </Link>
                    </div>
                    <div className="relative flex items-center">
                      <input
                        id="password-field"
                        type={showPassword ? "text" : "password"}
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value);
                          if (errorMessage) setErrorMessage(null);
                        }}
                        placeholder="••••••••••••"
                        required
                        className="w-full h-11 pl-3.5 pr-10 bg-slate-50 dark:bg-[#08121f] border border-slate-200 dark:border-[#1e2d42] text-[#131b2e] dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:bg-white dark:focus:bg-[#08121f] transition-all font-sans"
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
                  </div>

                  <div className="flex items-center space-x-2 pt-1">
                    <input
                      id="remember-device"
                      type="checkbox"
                      checked={rememberDevice}
                      onChange={(e) => setRememberDevice(e.target.checked)}
                      className="w-4 h-4 rounded border-slate-300 dark:border-slate-600 text-[#4F46E5] focus:ring-[#4F46E5]"
                    />
                    <label
                      htmlFor="remember-device"
                      className="text-xs text-[#464555] dark:text-slate-400 cursor-pointer select-none font-medium"
                    >
                      Remember this device for 30 days
                    </label>
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
                          <span>Authenticating...</span>
                        </>
                      ) : (
                        <>
                          <span>Sign In</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>
                  </div>
                </form>

                <div className="text-center pt-2">
                  <span className="text-xs text-[#464555] dark:text-slate-400">
                    Don&apos;t have an account?
                  </span>
                  <Link
                    href={ROUTES.REGISTER}
                    className="text-xs text-[#4F46E5] dark:text-indigo-400 hover:text-[#3525cd] font-bold ml-1.5 transition-colors"
                  >
                    Create account
                  </Link>
                </div>
              </div>
            </div>

            {/* Bottom Legal bar */}
            <div className="max-w-md w-full mx-auto pt-8 mt-6 border-t border-slate-100 dark:border-[#1e2d42]">
              <div className="flex flex-wrap items-center justify-between text-slate-400 text-xs">
                <span>© 2026 TaskFlow Inc.</span>
                <div className="flex items-center space-x-3">
                  <Link href="/terms" className="hover:text-[#131b2e] dark:hover:text-white transition-colors">
                    Terms
                  </Link>
                  <span>•</span>
                  <Link href="/privacy" className="hover:text-[#131b2e] dark:hover:text-white transition-colors">
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
