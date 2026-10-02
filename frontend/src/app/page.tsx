"use client";

import React, { useState } from "react";
import Link from "next/link";
import { PublicHeader } from "@/components/layout/public-header";
import { PublicFooter } from "@/components/layout/public-footer";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import {
  ArrowRight,
  Bolt,
  PlayCircle,
  CheckCircle2,
  Search,
  Sparkles,
  FolderKanban,
  CheckCircle,
  Kanban,
  Users,
  TrendingUp,
  ShieldCheck,
  ChevronDown,
  Star,
  Layers,
  Calendar,
  Paperclip,
  MessageSquare,
  Flame,
} from "lucide-react";

// ─── FAQ Data ────────────────────────────────────────────────────────────────

const faqs = [
  {
    question: "What is TaskFlow?",
    answer:
      "TaskFlow is a modern, high-velocity project management and team execution platform engineered for high-output software teams, product designers, and cross-functional builders.",
  },
  {
    question: "Can I use TaskFlow with my team?",
    answer:
      "Yes! TaskFlow supports unlimited workspaces, role-based access control, real-time shared boards, activity feeds, and presence cursors so teams stay in lockstep.",
  },
  {
    question: "Does TaskFlow support Kanban boards?",
    answer:
      "Fully. You can create customized Kanban columns, define WIP (Work In Progress) constraints, map priority levels, and drag & drop tasks smoothly across workflow stages.",
  },
  {
    question: "Can I assign tasks to team members?",
    answer:
      "Absolutely. You can assign single or multiple contributors, set reviewers, append time estimates, add labels, and tag collaborators for notifications.",
  },
  {
    question: "Is there a free plan?",
    answer:
      "Yes, our Free plan is free forever for up to 3 projects and core task tracking. There are zero artificial time limits or forced credit card requests.",
  },
  {
    question: "Can I upgrade later?",
    answer:
      "You can upgrade, downgrade, or pause plans at any moment from your workspace settings page. Pro-rated balances apply immediately.",
  },
];

