"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { ROUTES } from "@/constants/routes";
import { authApi } from "@/lib/api/auth";
import { useAuthStore } from "@/stores/auth-store";
import { useWorkspaceStore } from "@/stores/workspace-store";
import {
  Check,
  Star,
  Eye,
  EyeOff,
  ArrowRight,
  Shield,
  Loader2,
  Building2,
  MailCheck,
  ArrowLeft,
  RotateCcw,
  AlertCircle,
} from "lucide-react";
import { toast } from "sonner";

export default function RegisterPage() {
  const router = useRouter();

  // Wizard state: "FORM" | "OTP"
  const [step, setStep] = useState<"FORM" | "OTP">("FORM");

  // Form Fields
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [workspaceName, setWorkspaceName] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [agreeTerms, setAgreeTerms] = useState(true);

  // Field Errors & Touched
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [touched, setTouched] = useState<Record<string, boolean>>({});

  // Loading
  const [isLoading, setIsLoading] = useState(false);

  // OTP State: 6 digits
  const [otp, setOtp] = useState<string[]>(["", "", "", "", "", ""]);
  const otpInputRefs = useRef<(HTMLInputElement | null)[]>([]);
  const [resendCountdown, setResendCountdown] = useState(60);
  const [isResending, setIsResending] = useState(false);

  // Generate URL slug preview from workspace name
  const slug =
    workspaceName
      .toLowerCase()
      .trim()
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "my-workspace";

  // Password strength calculation
  const getPasswordStrength = (pass: string) => {
    let score = 0;
    if (pass.length >= 8) score++;
    if (/[A-Z]/.test(pass)) score++;
    if (/[a-z]/.test(pass)) score++;
    if (/[0-9]|[^A-Za-z0-9]/.test(pass)) score++;
    return score; // 0 - 4
  };

  const passwordScore = getPasswordStrength(password);

  // Resend Countdown Timer
  useEffect(() => {
    let timer: NodeJS.Timeout;
    if (step === "OTP" && resendCountdown > 0) {
      timer = setInterval(() => {
        setResendCountdown((prev) => prev - 1);
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, resendCountdown]);

  // Validation
  const validateField = (field: string, value: string) => {
    const newErrors = { ...errors };

    switch (field) {
      case "fullName":
        if (!value.trim()) {
          newErrors.fullName = "Full name is required";
        } else if (value.trim().length < 2) {
          newErrors.fullName = "Full name must be at least 2 characters";
        } else {
          delete newErrors.fullName;
        }
        break;

      case "email":
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!value.trim()) {
          newErrors.email = "Work email is required";
        } else if (!emailRegex.test(value.trim())) {
          newErrors.email = "Please enter a valid work email address";
        } else {
          delete newErrors.email;
        }
        break;

      case "workspaceName":
        if (!value.trim()) {
          newErrors.workspaceName = "Workspace name is required";
        } else if (value.trim().length < 2) {
          newErrors.workspaceName = "Workspace name must be at least 2 characters";
        } else {
          delete newErrors.workspaceName;
        }
        break;

      case "password":
        if (!value) {
          newErrors.password = "Password is required";
        } else if (value.length < 8) {
          newErrors.password = "Password must be at least 8 characters";
        } else if (!/[A-Z]/.test(value)) {
          newErrors.password = "Must contain at least 1 uppercase letter";
        } else if (!/[0-9]|[^A-Za-z0-9]/.test(value)) {
          newErrors.password = "Must contain at least 1 number or special character";
        } else {
          delete newErrors.password;
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleBlur = (field: string) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
    const val =
      field === "fullName"
        ? fullName
        : field === "email"
        ? email
        : field === "workspaceName"
        ? workspaceName
        : password;
    validateField(field, val);
  };

  // ─── Step 1: Submit Registration ──────────────────────────────────────────
  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();

    setTouched({
      fullName: true,
      email: true,
      workspaceName: true,
      password: true,
    });

    const isNameValid = validateField("fullName", fullName);
    const isEmailValid = validateField("email", email);
    const isWsValid = validateField("workspaceName", workspaceName);
    const isPassValid = validateField("password", password);

    if (!isNameValid || !isEmailValid || !isWsValid || !isPassValid) {
      toast.error("Please correct the errors in the form");
      return;
    }

    if (!agreeTerms) {
      toast.error("Please agree to the Terms of Service to proceed");
      return;
    }

    setIsLoading(true);

    try {
      const response = await authApi.register({
        name: fullName.trim(),
        email: email.trim().toLowerCase(),
        password,
        workspaceName: workspaceName.trim(),
      });

      toast.success(
        response.message || "Verification code sent to your email!"
      );
      setStep("OTP");
      setResendCountdown(60);

      // Auto-focus first OTP input on next render
      setTimeout(() => {
        otpInputRefs.current[0]?.focus();
      }, 100);
    } catch (err: any) {
      const apiMessage =
        err?.response?.data?.message ||
        err?.message ||
        "Registration failed. Please try again.";

      // If user is already registered and verified, offer to direct them to sign in
      if (err?.response?.status === 409) {
        toast.error("Account already registered and verified. Please sign in.", {
          action: {
            label: "Sign in",
            onClick: () => router.push(ROUTES.LOGIN),
          },
        });
      } else {
        toast.error(
          Array.isArray(apiMessage) ? apiMessage[0] : apiMessage
        );
      }
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Step 2: Handle OTP Change & Paste ─────────────────────────────────────
  const handleOtpChange = (index: number, value: string) => {
    if (!/^\d*$/.test(value)) return; // Numbers only

    const newOtp = [...otp];
    // Handle single character or last character typed
    newOtp[index] = value.slice(-1);
    setOtp(newOtp);

    // Auto-advance to next input box
    if (value && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpKeyDown = (
    index: number,
    e: React.KeyboardEvent<HTMLInputElement>
  ) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowLeft" && index > 0) {
      otpInputRefs.current[index - 1]?.focus();
    } else if (e.key === "ArrowRight" && index < 5) {
      otpInputRefs.current[index + 1]?.focus();
    }
  };

  const handleOtpPaste = (e: React.ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData("text").trim();
    if (!/^\d{1,6}$/.test(pastedData)) return;

    const digits = pastedData.split("").slice(0, 6);
    const newOtp = [...otp];
    digits.forEach((d, i) => {
      newOtp[i] = d;
    });
    setOtp(newOtp);

    // Focus last filled or 6th input
    const nextFocus = Math.min(digits.length, 5);
    otpInputRefs.current[nextFocus]?.focus();
  };

  // ─── Step 3: Verify OTP & Sign In ──────────────────────────────────────────
  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    const fullOtp = otp.join("");

    if (fullOtp.length < 6) {
      toast.error("Please enter the complete 6-digit verification code");
      return;
    }

    setIsLoading(true);

    try {
      const response = await authApi.verifyOtp({
        email: email.trim().toLowerCase(),
        otp: fullOtp,
        workspaceName: workspaceName.trim(),
      });

      // Update application auth store
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

      toast.success("Account verified! Launching workspace...");

      setTimeout(() => {
        router.push(ROUTES.DASHBOARD);
      }, 500);
    } catch (err: any) {
      const msg =
        err?.response?.data?.message ||
        "Invalid or expired verification code. Please check and try again.";
      toast.error(Array.isArray(msg) ? msg[0] : msg);
    } finally {
      setIsLoading(false);
    }
  };

  // ─── Step 4: Resend OTP ───────────────────────────────────────────────────
  const handleResendOtp = async () => {
    if (resendCountdown > 0 || isResending) return;

    setIsResending(true);
    try {
      await authApi.resendOtp({
        email: email.trim().toLowerCase(),
      });

      toast.success("A fresh 6-digit verification code has been sent!");
      setResendCountdown(60);
      setOtp(["", "", "", "", "", ""]);
      otpInputRefs.current[0]?.focus();
    } catch (err: any) {
      toast.error("Failed to resend verification code. Please try again.");
    } finally {
      setIsResending(false);
    }
  };

  return (
    <main className="w-full min-h-screen bg-[#faf8ff] dark:bg-[#051424] text-[#131b2e] dark:text-slate-100 flex items-center justify-center p-4 sm:p-6 lg:p-10 font-sans selection:bg-[#4F46E5] selection:text-white">
      <div className="w-full max-w-6xl mx-auto my-auto">
        <div className="grid grid-cols-1 lg:grid-cols-12 overflow-hidden rounded-2xl shadow-2xl bg-white dark:bg-[#0d1c2d] border border-slate-100 dark:border-[#1e2d42]">
          
          {/* ─── Left Branded Pane (Enterprise Dark Slate) ────────────────── */}
          <div className="lg:col-span-5 bg-[#283044] dark:bg-[#071321] text-[#eef0ff] p-8 lg:p-12 flex flex-col justify-between relative overflow-hidden lg:border-r dark:border-[#1e2d42]">
            {/* Ambient glows */}
            <div className="absolute -top-24 -left-24 w-80 h-80 rounded-full bg-[#4F46E5]/20 blur-3xl pointer-events-none" />
            <div className="absolute -bottom-24 -right-24 w-80 h-80 rounded-full bg-[#0051d5]/15 blur-3xl pointer-events-none" />

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
                  Project Execution Engine
                </span>
                <h1 className="text-3xl lg:text-4xl font-extrabold text-white leading-tight tracking-tight">
                  Unify your team.
                  <br />
                  Accelerate delivery.
                </h1>
                <p className="text-sm text-slate-300 leading-relaxed max-w-sm">
                  Get your team from design to deployment faster with automated
                  Kanban workflows, delivery analytics, and live team collaboration.
                </p>
              </div>

              {/* Value Pillars */}
              <div className="space-y-4 pt-2">
                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#4F46E5]/40 flex items-center justify-center shrink-0 mt-0.5 text-[#c3c0ff]">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">
                      14-Day Unlimited Pro Trial
                    </p>
                    <p className="text-xs text-slate-300">
                      No credit card required. Cancel or downgrade anytime.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#4F46E5]/40 flex items-center justify-center shrink-0 mt-0.5 text-[#c3c0ff]">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">
                      Automated Multi-Tenant Workspaces
                    </p>
                    <p className="text-xs text-slate-300">
                      Dedicated isolated project spaces with RBAC role governance
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-6 h-6 rounded-full bg-[#4F46E5]/40 flex items-center justify-center shrink-0 mt-0.5 text-[#c3c0ff]">
                    <Check className="w-3.5 h-3.5 stroke-[3]" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-white">
                      Zero-Latency Kanban Synchronization
                    </p>
                    <p className="text-xs text-slate-300">
                      Optimistic drag-and-drop task movements and live status cards
                    </p>
                  </div>
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
                &ldquo;TaskFlow eliminated delivery friction overnight. We shipped
                our core infrastructure milestone two weeks early without a single
                missed requirement.&rdquo;
              </p>
              <div className="flex items-center space-x-3">
                <img
                  className="w-10 h-10 rounded-full object-cover shadow-sm ring-2 ring-[#4F46E5]/40"
                  src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=120&auto=format&fit=crop&q=80"
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
            <div className="max-w-md w-full mx-auto space-y-6">

              {/* ─────────────────────────────────────────────────────────────
                  STATE A: REGISTRATION FORM
              ───────────────────────────────────────────────────────────── */}
              {step === "FORM" && (
                <>
                  {/* Header */}
                  <div className="space-y-1.5">
                    <div className="flex items-center justify-between">
                      <h2 className="text-2xl font-bold text-[#131b2e] dark:text-white tracking-tight">
                        Create your account
                      </h2>
                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded text-xs font-semibold bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300">
                        14-day free trial
                      </span>
                    </div>
                    <p className="text-sm text-[#464555] dark:text-slate-400">
                      Start organizing projects with your team in minutes
                    </p>
                  </div>

                  {/* Registration Form */}
                  <form onSubmit={handleRegister} className="space-y-4" noValidate>
                    {/* Full Name */}
                    <div className="space-y-1">
                      <label
                        className="block text-xs font-bold text-[#131b2e] dark:text-slate-200"
                        htmlFor="name-field"
                      >
                        Full Name <span className="text-rose-500">*</span>
                      </label>
                      <input
                        id="name-field"
                        type="text"
                        value={fullName}
                        onChange={(e) => {
                          setFullName(e.target.value);
                          if (touched.fullName) validateField("fullName", e.target.value);
                        }}
                        onBlur={() => handleBlur("fullName")}
                        placeholder="Alex Rivera"
                        required
                        className={`w-full h-10 px-3.5 bg-slate-50 dark:bg-[#08121f] border rounded-xl text-sm font-sans text-[#131b2e] dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all focus:outline-none focus:bg-white dark:focus:bg-[#08121f] ${
                          touched.fullName && errors.fullName
                            ? "border-rose-400 ring-2 ring-rose-400/20"
                            : "border-slate-200 dark:border-[#1e2d42] focus:ring-2 focus:ring-[#4F46E5]"
                        }`}
                      />
                      {touched.fullName && errors.fullName && (
                        <p className="text-xs text-rose-500 flex items-center gap-1 mt-1">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>{errors.fullName}</span>
                        </p>
                      )}
                    </div>

                    {/* Work Email */}
                    <div className="space-y-1">
                      <label
                        className="block text-xs font-bold text-[#131b2e] dark:text-slate-200"
                        htmlFor="email-field"
                      >
                        Work Email <span className="text-rose-500">*</span>
                      </label>
                      <input
                        id="email-field"
                        type="email"
                        value={email}
                        onChange={(e) => {
                          setEmail(e.target.value);
                          if (touched.email) validateField("email", e.target.value);
                        }}
                        onBlur={() => handleBlur("email")}
                        placeholder="alex@brightlabs.com"
                        required
                        className={`w-full h-10 px-3.5 bg-slate-50 dark:bg-[#08121f] border rounded-xl text-sm font-sans text-[#131b2e] dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all focus:outline-none focus:bg-white dark:focus:bg-[#08121f] ${
                          touched.email && errors.email
                            ? "border-rose-400 ring-2 ring-rose-400/20"
                            : "border-slate-200 dark:border-[#1e2d42] focus:ring-2 focus:ring-[#4F46E5]"
                        }`}
                      />
                      {touched.email && errors.email && (
                        <p className="text-xs text-rose-500 flex items-center gap-1 mt-1">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>{errors.email}</span>
                        </p>
                      )}
                    </div>

                    {/* Workspace Name */}
                    <div className="space-y-1">
                      <label
                        className="block text-xs font-bold text-[#131b2e] dark:text-slate-200"
                        htmlFor="workspace-field"
                      >
                        Workspace Name <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative flex items-center">
                        <Building2 className="w-4 h-4 absolute left-3.5 text-slate-400" />
                        <input
                          id="workspace-field"
                          type="text"
                          value={workspaceName}
                          onChange={(e) => {
                            setWorkspaceName(e.target.value);
                            if (touched.workspaceName) validateField("workspaceName", e.target.value);
                          }}
                          onBlur={() => handleBlur("workspaceName")}
                          placeholder="BrightLabs Core"
                          required
                          className={`w-full h-10 pl-10 pr-3.5 bg-slate-50 dark:bg-[#08121f] border rounded-xl text-sm font-sans text-[#131b2e] dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all focus:outline-none focus:bg-white dark:focus:bg-[#08121f] ${
                            touched.workspaceName && errors.workspaceName
                              ? "border-rose-400 ring-2 ring-rose-400/20"
                              : "border-slate-200 dark:border-[#1e2d42] focus:ring-2 focus:ring-[#4F46E5]"
                          }`}
                        />
                      </div>
                      {touched.workspaceName && errors.workspaceName ? (
                        <p className="text-xs text-rose-500 flex items-center gap-1 mt-1">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>{errors.workspaceName}</span>
                        </p>
                      ) : (
                        workspaceName && (
                          <p className="text-[11px] text-slate-400 font-mono pl-1">
                            URL: taskflow.app/{slug}
                          </p>
                        )
                      )}
                    </div>

                    {/* Password with Strength Meter */}
                    <div className="space-y-1">
                      <label
                        className="block text-xs font-bold text-[#131b2e] dark:text-slate-200"
                        htmlFor="password-field"
                      >
                        Password <span className="text-rose-500">*</span>
                      </label>
                      <div className="relative flex items-center">
                        <input
                          id="password-field"
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => {
                            setPassword(e.target.value);
                            if (touched.password) validateField("password", e.target.value);
                          }}
                          onBlur={() => handleBlur("password")}
                          placeholder="Min. 8 characters"
                          required
                          className={`w-full h-10 pl-3.5 pr-10 bg-slate-50 dark:bg-[#08121f] border rounded-xl text-sm font-sans text-[#131b2e] dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 transition-all focus:outline-none focus:bg-white dark:focus:bg-[#08121f] ${
                            touched.password && errors.password
                              ? "border-rose-400 ring-2 ring-rose-400/20"
                              : "border-slate-200 dark:border-[#1e2d42] focus:ring-2 focus:ring-[#4F46E5]"
                          }`}
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
                        <div className="space-y-1.5 pt-1">
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
                              Requires 8+ chars, uppercase, & number
                            </span>
                          </div>
                        </div>
                      )}

                      {touched.password && errors.password && (
                        <p className="text-xs text-rose-500 flex items-center gap-1 mt-1">
                          <AlertCircle className="w-3.5 h-3.5 shrink-0" />
                          <span>{errors.password}</span>
                        </p>
                      )}
                    </div>

                    {/* Agree Terms */}
                    <div className="flex items-start space-x-2 pt-1">
                      <input
                        id="agree-terms"
                        type="checkbox"
                        checked={agreeTerms}
                        onChange={(e) => setAgreeTerms(e.target.checked)}
                        className="w-4 h-4 mt-0.5 rounded border-slate-300 dark:border-slate-600 text-[#4F46E5] focus:ring-[#4F46E5] cursor-pointer"
                      />
                      <label
                        htmlFor="agree-terms"
                        className="text-xs text-[#464555] dark:text-slate-400 cursor-pointer select-none leading-snug"
                      >
                        I agree to the{" "}
                        <Link href="/terms" className="text-[#4F46E5] dark:text-indigo-400 hover:underline">
                          Terms of Service
                        </Link>{" "}
                        and{" "}
                        <Link href="/privacy" className="text-[#4F46E5] dark:text-indigo-400 hover:underline">
                          Privacy Policy
                        </Link>
                      </label>
                    </div>

                    {/* Submit Button */}
                    <div className="pt-2">
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="w-full h-11 bg-[#4F46E5] hover:bg-[#3525cd] text-white font-bold text-sm rounded-xl shadow-md transition-all duration-150 active:scale-[0.98] flex items-center justify-center space-x-2 disabled:opacity-70 cursor-pointer"
                      >
                        {isLoading ? (
                          <>
                            <Loader2 className="w-4 h-4 animate-spin" />
                            <span>Sending Verification Code...</span>
                          </>
                        ) : (
                          <>
                            <span>Create Account</span>
                            <ArrowRight className="w-4 h-4" />
                          </>
                        )}
                      </button>
                    </div>
                  </form>
                </>
              )}

              {/* ─────────────────────────────────────────────────────────────
                  STATE B: INLINE OTP VERIFICATION (Inside the exact register section)
              ───────────────────────────────────────────────────────────── */}
              {step === "OTP" && (
                <div className="space-y-6 animate-in fade-in slide-in-from-right-4 duration-300">
                  {/* Back button */}
                  <button
                    type="button"
                    onClick={() => setStep("FORM")}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-500 hover:text-slate-800 dark:hover:text-slate-200 transition-colors cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Back to registration details</span>
                  </button>

                  {/* Header */}
                  <div className="space-y-2">
                    <div className="w-12 h-12 rounded-xl bg-indigo-50 dark:bg-indigo-950/60 border border-indigo-200 dark:border-indigo-800/80 flex items-center justify-center text-[#4F46E5] dark:text-indigo-400 shadow-xs">
                      <MailCheck className="w-6 h-6" />
                    </div>
                    <h2 className="text-2xl font-bold text-[#131b2e] dark:text-white tracking-tight">
                      Verify your work email
                    </h2>
                    <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">
                      We sent a 6-digit confirmation code to{" "}
                      <span className="font-semibold text-slate-900 dark:text-slate-100 font-mono">
                        {email}
                      </span>
                      . Enter it below to activate your workspace.
                    </p>
                  </div>

                  {/* OTP 6-Digit Form */}
                  <form onSubmit={handleVerifyOtp} className="space-y-6">
                    <div className="space-y-2">
                      <label className="block text-xs font-bold text-[#131b2e] dark:text-slate-200">
                        6-Digit Security Code
                      </label>
                      <div
                        className="grid grid-cols-6 gap-2 sm:gap-3"
                        onPaste={handleOtpPaste}
                      >
                        {otp.map((digit, idx) => (
                          <input
                            key={idx}
                            ref={(el) => {
                              otpInputRefs.current[idx] = el;
                            }}
                            type="text"
                            inputMode="numeric"
                            maxLength={1}
                            value={digit}
                            onChange={(e) => handleOtpChange(idx, e.target.value)}
                            onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                            className="w-full h-12 sm:h-14 text-center font-mono text-xl font-bold bg-slate-50 dark:bg-[#08121f] border border-slate-200 dark:border-[#1e2d42] text-[#131b2e] dark:text-white rounded-xl focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:bg-white dark:focus:bg-[#08121f] transition-all shadow-xs"
                          />
                        ))}
                      </div>
                      <p className="text-[11px] text-slate-400">
                        Tip: You can paste all 6 digits directly into any box.
                      </p>
                    </div>

                    {/* Verify Button */}
                    <button
                      type="submit"
                      disabled={isLoading || otp.join("").length < 6}
                      className="w-full h-11 bg-[#4F46E5] hover:bg-[#3525cd] text-white font-bold text-sm rounded-xl shadow-md transition-all duration-150 active:scale-[0.98] flex items-center justify-center space-x-2 disabled:opacity-50 cursor-pointer"
                    >
                      {isLoading ? (
                        <>
                          <Loader2 className="w-4 h-4 animate-spin" />
                          <span>Verifying & Setting Up Workspace...</span>
                        </>
                      ) : (
                        <>
                          <span>Verify & Launch Workspace</span>
                          <ArrowRight className="w-4 h-4" />
                        </>
                      )}
                    </button>

                    {/* Resend and Countdown */}
                    <div className="flex items-center justify-between pt-1 text-xs">
                      <span className="text-slate-500 dark:text-slate-400">
                        Didn&apos;t receive the code?
                      </span>
                      {resendCountdown > 0 ? (
                        <span className="text-slate-400 font-mono text-xs">
                          Resend in {resendCountdown}s
                        </span>
                      ) : (
                        <button
                          type="button"
                          onClick={handleResendOtp}
                          disabled={isResending}
                          className="inline-flex items-center gap-1 text-[#4F46E5] dark:text-indigo-400 font-bold hover:underline cursor-pointer disabled:opacity-50"
                        >
                          {isResending ? (
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                          ) : (
                            <RotateCcw className="w-3.5 h-3.5" />
                          )}
                          <span>Resend Code</span>
                        </button>
                      )}
                    </div>
                  </form>
                </div>
              )}

              {/* Sign in redirect */}
              <div className="text-center pt-2">
                <span className="text-xs text-[#464555] dark:text-slate-400">
                  Already have a verified account?
                </span>
                <Link
                  href={ROUTES.LOGIN}
                  className="text-xs text-[#4F46E5] dark:text-indigo-400 hover:text-[#3525cd] font-bold ml-1.5 transition-colors"
                >
                  Sign in
                </Link>
              </div>
            </div>

            {/* Bottom Legal bar */}
            <div className="max-w-md w-full mx-auto pt-6 border-t border-slate-100 dark:border-[#1e2d42]">
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