export default function LandingPage() {
  const [openFaq, setOpenFaq] = useState<number | null>(0);

  const toggleFaq = (index: number) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  return (
    <div className="min-h-screen bg-[#faf8ff] dark:bg-[#051424] text-[#131b2e] dark:text-slate-100 flex flex-col font-sans selection:bg-[#4F46E5] selection:text-white">
      {/* Sticky Public Header */}
      <PublicHeader />

      <main className="w-full pt-16 flex-1">
        {/* ─── 1. HERO SECTION ────────────────────────────────────────────────── */}
        <section className="relative w-full max-w-7xl mx-auto px-6 sm:px-8 pt-16 sm:pt-24 pb-16 overflow-hidden">
          {/* Ambient Glow Backdrops */}
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[720px] h-[340px] bg-[#c3c0ff]/35 dark:bg-indigo-600/15 blur-[120px] rounded-full pointer-events-none -z-10" />
          <div className="absolute top-48 right-10 w-[380px] h-[260px] bg-[#dbe1ff]/40 dark:bg-sky-500/10 blur-[90px] rounded-full pointer-events-none -z-10" />

          <div className="flex flex-col items-center text-center max-w-4xl mx-auto">
            {/* Live Release Badge */}
            <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-[#e2e7ff]/80 dark:bg-[#0d1c2d]/90 hover:bg-[#dae2fd] dark:hover:bg-[#132337] rounded-full shadow-sm text-[#3525cd] dark:text-indigo-300 mb-6 transition-colors cursor-pointer border border-[#c3c0ff]/50 dark:border-[#1e2d42]">
              <span className="w-2 h-2 rounded-full bg-[#4F46E5] dark:bg-indigo-400 animate-pulse" />
              <span className="text-xs font-semibold tracking-wide text-[#3525cd] dark:text-indigo-300">
                TaskFlow 3.0 is live
              </span>
              <span className="text-[#c7c4d8] dark:text-slate-600">•</span>
              <span className="text-xs text-[#464555] dark:text-slate-400">
                Built for modern product teams
              </span>
              <ArrowRight className="w-3.5 h-3.5 text-[#3525cd] dark:text-indigo-400" />
            </div>

            {/* Main Headline */}
            <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-[68px] font-extrabold tracking-tight text-[#131b2e] dark:text-white leading-[1.12] text-balance">
              Plan better. Work smarter.{" "}
              <span className="text-[#4F46E5] dark:text-indigo-400">Ship faster.</span>
            </h1>

            {/* Subheading */}
            <p className="text-lg sm:text-xl text-[#464555] dark:text-slate-400 max-w-2xl mt-5 mb-8 leading-relaxed text-balance">
              TaskFlow gives your team one unified workspace to map roadmaps,
              unblock execution, streamline reviews, and build momentum
              effortlessly.
            </p>

            {/* Dual CTAs */}
            <div className="flex flex-col sm:flex-row items-center gap-3.5 w-full sm:w-auto">
              <Link href={ROUTES.REGISTER} className="w-full sm:w-auto">
                <Button className="w-full sm:w-auto h-12 px-7 bg-[#4F46E5] hover:bg-[#3525cd] text-white font-semibold text-base rounded-xl shadow-lg shadow-[#4F46E5]/25 transition-all hover:scale-[1.02] active:scale-[0.98] flex items-center justify-center gap-2">
                  <span>Get Started Free</span>
                  <Bolt className="w-4 h-4 fill-white" />
                </Button>
              </Link>
              <button
                type="button"
                onClick={() => {
                  document
                    .getElementById("product-demo")
                    ?.scrollIntoView({ behavior: "smooth" });
                }}
                className="w-full sm:w-auto h-12 px-6 bg-white dark:bg-[#0d1c2d] hover:bg-slate-50 dark:hover:bg-[#132337] text-[#131b2e] dark:text-slate-200 font-semibold text-base rounded-xl shadow-sm border border-slate-200 dark:border-[#1e2d42] transition-colors flex items-center justify-center gap-2"
              >
                <PlayCircle className="w-5 h-5 text-[#0051d5] dark:text-sky-400" />
                <span>View Interactive Demo</span>
              </button>
            </div>

            {/* Trust Microcopy */}
            <div className="flex flex-wrap items-center justify-center gap-3 text-xs text-[#464555]/80 dark:text-slate-400 mt-5 font-medium">
              <span className="flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5 text-[#4F46E5] dark:text-indigo-400" />
                No credit card required
              </span>
              <span className="text-slate-300 dark:text-slate-600">•</span>
              <span>14-day full feature trial</span>
              <span className="text-slate-300 dark:text-slate-600">•</span>
              <span>Instant workspace setup</span>
            </div>
          </div>

          {/* ─── Realistic TaskFlow UI Preview (Mac Frame) ──────────────────── */}
          <div
            id="product-demo"
            className="mt-14 relative w-full rounded-2xl bg-white dark:bg-[#030b14] shadow-2xl p-2 sm:p-3 border border-slate-200/80 dark:border-[#1e2d42]"
          >
            {/* Window Shell */}
            <div className="w-full rounded-xl bg-[#f2f3ff] dark:bg-[#08121f] overflow-hidden border border-slate-100 dark:border-[#1e2d42]">
              {/* Mac Header Window Bar */}
              <div className="h-11 px-4 bg-[#eaedff] dark:bg-[#0d1c2d] flex items-center justify-between border-b border-slate-200/50 dark:border-[#1e2d42]">
                <div className="flex items-center gap-2">
                  <span className="w-3 h-3 rounded-full bg-[#ff5f56]" />
                  <span className="w-3 h-3 rounded-full bg-[#ffbd2e]" />
                  <span className="w-3 h-3 rounded-full bg-[#27c93f]" />
                  <span className="ml-3 text-xs text-[#464555] dark:text-slate-400 font-medium hidden sm:inline-block">
                    TaskFlow Engine • Platform Execution Core
                  </span>
                </div>

                {/* Jump Search Bar */}
                <div className="flex items-center gap-2 bg-white dark:bg-[#162536] px-3 py-1 rounded-md shadow-xs text-xs text-slate-400 dark:text-slate-300 border border-transparent dark:border-[#1e2d42]">
                  <Search className="w-3.5 h-3.5" />
                  <span className="hidden md:inline">
                    Jump to task, project, or command (⌘K)...
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <span className="px-2 py-0.5 rounded-full bg-[#e2e7ff] dark:bg-[#1e2d42] text-[#3525cd] dark:text-indigo-300 text-[11px] font-bold">
                    Q1 Release
                  </span>
                  <div className="w-6 h-6 rounded-full bg-[#4F46E5] text-white flex items-center justify-center text-[10px] font-bold">
                    TF
                  </div>
                </div>
              </div>

              {/* Inner Layout Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-12 min-h-[540px] bg-[#f2f3ff] dark:bg-[#08121f]">
                {/* Minimalist Sidebar */}
                <div className="lg:col-span-2 bg-white dark:bg-[#0d1c2d] p-4 hidden lg:flex flex-col justify-between border-r border-slate-100 dark:border-[#1e2d42]">
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 px-1">
                      <div className="w-7 h-7 rounded-lg bg-[#4F46E5] text-white flex items-center justify-center font-bold text-xs">
                        AO
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#131b2e] dark:text-white">
                          Alpha Operations
                        </div>
                        <div className="text-[11px] text-[#464555] dark:text-slate-400">
                          14 Members active
                        </div>
                      </div>
                    </div>

                    <div className="space-y-1">
                      <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg bg-[#e2dfff] dark:bg-[#1e2d42] text-[#3525cd] dark:text-indigo-300 text-xs font-semibold">
                        <Kanban className="w-4 h-4" />
                        <span>Kanban Board</span>
                      </div>
                      <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[#464555] dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#132337] text-xs font-medium transition-colors">
                        <Layers className="w-4 h-4" />
                        <span>Backlog</span>
                      </div>
                      <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[#464555] dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#132337] text-xs font-medium transition-colors">
                        <TrendingUp className="w-4 h-4" />
                        <span>Roadmap</span>
                      </div>
                      <div className="flex items-center gap-2 px-2.5 py-1.5 rounded-lg text-[#464555] dark:text-slate-400 hover:bg-slate-100 dark:hover:bg-[#132337] text-xs font-medium transition-colors">
                        <Users className="w-4 h-4" />
                        <span>Team</span>
                      </div>
                    </div>
                  </div>

                  {/* Storage Progress Widget */}
                  <div className="p-3 bg-[#e2e7ff]/70 dark:bg-[#132337] rounded-xl space-y-1.5 border border-transparent dark:border-[#1e2d42]">
                    <div className="flex justify-between items-center text-[11px] font-bold text-[#131b2e] dark:text-white">
                      <span>Storage</span>
                      <span>82%</span>
                    </div>
                    <div className="w-full bg-[#d2d9f4] dark:bg-slate-800 rounded-full h-1.5 overflow-hidden">
                      <div className="bg-[#4F46E5] h-full w-[82%] rounded-full" />
                    </div>
                    <div className="text-[10px] text-[#464555] dark:text-slate-400">
                      Tier: Enterprise Growth
                    </div>
                  </div>
                </div>

                {/* Main Kanban & Metrics Area */}
                <div className="lg:col-span-10 p-4 sm:p-6 flex flex-col gap-4">
                  {/* Project Health Header Bar */}
                  <div className="bg-white dark:bg-[#0d1c2d] p-4 rounded-xl shadow-xs flex flex-col md:flex-row items-start md:items-center justify-between gap-4 border border-slate-100 dark:border-[#1e2d42]">
                    <div>
                      <div className="flex items-center gap-2">
                        <h3 className="text-base font-bold text-[#131b2e] dark:text-white">
                          Platform Execution Core
                        </h3>
                        <span className="px-2 py-0.5 rounded-md bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[11px] font-bold">
                          On Track
                        </span>
                      </div>
                      <p className="text-xs text-[#464555] dark:text-slate-400 mt-0.5">
                        Jan 20 – Feb 03 • 4 business days remaining
                      </p>
                    </div>

                    {/* Metric Widgets */}
                    <div className="flex items-center gap-6 flex-wrap">
                      <div className="flex items-center gap-3">
                        {/* Progress Ring */}
                        <div className="relative w-11 h-11 flex items-center justify-center">
                          <svg className="w-11 h-11 -rotate-90" viewBox="0 0 36 36">
                            <path
                              className="text-slate-100 dark:text-slate-800"
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                              fill="none"
                              stroke="currentColor"
                              strokeWidth="3.5"
                            />
                            <path
                              className="text-[#4F46E5] dark:text-indigo-400"
                              d="M18 2.0845 a 15.9155 15.9155 0 0 1 0 31.831 a 15.9155 15.9155 0 0 1 0 -31.831"
                              fill="none"
                              stroke="currentColor"
                              strokeDasharray="78, 100"
                              strokeLinecap="round"
                              strokeWidth="3.5"
                            />
                          </svg>
                          <span className="absolute text-[11px] font-bold text-[#131b2e] dark:text-white">
                            78%
                          </span>
                        </div>
                        <div>
                          <div className="text-xs font-bold text-[#131b2e] dark:text-white">
                            18 / 23 Tasks
                          </div>
                          <div className="text-[11px] text-[#464555] dark:text-slate-400">
                            Completed on schedule
                          </div>
                        </div>
                      </div>

                      {/* Velocity Mini Sparkline */}
                      <div className="hidden sm:flex flex-col">
                        <div className="text-[11px] text-[#464555] dark:text-slate-400 flex justify-between gap-2">
                          <span>Velocity Trend</span>
                          <span className="text-[#4F46E5] dark:text-indigo-400 font-bold">+14%</span>
                        </div>
                        <svg
                          className="w-24 h-5 text-[#4F46E5] dark:text-indigo-400"
                          fill="none"
                          viewBox="0 0 100 24"
                        >
                          <path
                            d="M0 20 L20 16 L40 18 L60 9 L80 12 L100 4"
                            stroke="currentColor"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2.5"
                          />
                        </svg>
                      </div>
                    </div>
                  </div>

                  {/* 3-Column Kanban Board Preview */}
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Column: To Do */}
                    <div className="bg-[#eaedff] dark:bg-[#0d1c2d] rounded-xl p-3 flex flex-col gap-2.5 border border-transparent dark:border-[#1e2d42]">
                      <div className="flex items-center justify-between px-1">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-slate-400" />
                          <span className="text-xs font-bold text-[#131b2e] dark:text-white uppercase tracking-wider">
                            To Do
                          </span>
                          <span className="px-1.5 py-0.2 bg-[#dae2fd] dark:bg-[#1e2d42] text-[10px] font-bold text-[#464555] dark:text-slate-300 rounded-full">
                            3
                          </span>
                        </div>
                      </div>

                      {/* Card 1 */}
                      <div className="bg-white dark:bg-[#132337] p-3.5 rounded-lg shadow-xs hover:shadow-md transition-all space-y-2 border border-slate-100 dark:border-[#1e2d42]">
                        <div className="flex justify-between items-center">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#ffdbcc] dark:bg-amber-950/50 text-[#7e3000] dark:text-amber-300">
                            High Priority
                          </span>
                        </div>
                        <h4 className="text-xs font-semibold text-[#131b2e] dark:text-white">
                          API Gateway v2 Migration
                        </h4>
                        <p className="text-[11px] text-[#464555] dark:text-slate-400 line-clamp-2">
                          Move authentication middleware to edge workers to reduce
                          latency to &lt;20ms.
                        </p>
                        <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400">
                          <span className="flex items-center gap-1">
                            <Calendar className="w-3 h-3" /> Jan 29
                          </span>
                          <div className="w-5 h-5 rounded-full bg-[#4F46E5] text-white text-[9px] flex items-center justify-center font-bold">
                            MK
                          </div>
                        </div>
                      </div>

                      {/* Card 2 */}
                      <div className="bg-white dark:bg-[#132337] p-3.5 rounded-lg shadow-xs hover:shadow-md transition-all space-y-2 border border-slate-100 dark:border-[#1e2d42]">
                        <div className="flex justify-between items-center">
                          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#e2e7ff] dark:bg-[#1e2d42] text-[#3525cd] dark:text-indigo-300">
                            UX Research
                          </span>
                        </div>
                        <h4 className="text-xs font-semibold text-[#131b2e] dark:text-white">
                          Audit Workspace Permissions
                        </h4>
                        <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400">
                          <span className="flex items-center gap-1">
                            <Paperclip className="w-3 h-3" /> 2 specs
                          </span>
                          <div className="w-5 h-5 rounded-full bg-[#0051d5] text-white text-[9px] flex items-center justify-center font-bold">
                            AL
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Column: In Progress */}
                    <div className="bg-[#eaedff] dark:bg-[#0d1c2d] rounded-xl p-3 flex flex-col gap-2.5 border border-transparent dark:border-[#1e2d42]">
                      <div className="flex items-center justify-between px-1">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-[#0051d5]" />
                          <span className="text-xs font-bold text-[#131b2e] dark:text-white uppercase tracking-wider">
                            In Progress
                          </span>
                          <span className="px-1.5 py-0.2 bg-[#dbe1ff] dark:bg-[#1e2d42] text-[10px] font-bold text-[#003ea8] dark:text-sky-300 rounded-full">
                            2
                          </span>
                        </div>
                      </div>

                      {/* Card 3 Active */}
                      <div className="bg-white dark:bg-[#132337] p-3.5 rounded-lg shadow-sm hover:shadow-md transition-all space-y-2 ring-1 ring-[#4F46E5]/30 dark:ring-indigo-500/40 border border-slate-100 dark:border-[#1e2d42]">
                        <div className="flex justify-between items-center">
                          <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-[#ffdad6] dark:bg-rose-950/60 text-[#93000a] dark:text-rose-300">
                            Urgent
                          </span>
                          <span className="px-2 py-0.5 rounded bg-[#e2dfff] dark:bg-[#1e2d42] text-[#3525cd] dark:text-indigo-300 text-[10px] font-semibold">
                            Project Goal
                          </span>
                        </div>
                        <h4 className="text-xs font-semibold text-[#131b2e] dark:text-white">
                          Redesign onboarding checklist
                        </h4>
                        <div className="w-full bg-[#e2e7ff] dark:bg-slate-800 rounded-full h-1.5">
                          <div className="bg-[#0051d5] dark:bg-sky-400 h-1.5 rounded-full w-2/3" />
                        </div>
                        <div className="flex items-center justify-between pt-1">
                          <span className="text-[10px] text-[#0051d5] dark:text-sky-300 font-semibold">
                            4/6 subtasks
                          </span>
                          <div className="flex -space-x-1.5">
                            <div className="w-5 h-5 rounded-full bg-indigo-600 text-white text-[9px] flex items-center justify-center font-bold">
                              SM
                            </div>
                            <div className="w-5 h-5 rounded-full bg-amber-600 text-white text-[9px] flex items-center justify-center font-bold">
                              DK
                            </div>
                          </div>
                        </div>
                      </div>

                      {/* Card 4 */}
                      <div className="bg-white dark:bg-[#132337] p-3.5 rounded-lg shadow-xs hover:shadow-md transition-all space-y-2 border border-slate-100 dark:border-[#1e2d42]">
                        <div className="flex justify-between items-center">
                          <span className="px-2 py-0.5 rounded text-[10px] font-medium bg-[#e2e7ff] dark:bg-[#1e2d42] text-[#3525cd] dark:text-indigo-300">
                            In Review
                          </span>
                        </div>
                        <h4 className="text-xs font-semibold text-[#131b2e] dark:text-white">
                          Multi-tenant SSO with Okta
                        </h4>
                        <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400">
                          <span className="flex items-center gap-1">
                            <MessageSquare className="w-3 h-3" /> 8
                          </span>
                          <div className="w-5 h-5 rounded-full bg-slate-700 text-white text-[9px] flex items-center justify-center font-bold">
                            TW
                          </div>
                        </div>
                      </div>
                    </div>

                    {/* Column: Done */}
                    <div className="bg-[#eaedff] dark:bg-[#0d1c2d] rounded-xl p-3 flex flex-col gap-2.5 border border-transparent dark:border-[#1e2d42]">
                      <div className="flex items-center justify-between px-1">
                        <div className="flex items-center gap-2">
                          <span className="w-2 h-2 rounded-full bg-emerald-600" />
                          <span className="text-xs font-bold text-[#131b2e] dark:text-white uppercase tracking-wider">
                            Done
                          </span>
                          <span className="px-1.5 py-0.2 bg-emerald-100 dark:bg-emerald-950/60 text-[10px] font-bold text-emerald-800 dark:text-emerald-300 rounded-full">
                            18
                          </span>
                        </div>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                      </div>

                      {/* Card Done */}
                      <div className="bg-white/90 dark:bg-[#132337]/90 p-3.5 rounded-lg shadow-xs space-y-2 border border-slate-100 dark:border-[#1e2d42]">
                        <div className="flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 text-[10px] font-bold">
                          <CheckCircle className="w-3.5 h-3.5" />
                          <span>Shipped to Production</span>
                        </div>
                        <h4 className="text-xs font-semibold text-[#131b2e] dark:text-white line-through text-slate-400 dark:text-slate-500">
                          PostgreSQL 16 Engine Upgrade
                        </h4>
                        <div className="flex items-center justify-between pt-1 text-[10px] text-slate-400">
                          <span>Merged PR #142</span>
                          <div className="w-5 h-5 rounded-full bg-emerald-600 text-white text-[9px] flex items-center justify-center font-bold">
                            SM
                          </div>
                        </div>
                      </div>

                      {/* Team Live Feed Snapshot */}
                      <div className="bg-white/60 dark:bg-[#132337]/60 p-2.5 rounded-lg text-[11px] space-y-1 border border-slate-100/60 dark:border-[#1e2d42]">
                        <div className="font-bold text-[#131b2e] dark:text-white flex items-center gap-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                          Live Activity
                        </div>
                        <p className="text-[#464555] dark:text-slate-400 text-[10px]">
                          David K. moved{" "}
                          <span className="font-semibold text-[#131b2e] dark:text-white">
                            Telemetry Fixes
                          </span>{" "}
                          to Done
                        </p>
                        <p className="text-[#464555] dark:text-slate-400 text-[10px]">
                          Elena C. commented on{" "}
                          <span className="font-semibold text-[#131b2e] dark:text-white">
                            Design Tokens
                          </span>
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── 2. SOCIAL PROOF SECTION ────────────────────────────────────────── */}
        <section className="w-full bg-white dark:bg-[#030b14] py-12 border-y border-slate-100 dark:border-[#1e2d42]">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 flex flex-col items-center">
            <p className="text-[11px] font-bold tracking-widest uppercase text-[#464555]/70 dark:text-slate-400 mb-8 text-center">
              Trusted by modern teams to organize their work
            </p>
            <div className="w-full grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-6 items-center justify-items-center opacity-70 dark:opacity-80">
              <div className="flex items-center gap-1.5 text-[#131b2e] dark:text-slate-200 text-sm font-extrabold tracking-tight">
                <Sparkles className="w-4 h-4 text-[#4F46E5] dark:text-indigo-400" /> NORTHSTAR
              </div>
              <div className="flex items-center gap-1.5 text-[#131b2e] dark:text-slate-200 text-sm font-extrabold tracking-tight">
                <Layers className="w-4 h-4 text-[#0051d5] dark:text-sky-400" /> VERTEX
              </div>
              <div className="flex items-center gap-1.5 text-[#131b2e] dark:text-slate-200 text-sm font-extrabold tracking-tight">
                <Flame className="w-4 h-4 text-[#7e3000] dark:text-amber-400" /> BRIGHTLABS
              </div>
              <div className="flex items-center gap-1.5 text-[#131b2e] dark:text-slate-200 text-sm font-extrabold tracking-tight">
                <TrendingUp className="w-4 h-4 text-[#4F46E5] dark:text-indigo-400" /> ORBIT
              </div>
              <div className="flex items-center gap-1.5 text-[#131b2e] dark:text-slate-200 text-sm font-extrabold tracking-tight">
                <Bolt className="w-4 h-4 text-[#0051d5] dark:text-sky-400" /> NOVA.IO
              </div>
              <div className="flex items-center gap-1.5 text-[#131b2e] dark:text-slate-200 text-sm font-extrabold tracking-tight">
                <ShieldCheck className="w-4 h-4 text-[#131b2e] dark:text-slate-200" /> ACME CORP
              </div>
            </div>
          </div>
        </section>

        {/* ─── 3. FEATURES GRID SECTION (6 Cards) ────────────────────────────── */}
        <section
          id="features"
          className="w-full py-20 px-6 sm:px-8 max-w-7xl mx-auto"
        >
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="text-xs uppercase font-bold tracking-wider text-[#4F46E5] dark:text-indigo-400">
              End-to-End Execution
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#131b2e] dark:text-white mt-2">
              Everything your team needs to stay organized
            </h2>
            <p className="text-base text-[#464555] dark:text-slate-400 mt-3">
              From planning to execution, TaskFlow keeps your team&apos;s work
              organized in one place with zero overhead.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {/* Feature 1 */}
            <div className="bg-white dark:bg-[#0d1c2d] p-7 rounded-2xl shadow-xs hover:shadow-md transition-all group flex flex-col justify-between border border-slate-100 dark:border-[#1e2d42]">
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#e2dfff] dark:bg-[#1e2d42] text-[#3525cd] dark:text-indigo-300 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <FolderKanban className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-[#131b2e] dark:text-white mb-2">
                  Project Management
                </h3>
                <p className="text-sm text-[#464555] dark:text-slate-400 leading-relaxed">
                  Organize projects, milestones, deadlines, and priorities in one
                  workspace without scattered spreadsheets.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-50 dark:border-[#1e2d42] flex items-center gap-1.5 text-[#4F46E5] dark:text-indigo-400 text-xs font-semibold">
                <span>Explore Workspaces</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Feature 2 */}
            <div className="bg-white dark:bg-[#0d1c2d] p-7 rounded-2xl shadow-xs hover:shadow-md transition-all group flex flex-col justify-between border border-slate-100 dark:border-[#1e2d42]">
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#dbe1ff] dark:bg-[#162a45] text-[#0051d5] dark:text-sky-300 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-[#131b2e] dark:text-white mb-2">
                  Task Management
                </h3>
                <p className="text-sm text-[#464555] dark:text-slate-400 leading-relaxed">
                  Create, assign, prioritize, and track tasks from start to finish
                  with custom tags, due dates, and checklist items.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-50 dark:border-[#1e2d42] flex items-center gap-1.5 text-[#0051d5] dark:text-sky-400 text-xs font-semibold">
                <span>Task Automation</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Feature 3 */}
            <div className="bg-white dark:bg-[#0d1c2d] p-7 rounded-2xl shadow-xs hover:shadow-md transition-all group flex flex-col justify-between border border-slate-100 dark:border-[#1e2d42]">
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#ffdbcc] dark:bg-amber-950/50 text-[#7e3000] dark:text-amber-300 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <Kanban className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-[#131b2e] dark:text-white mb-2">
                  Kanban Workflow
                </h3>
                <p className="text-sm text-[#464555] dark:text-slate-400 leading-relaxed">
                  Visualize work and move tasks smoothly through your workflow with
                  an intuitive drag-and-drop Kanban board.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-50 dark:border-[#1e2d42] flex items-center gap-1.5 text-[#7e3000] dark:text-amber-400 text-xs font-semibold">
                <span>Custom Columns</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Feature 4 */}
            <div className="bg-white dark:bg-[#0d1c2d] p-7 rounded-2xl shadow-xs hover:shadow-md transition-all group flex flex-col justify-between border border-slate-100 dark:border-[#1e2d42]">
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#e2e7ff] dark:bg-[#1e2d42] text-[#3525cd] dark:text-indigo-300 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <Users className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-[#131b2e] dark:text-white mb-2">
                  Team Collaboration
                </h3>
                <p className="text-sm text-[#464555] dark:text-slate-400 leading-relaxed">
                  Keep everyone aligned with workspace members, task assignees,
                  contextual @mentions, and inline comments.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-50 dark:border-[#1e2d42] flex items-center gap-1.5 text-[#4F46E5] dark:text-indigo-400 text-xs font-semibold">
                <span>Live Presence</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Feature 5 */}
            <div className="bg-white dark:bg-[#0d1c2d] p-7 rounded-2xl shadow-xs hover:shadow-md transition-all group flex flex-col justify-between border border-slate-100 dark:border-[#1e2d42]">
              <div>
                <div className="w-12 h-12 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <TrendingUp className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-[#131b2e] dark:text-white mb-2">
                  Progress Tracking
                </h3>
                <p className="text-sm text-[#464555] dark:text-slate-400 leading-relaxed">
                  Understand project health, cycle time, and team velocity with
                  high-signal, zero-configuration charts and burndowns.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-50 dark:border-[#1e2d42] flex items-center gap-1.5 text-emerald-700 dark:text-emerald-400 text-xs font-semibold">
                <span>Velocity Metrics</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>

            {/* Feature 6 */}
            <div className="bg-white dark:bg-[#0d1c2d] p-7 rounded-2xl shadow-xs hover:shadow-md transition-all group flex flex-col justify-between border border-slate-100 dark:border-[#1e2d42]">
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#b4c5ff] dark:bg-[#162a45] text-[#0051d5] dark:text-sky-300 flex items-center justify-center mb-5 group-hover:scale-110 transition-transform">
                  <ShieldCheck className="w-6 h-6" />
                </div>
                <h3 className="text-lg font-bold text-[#131b2e] dark:text-white mb-2">
                  Secure by Design
                </h3>
                <p className="text-sm text-[#464555] dark:text-slate-400 leading-relaxed">
                  Role-based access control (RBAC), SSO, granular access limits, and
                  audit logs keep your workspace protected.
                </p>
              </div>
              <div className="mt-6 pt-4 border-t border-slate-50 dark:border-[#1e2d42] flex items-center gap-1.5 text-[#0051d5] dark:text-sky-400 text-xs font-semibold">
                <span>Compliance Info</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </div>
            </div>
          </div>
        </section>

        {/* ─── 4. PRODUCT SHOWCASE (Alternating Layouts) ────────────────────── */}
        <section
          id="showcase"
          className="w-full py-20 bg-[#f2f3ff] dark:bg-[#08121f] border-y border-slate-200/50 dark:border-[#1e2d42]"
        >
          <div className="max-w-7xl mx-auto px-6 sm:px-8 space-y-24">
            {/* Showcase 1: Milestone Tracking */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-5 space-y-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e2dfff] dark:bg-[#1e2d42] text-[#3525cd] dark:text-indigo-300 text-xs font-semibold">
                  <TrendingUp className="w-4 h-4" /> Milestone Tracking
                </div>
                <h3 className="text-3xl font-bold text-[#131b2e] dark:text-white leading-snug">
                  See every project at a glance
                </h3>
                <p className="text-base text-[#464555] dark:text-slate-400 leading-relaxed">
                  Track project status, milestones, priorities, and velocity
                  without switching between disjointed trackers or manually compiling
                  status reports.
                </p>
                <ul className="space-y-3 pt-2">
                  <li className="flex items-center gap-2 text-sm text-[#131b2e] dark:text-slate-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Real-time delivery forecasts updated on task completion</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm text-[#131b2e] dark:text-slate-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Visual bandwidth distribution across engineering & design</span>
                  </li>
                  <li className="flex items-center gap-2 text-sm text-[#131b2e] dark:text-slate-200">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                    <span>Automated milestone notifications and velocity reports</span>
                  </li>
                </ul>
              </div>

              {/* Showcase 1 Visual Card */}
              <div className="lg:col-span-7">
                <div className="bg-white dark:bg-[#0d1c2d] p-6 sm:p-8 rounded-2xl shadow-xl space-y-4 border border-slate-100 dark:border-[#1e2d42]">
                  <div className="flex items-center justify-between">
                    <div>
                      <span className="text-xs uppercase tracking-wider text-[#464555] dark:text-slate-400 font-bold">
                        Portfolio Overview
                      </span>
                      <h4 className="text-base font-bold text-[#131b2e] dark:text-white">
                        Active Strategic Initiatives
                      </h4>
                    </div>
                    <span className="px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold">
                      94% Healthy
                    </span>
                  </div>

                  {/* Initiative 1 */}
                  <div className="p-4 rounded-xl bg-[#eaedff] dark:bg-[#132337] space-y-2 border border-transparent dark:border-[#1e2d42]">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-[#4F46E5] dark:bg-indigo-400" />
                        <span className="text-sm font-bold text-[#131b2e] dark:text-white">
                          Mobile Client Redesign 2.0
                        </span>
                      </div>
                      <span className="text-xs font-semibold text-[#4F46E5] dark:text-indigo-400">
                        Due in 8 days
                      </span>
                    </div>
                    <div className="w-full bg-[#d2d9f4] dark:bg-slate-800 rounded-full h-2">
                      <div className="bg-[#4F46E5] dark:bg-indigo-500 h-2 rounded-full w-[85%]" />
                    </div>
                    <div className="flex justify-between text-[11px] text-[#464555] dark:text-slate-400 font-medium">
                      <span>34 of 40 tickets closed</span>
                      <span>Lead: Sarah M.</span>
                    </div>
                  </div>

                  {/* Initiative 2 */}
                  <div className="p-4 rounded-xl bg-[#eaedff] dark:bg-[#132337] space-y-2 border border-transparent dark:border-[#1e2d42]">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2">
                        <span className="w-3 h-3 rounded-full bg-[#0051d5] dark:bg-sky-400" />
                        <span className="text-sm font-bold text-[#131b2e] dark:text-white">
                          Global CDN Edge Rollout
                        </span>
                      </div>
                      <span className="text-xs font-semibold text-[#0051d5] dark:text-sky-400">
                        Due in 19 days
                      </span>
                    </div>
                    <div className="w-full bg-[#d2d9f4] dark:bg-slate-800 rounded-full h-2">
                      <div className="bg-[#0051d5] dark:bg-sky-500 h-2 rounded-full w-[60%]" />
                    </div>
                    <div className="flex justify-between text-[11px] text-[#464555] dark:text-slate-400 font-medium">
                      <span>12 of 20 tasks closed</span>
                      <span>Lead: Alex R.</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Showcase 2: Visual Kanban Workflow */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-7 order-2 lg:order-1">
                <div className="bg-white dark:bg-[#0d1c2d] p-6 sm:p-8 rounded-2xl shadow-xl border border-slate-100 dark:border-[#1e2d42] space-y-4">
                  <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-[#1e2d42]">
                    <div className="flex items-center gap-2">
                      <Kanban className="w-4 h-4 text-[#4F46E5] dark:text-indigo-400" />
                      <span className="text-sm font-bold text-[#131b2e] dark:text-white">
                        Feature Pipeline
                      </span>
                    </div>
                    <span className="text-xs text-[#464555] dark:text-slate-400 font-medium">
                      WIP Limit: 4 active
                    </span>
                  </div>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
                    <div className="bg-[#f2f3ff] dark:bg-[#132337] p-3 rounded-lg text-center space-y-1.5 border border-transparent dark:border-[#1e2d42]">
                      <div className="text-[10px] font-bold text-[#464555] dark:text-slate-400">
                        BACKLOG
                      </div>
                      <div className="bg-white dark:bg-[#0d1c2d] p-2.5 rounded shadow-xs text-left border border-slate-100 dark:border-[#1e2d42]">
                        <div className="text-[11px] font-semibold text-[#131b2e] dark:text-white">
                          Webhook v2
                        </div>
                        <div className="text-[10px] text-slate-400 mt-1">
                          #API-89
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#f2f3ff] dark:bg-[#132337] p-3 rounded-lg text-center space-y-1.5 border border-transparent dark:border-[#1e2d42]">
                      <div className="text-[10px] font-bold text-[#0051d5] dark:text-sky-300">
                        DEV (WIP)
                      </div>
                      <div className="bg-white dark:bg-[#0d1c2d] p-2.5 rounded shadow-xs text-left border-l-2 border-[#0051d5] dark:border-sky-400 border-t border-r border-b border-slate-100 dark:border-[#1e2d42]">
                        <div className="text-[11px] font-semibold text-[#131b2e] dark:text-white">
                          Dark Mode Sync
                        </div>
                        <div className="text-[10px] text-[#0051d5] dark:text-sky-400 mt-1">
                          Active: 2h
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#f2f3ff] dark:bg-[#132337] p-3 rounded-lg text-center space-y-1.5 border border-transparent dark:border-[#1e2d42]">
                      <div className="text-[10px] font-bold text-amber-700 dark:text-amber-300">
                        REVIEW
                      </div>
                      <div className="bg-white dark:bg-[#0d1c2d] p-2.5 rounded shadow-xs text-left border-l-2 border-amber-500 border-t border-r border-b border-slate-100 dark:border-[#1e2d42]">
                        <div className="text-[11px] font-semibold text-[#131b2e] dark:text-white">
                          Audit Logs UI
                        </div>
                        <div className="text-[10px] text-amber-700 dark:text-amber-400 mt-1">
                          Needs 1 QA
                        </div>
                      </div>
                    </div>

                    <div className="bg-[#f2f3ff] dark:bg-[#132337] p-3 rounded-lg text-center space-y-1.5 border border-transparent dark:border-[#1e2d42]">
                      <div className="text-[10px] font-bold text-emerald-700 dark:text-emerald-300">
                        DEPLOYED
                      </div>
                      <div className="bg-white dark:bg-[#0d1c2d] p-2.5 rounded shadow-xs text-left border-l-2 border-emerald-500 border-t border-r border-b border-slate-100 dark:border-[#1e2d42]">
                        <div className="text-[11px] font-semibold text-slate-400 line-through">
                          Billing API
                        </div>
                        <div className="text-[10px] text-emerald-600 dark:text-emerald-400 mt-1">
                          Prod v3.4
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className="lg:col-span-5 space-y-4 order-1 lg:order-2">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#dbe1ff] dark:bg-[#162a45] text-[#0051d5] dark:text-sky-300 text-xs font-semibold">
                  <Kanban className="w-4 h-4" /> Visual Boards
                </div>
                <h3 className="text-3xl font-bold text-[#131b2e] dark:text-white leading-snug">
                  Turn work into a clear, predictable workflow
                </h3>
                <p className="text-base text-[#464555] dark:text-slate-400 leading-relaxed">
                  Visual Kanban boards with WIP limits, explicit column rules,
                  priority pills, and drag-and-drop clarity keep teams focused on
                  finishing rather than starting.
                </p>
                <div className="grid grid-cols-2 gap-3 pt-2">
                  <div className="p-3.5 rounded-xl bg-white dark:bg-[#0d1c2d] shadow-xs border border-slate-100 dark:border-[#1e2d42]">
                    <div className="text-xs font-bold text-[#131b2e] dark:text-white">
                      Zero Friction
                    </div>
                    <div className="text-xs text-[#464555] dark:text-slate-400 mt-0.5">
                      Sub-second card drag & drop
                    </div>
                  </div>
                  <div className="p-3.5 rounded-xl bg-white dark:bg-[#0d1c2d] shadow-xs border border-slate-100 dark:border-[#1e2d42]">
                    <div className="text-xs font-bold text-[#131b2e] dark:text-white">
                      Bottleneck Alerts
                    </div>
                    <div className="text-xs text-[#464555] dark:text-slate-400 mt-0.5">
                      Instant alerts when WIP limits breach
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Showcase 3: Team Alignment */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
              <div className="lg:col-span-5 space-y-4">
                <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e2e7ff] dark:bg-[#1e2d42] text-[#3525cd] dark:text-indigo-300 text-xs font-semibold">
                  <Users className="w-4 h-4" /> Team Workspace
                </div>
                <h3 className="text-3xl font-bold text-[#131b2e] dark:text-white leading-snug">
                  Keep your entire team aligned
                </h3>
                <p className="text-base text-[#464555] dark:text-slate-400 leading-relaxed">
                  Team member management with granular roles (Admin, Member,
                  Viewer), active projects, workload distribution badges, and direct
                  presence indicators.
                </p>
                <div className="flex items-center gap-3 pt-2">
                  <div className="flex -space-x-2.5">
                    <div className="w-9 h-9 rounded-full bg-[#4F46E5] text-white flex items-center justify-center font-bold text-xs ring-2 ring-white dark:ring-[#0d1c2d]">
                      SM
                    </div>
                    <div className="w-9 h-9 rounded-full bg-[#0051d5] text-white flex items-center justify-center font-bold text-xs ring-2 ring-white dark:ring-[#0d1c2d]">
                      AR
                    </div>
                    <div className="w-9 h-9 rounded-full bg-indigo-700 text-white flex items-center justify-center font-bold text-xs ring-2 ring-white dark:ring-[#0d1c2d]">
                      EC
                    </div>
                    <div className="w-9 h-9 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xs ring-2 ring-white dark:ring-[#0d1c2d]">
                      +9
                    </div>
                  </div>
                  <span className="text-xs text-[#464555] dark:text-slate-400 font-medium">
                    Synchronized in real-time across timezones
                  </span>
                </div>
              </div>

              <div className="lg:col-span-7">
                <div className="bg-white dark:bg-[#0d1c2d] p-6 sm:p-8 rounded-2xl shadow-xl space-y-3 border border-slate-100 dark:border-[#1e2d42]">
                  <div className="flex items-center justify-between pb-1">
                    <span className="text-sm font-bold text-[#131b2e] dark:text-white">
                      Team Member Directory
                    </span>
                    <span className="text-xs text-[#4F46E5] dark:text-indigo-400 font-semibold cursor-pointer">
                      + Invite Member
                    </span>
                  </div>

                  {/* Member 1 */}
                  <div className="flex items-center justify-between p-3 bg-[#f2f3ff] dark:bg-[#132337] rounded-xl border border-transparent dark:border-[#1e2d42]">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#4F46E5] text-white flex items-center justify-center font-bold text-xs">
                        SM
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#131b2e] dark:text-white">
                          Sarah Mitchell
                        </div>
                        <div className="text-[11px] text-[#464555] dark:text-slate-400">
                          sarah@northstar.io • Product Lead
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full bg-[#e2dfff] dark:bg-[#1e2d42] text-[#3525cd] dark:text-indigo-300 text-[10px] font-bold">
                        Admin
                      </span>
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    </div>
                  </div>

                  {/* Member 2 */}
                  <div className="flex items-center justify-between p-3 bg-[#f2f3ff] dark:bg-[#132337] rounded-xl border border-transparent dark:border-[#1e2d42]">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#0051d5] text-white flex items-center justify-center font-bold text-xs">
                        AR
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#131b2e] dark:text-white">
                          Alex Rivera
                        </div>
                        <div className="text-[11px] text-[#464555] dark:text-slate-400">
                          alex@brightlabs.com • VP Engineering
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full bg-[#dae2fd] dark:bg-[#1e2d42] text-[#464555] dark:text-slate-300 text-[10px] font-bold">
                        Member
                      </span>
                      <span className="w-2 h-2 rounded-full bg-emerald-500" />
                    </div>
                  </div>

                  {/* Member 3 */}
                  <div className="flex items-center justify-between p-3 bg-[#f2f3ff] dark:bg-[#132337] rounded-xl border border-transparent dark:border-[#1e2d42]">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-[#ffdbcc] dark:bg-amber-950/50 text-[#7e3000] dark:text-amber-300 flex items-center justify-center font-bold text-xs">
                        EC
                      </div>
                      <div>
                        <div className="text-xs font-bold text-[#131b2e] dark:text-white">
                          Elena Chen
                        </div>
                        <div className="text-[11px] text-[#464555] dark:text-slate-400">
                          elena@orbit.tech • Staff Designer
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="px-2 py-0.5 rounded-full bg-[#dae2fd] dark:bg-[#1e2d42] text-[#464555] dark:text-slate-300 text-[10px] font-bold">
                        Member
                      </span>
                      <span className="w-2 h-2 rounded-full bg-amber-400" />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── 5. HOW IT WORKS (3 Steps) ─────────────────────────────────────── */}
        <section className="w-full py-20 px-6 sm:px-8 max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs uppercase font-bold tracking-wider text-[#4F46E5] dark:text-indigo-400">
              Simple Onboarding
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#131b2e] dark:text-white mt-2">
              Simple workflow. Better execution.
            </h2>
            <p className="text-base text-[#464555] dark:text-slate-400 mt-2">
              Get your entire engineering and product organization productive in
              under three minutes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {/* Step 01 */}
            <div className="bg-white dark:bg-[#0d1c2d] p-8 rounded-2xl shadow-xs hover:shadow-md transition-shadow border border-slate-100 dark:border-[#1e2d42] flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#4F46E5] text-white text-lg flex items-center justify-center font-bold mb-6">
                  01
                </div>
                <h3 className="text-lg font-bold text-[#131b2e] dark:text-white mb-2">
                  Create your workspace
                </h3>
                <p className="text-sm text-[#464555] dark:text-slate-400 mb-6 leading-relaxed">
                  Set up your team workspace in seconds. Invite teammates, configure
                  default roles, and organize projects with zero manual setup.
                </p>
              </div>
              <div className="p-3 bg-[#f2f3ff] dark:bg-[#132337] rounded-lg text-xs font-mono text-[#464555] dark:text-slate-300 border border-transparent dark:border-[#1e2d42]">
                $ taskflow init team-alpha --region us-east
              </div>
            </div>

            {/* Step 02 */}
            <div className="bg-white dark:bg-[#0d1c2d] p-8 rounded-2xl shadow-xs hover:shadow-md transition-shadow border border-slate-100 dark:border-[#1e2d42] flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#0051d5] text-white text-lg flex items-center justify-center font-bold mb-6">
                  02
                </div>
                <h3 className="text-lg font-bold text-[#131b2e] dark:text-white mb-2">
                  Organize your projects
                </h3>
                <p className="text-sm text-[#464555] dark:text-slate-400 mb-6 leading-relaxed">
                  Create projects, milestone goals, priorities, and deadlines.
                  Categorize deliverables into automated workflows.
                </p>
              </div>
              <div className="flex items-center gap-2 p-3 bg-[#f2f3ff] dark:bg-[#132337] rounded-lg text-xs text-[#131b2e] dark:text-white font-semibold border border-transparent dark:border-[#1e2d42]">
                <Layers className="w-4 h-4 text-[#0051d5] dark:text-sky-400" />
                <span>Auto-assigned 14 project epics</span>
              </div>
            </div>

            {/* Step 03 */}
            <div className="bg-white dark:bg-[#0d1c2d] p-8 rounded-2xl shadow-xs hover:shadow-md transition-shadow border border-slate-100 dark:border-[#1e2d42] flex flex-col justify-between">
              <div>
                <div className="w-12 h-12 rounded-xl bg-[#3525cd] text-white text-lg flex items-center justify-center font-bold mb-6">
                  03
                </div>
                <h3 className="text-lg font-bold text-[#131b2e] dark:text-white mb-2">
                  Get work done
                </h3>
                <p className="text-sm text-[#464555] dark:text-slate-400 mb-6 leading-relaxed">
                  Collaborate with your team, unblock progress in flight, and ship
                  deliverables on schedule without status meeting fatigue.
                </p>
              </div>
              <div className="flex items-center gap-2 p-3 bg-[#f2f3ff] dark:bg-[#132337] rounded-lg text-xs text-emerald-700 dark:text-emerald-300 font-semibold border border-transparent dark:border-[#1e2d42]">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                <span>Project completed with 100% velocity</span>
              </div>
            </div>
          </div>
        </section>

        {/* ─── 6. BENEFITS SECTION (4 Cards) ─────────────────────────────────── */}
        <section className="w-full py-20 bg-white dark:bg-[#051424] border-y border-slate-100 dark:border-[#1e2d42]">
          <div className="max-w-7xl mx-auto px-6 sm:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-xs uppercase font-bold tracking-wider text-[#0051d5] dark:text-sky-400">
                High Signal, Low Noise
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#131b2e] dark:text-white mt-2">
                Built for teams that want less complexity
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <div className="p-6 rounded-2xl bg-[#f2f3ff] dark:bg-[#0d1c2d] hover:bg-[#eaedff] dark:hover:bg-[#132337] border border-transparent dark:border-[#1e2d42] transition-colors space-y-2">
                <div className="w-10 h-10 rounded-xl bg-[#e2dfff] dark:bg-[#1e2d42] text-[#4F46E5] dark:text-indigo-300 flex items-center justify-center mb-4">
                  <FolderKanban className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-[#131b2e] dark:text-white">
                  One workspace
                </h3>
                <p className="text-sm text-[#464555] dark:text-slate-400 leading-relaxed">
                  Keep projects, tasks, comments, and team activity together under
                  one clean pane of glass.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-[#f2f3ff] dark:bg-[#0d1c2d] hover:bg-[#eaedff] dark:hover:bg-[#132337] border border-transparent dark:border-[#1e2d42] transition-colors space-y-2">
                <div className="w-10 h-10 rounded-xl bg-[#dbe1ff] dark:bg-[#162a45] text-[#0051d5] dark:text-sky-300 flex items-center justify-center mb-4">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-[#131b2e] dark:text-white">
                  Clear ownership
                </h3>
                <p className="text-sm text-[#464555] dark:text-slate-400 leading-relaxed">
                  Eliminate ambiguity. Every single task and epic has an
                  unambiguous owner, priority, and due date.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-[#f2f3ff] dark:bg-[#0d1c2d] hover:bg-[#eaedff] dark:hover:bg-[#132337] border border-transparent dark:border-[#1e2d42] transition-colors space-y-2">
                <div className="w-10 h-10 rounded-xl bg-[#ffdbcc] dark:bg-amber-950/50 text-[#7e3000] dark:text-amber-300 flex items-center justify-center mb-4">
                  <TrendingUp className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-[#131b2e] dark:text-white">
                  Better visibility
                </h3>
                <p className="text-sm text-[#464555] dark:text-slate-400 leading-relaxed">
                  Understand project progress without unnecessary status syncs,
                  interruptive pings, or spreadsheets.
                </p>
              </div>

              <div className="p-6 rounded-2xl bg-[#f2f3ff] dark:bg-[#0d1c2d] hover:bg-[#eaedff] dark:hover:bg-[#132337] border border-transparent dark:border-[#1e2d42] transition-colors space-y-2">
                <div className="w-10 h-10 rounded-xl bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 flex items-center justify-center mb-4">
                  <Bolt className="w-5 h-5" />
                </div>
                <h3 className="text-base font-bold text-[#131b2e] dark:text-white">
                  Simple workflow
                </h3>
                <p className="text-sm text-[#464555] dark:text-slate-400 leading-relaxed">
                  Powerful enough for enterprise roadmaps, yet lightweight enough
                  for teams to love using daily.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* ─── 7. TESTIMONIALS (3 Cards) ─────────────────────────────────────── */}
        <section className="w-full py-20 px-6 sm:px-8 max-w-7xl mx-auto">
          <div className="text-center max-w-2xl mx-auto mb-16">
            <span className="text-xs uppercase font-bold tracking-wider text-[#4F46E5] dark:text-indigo-400">
              Customer Stories
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#131b2e] dark:text-white mt-2">
              Loved by fast-moving teams
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Testimonial 1 */}
            <div className="bg-white dark:bg-[#0d1c2d] p-7 rounded-2xl shadow-xs border border-slate-100 dark:border-[#1e2d42] flex flex-col justify-between space-y-6">
              <div>
                <div className="flex text-amber-400 mb-4 gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-base text-[#131b2e] dark:text-slate-200 italic leading-relaxed">
                  &ldquo;TaskFlow gives our team a much clearer view of what needs
                  to happen next. It replaced three separate tools and brought
                  clarity back to our project execution.&rdquo;
                </p>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <div className="w-10 h-10 rounded-full bg-[#4F46E5] text-white flex items-center justify-center font-bold text-sm">
                  SM
                </div>
                <div>
                  <div className="text-sm font-bold text-[#131b2e] dark:text-white">
                    Sarah Mitchell
                  </div>
                  <div className="text-xs text-[#464555] dark:text-slate-400">
                    Product Manager at Northstar Labs
                  </div>
                </div>
              </div>
            </div>

            {/* Testimonial 2 */}
            <div className="bg-white dark:bg-[#0d1c2d] p-7 rounded-2xl shadow-xs border border-slate-100 dark:border-[#1e2d42] flex flex-col justify-between space-y-6">
              <div>
                <div className="flex text-amber-400 mb-4 gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-base text-[#131b2e] dark:text-slate-200 italic leading-relaxed">
                  &ldquo;We cut our weekly sync meetings in half after switching
                  our team projects to TaskFlow. Engineers actually update their
                  cards because it is so fast.&rdquo;
                </p>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <div className="w-10 h-10 rounded-full bg-[#0051d5] text-white flex items-center justify-center font-bold text-sm">
                  AR
                </div>
                <div>
                  <div className="text-sm font-bold text-[#131b2e] dark:text-white">
                    Alex Rivera
                  </div>
                  <div className="text-xs text-[#464555] dark:text-slate-400">
                    VP of Engineering at BrightLabs
                  </div>
                </div>
              </div>
            </div>

            {/* Testimonial 3 */}
            <div className="bg-white dark:bg-[#0d1c2d] p-7 rounded-2xl shadow-xs border border-slate-100 dark:border-[#1e2d42] flex flex-col justify-between space-y-6">
              <div>
                <div className="flex text-amber-400 mb-4 gap-1">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="w-4 h-4 fill-amber-400" />
                  ))}
                </div>
                <p className="text-base text-[#131b2e] dark:text-slate-200 italic leading-relaxed">
                  &ldquo;The cleanest kanban and task tracking interface we have
                  used. Zero clutter, instant adoption, and effortless keyboard
                  navigation everywhere.&rdquo;
                </p>
              </div>
              <div className="flex items-center gap-3 pt-2">
                <div className="w-10 h-10 rounded-full bg-[#3525cd] text-white flex items-center justify-center font-bold text-sm">
                  EC
                </div>
                <div>
                  <div className="text-sm font-bold text-[#131b2e] dark:text-white">
                    Elena Chen
                  </div>
                  <div className="text-xs text-[#464555] dark:text-slate-400">
                    Design Director at Orbit Tech
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* ─── 8. PRICING PREVIEW ────────────────────────────────────────────── */}
        <section
          id="pricing"
          className="w-full py-20 bg-[#f2f3ff] dark:bg-[#08121f] border-y border-slate-200/50 dark:border-[#1e2d42]"
        >
          <div className="max-w-7xl mx-auto px-6 sm:px-8">
            <div className="text-center max-w-2xl mx-auto mb-16">
              <span className="text-xs uppercase font-bold tracking-wider text-[#4F46E5] dark:text-indigo-400">
                Transparent Pricing
              </span>
              <h2 className="text-3xl sm:text-4xl font-extrabold text-[#131b2e] dark:text-white mt-2">
                Simple pricing that scales with your team
              </h2>
              <p className="text-base text-[#464555] dark:text-slate-400 mt-2">
                Start free forever, upgrade whenever your team is ready for
                advanced governance and limitless velocity.
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
              {/* Tier 1: Free */}
              <div className="bg-white dark:bg-[#0d1c2d] p-8 rounded-2xl shadow-xs flex flex-col justify-between border border-slate-100 dark:border-[#1e2d42]">
                <div>
                  <h3 className="text-xl font-bold text-[#131b2e] dark:text-white">Free</h3>
                  <p className="text-xs text-[#464555] dark:text-slate-400 mt-1">
                    For individuals and exploratory side projects.
                  </p>
                  <div className="my-6">
                    <span className="text-4xl font-extrabold text-[#131b2e] dark:text-white">
                      $0
                    </span>
                    <span className="text-xs text-[#464555] dark:text-slate-400"> / month forever</span>
                  </div>
                  <ul className="space-y-3 text-sm text-[#131b2e] dark:text-slate-200 mb-8">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>Up to 3 active projects</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>Basic task management</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>Standard Kanban board</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>Basic overview dashboard</span>
                    </li>
                  </ul>
                </div>
                <Link href={ROUTES.REGISTER}>
                  <Button
                    variant="outline"
                    className="w-full py-5 rounded-xl border-slate-200 dark:border-[#1e2d42] hover:bg-slate-50 dark:hover:bg-[#132337] text-[#131b2e] dark:text-slate-200 font-semibold text-sm"
                  >
                    Get Started Free
                  </Button>
                </Link>
              </div>

              {/* Tier 2: Pro (Highlighted) */}
              <div className="bg-white dark:bg-[#0f1f33] p-8 rounded-2xl shadow-xl flex flex-col justify-between relative ring-2 ring-[#4F46E5] dark:ring-indigo-500 border border-transparent dark:border-[#1e2d42]">
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#4F46E5] text-white text-[11px] font-bold uppercase tracking-wider shadow-md">
                  Most Popular
                </div>
                <div>
                  <h3 className="text-xl font-bold text-[#131b2e] dark:text-white">Pro</h3>
                  <p className="text-xs text-[#464555] dark:text-slate-400 mt-1">
                    For growing teams building commercial products.
                  </p>
                  <div className="my-6">
                    <span className="text-4xl font-extrabold text-[#131b2e] dark:text-white">
                      $12
                    </span>
                    <span className="text-xs text-[#464555] dark:text-slate-400"> / user / month</span>
                  </div>
                  <ul className="space-y-3 text-sm text-[#131b2e] dark:text-slate-200 mb-8">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#4F46E5] dark:text-indigo-400" />
                      <span className="font-semibold">Unlimited projects</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#4F46E5] dark:text-indigo-400" />
                      <span>Advanced task dependencies & tags</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#4F46E5] dark:text-indigo-400" />
                      <span>Real-time team collaboration</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#4F46E5] dark:text-indigo-400" />
                      <span>Velocity & cycle-time analytics</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-[#4F46E5] dark:text-indigo-400" />
                      <span>Priority email & chat support</span>
                    </li>
                  </ul>
                </div>
                <Link href={ROUTES.REGISTER}>
                  <Button className="w-full py-5 rounded-xl bg-[#4F46E5] hover:bg-[#3525cd] text-white font-semibold text-sm shadow-md">
                    Start Free Trial
                  </Button>
                </Link>
              </div>

              {/* Tier 3: Business */}
              <div className="bg-white dark:bg-[#0d1c2d] p-8 rounded-2xl shadow-xs flex flex-col justify-between border border-slate-100 dark:border-[#1e2d42]">
                <div>
                  <h3 className="text-xl font-bold text-[#131b2e] dark:text-white">Business</h3>
                  <p className="text-xs text-[#464555] dark:text-slate-400 mt-1">
                    For scaled engineering orgs requiring governance.
                  </p>
                  <div className="my-6">
                    <span className="text-4xl font-extrabold text-[#131b2e] dark:text-white">
                      $25
                    </span>
                    <span className="text-xs text-[#464555] dark:text-slate-400"> / user / month</span>
                  </div>
                  <ul className="space-y-3 text-sm text-[#131b2e] dark:text-slate-200 mb-8">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span className="font-semibold">Everything in Pro</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>Advanced role permissions (RBAC)</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>SAML 2.0 / Okta / Azure SSO</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                      <span>Audit logging & compliance export</span>
                    </li>
                  </ul>
                </div>
                <Link href={ROUTES.REGISTER}>
                  <Button
                    variant="outline"
                    className="w-full py-5 rounded-xl border-slate-200 dark:border-[#1e2d42] hover:bg-slate-50 dark:hover:bg-[#132337] text-[#131b2e] dark:text-slate-200 font-semibold text-sm"
                  >
                    Contact Sales
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ─── 9. FAQ ACCORDION SECTION ──────────────────────────────────────── */}
        <section id="faq" className="w-full py-20 px-6 sm:px-8 max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <span className="text-xs uppercase font-bold tracking-wider text-[#4F46E5] dark:text-indigo-400">
              Got Questions?
            </span>
            <h2 className="text-3xl sm:text-4xl font-extrabold text-[#131b2e] dark:text-white mt-2">
              Frequently asked questions
            </h2>
          </div>

          <div className="space-y-3">
            {faqs.map((faq, index) => {
              const isOpen = openFaq === index;
              return (
                <div
                  key={faq.question}
                  className="bg-white dark:bg-[#0d1c2d] rounded-2xl shadow-xs overflow-hidden border border-slate-100 dark:border-[#1e2d42] transition-all"
                >
                  <button
                    type="button"
                    onClick={() => toggleFaq(index)}
                    className="w-full px-6 py-4 text-left flex items-center justify-between gap-4 transition-colors hover:bg-slate-50/50 dark:hover:bg-[#132337]/50"
                  >
                    <span className="text-base font-semibold text-[#131b2e] dark:text-white">
                      {faq.question}
                    </span>
                    <ChevronDown
                      className={`w-5 h-5 text-[#4F46E5] dark:text-indigo-400 flex-shrink-0 transition-transform duration-200 ${
                        isOpen ? "rotate-180" : ""
                      }`}
                    />
                  </button>
                  {isOpen && (
                    <div className="px-6 pb-5 text-sm text-[#464555] dark:text-slate-300 leading-relaxed animate-in fade-in-50 duration-150">
                      {faq.answer}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </section>

        {/* ─── 10. FINAL CTA SECTION ─────────────────────────────────────────── */}
        <section className="w-full px-6 sm:px-8 py-16 max-w-7xl mx-auto mb-12">
          <div className="relative w-full rounded-3xl bg-[#4F46E5] overflow-hidden p-8 sm:p-12 md:p-16 text-center text-white shadow-2xl">
            {/* Illumination glows */}
            <div className="absolute -right-20 -top-20 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -left-20 -bottom-20 w-96 h-96 bg-[#0051d5]/30 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-2xl mx-auto space-y-5">
              <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight text-white leading-tight">
                Ready to bring your team&apos;s work together?
              </h2>
              <p className="text-base sm:text-lg text-[#e2dfff] max-w-lg mx-auto">
                Start organizing projects, tasks, and seamless collaboration today
                with TaskFlow.
              </p>
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href={ROUTES.REGISTER} className="w-full sm:w-auto">
                  <Button className="w-full sm:w-auto h-12 px-8 bg-white hover:bg-slate-100 text-[#4F46E5] font-bold text-base rounded-xl shadow-lg transition-transform hover:scale-105 active:scale-95">
                    Get Started Free
                  </Button>
                </Link>
                <span className="text-sm text-[#e2dfff] font-medium flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-white" />
                  No credit card required
                </span>
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Public Footer */}
      <PublicFooter />
    </div>
  );
}
