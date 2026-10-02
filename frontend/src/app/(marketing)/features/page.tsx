"use client";

import React from "react";
import Link from "next/link";
import { PublicHeader } from "@/components/layout/public-header";
import { PublicFooter } from "@/components/layout/public-footer";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import {
  Bolt,
  ShieldCheck,
  CheckCircle2,
  FolderKanban,
  Kanban,
  Users,
  TrendingUp,
  Building2,
  Lock,
  ArrowRight,
  Sparkles,
  Layers,
  Check,
  Calendar,
  MessageSquare,
  Paperclip,
  Clock,
  Eye,
  Activity,
  Sliders,
  Flag,
  Share2,
} from "lucide-react";

export default function FeaturesPage() {
  const jumpLinks = [
    { label: "Project Management", href: "#project-management", icon: FolderKanban },
    { label: "Task Management", href: "#task-management", icon: CheckCircle2 },
    { label: "Kanban Boards", href: "#kanban-boards", icon: Kanban },
    { label: "Team Collaboration", href: "#team-collaboration", icon: Users },
    { label: "Analytics", href: "#dashboard-analytics", icon: TrendingUp },
    { label: "Workspaces", href: "#workspace-management", icon: Building2 },
    { label: "Roles & RBAC", href: "#roles-permissions", icon: Sliders },
    { label: "Security", href: "#secure-authentication", icon: Lock },
  ];

  return (
    <div className="min-h-screen bg-[#faf8ff] dark:bg-[#051424] text-[#131b2e] dark:text-slate-100 flex flex-col font-sans selection:bg-[#4F46E5] selection:text-white">
      <PublicHeader />

      <main className="w-full pt-16 flex-1">
        {/* ─── Sticky Jump Bar ─────────────────────────────────────────────── */}
        <div className="sticky top-16 z-40 bg-white/90 dark:bg-[#051424]/90 backdrop-blur-md shadow-xs border-b border-slate-200/60 dark:border-[#1e2d42]">
          <div className="max-w-7xl mx-auto px-6 sm:px-8 py-3 flex items-center gap-2 overflow-x-auto no-scrollbar">
            <span className="text-[11px] font-bold text-[#464555] dark:text-slate-400 uppercase tracking-wider whitespace-nowrap pl-1 pr-2">
              Jump to:
            </span>
            {jumpLinks.map((item) => {
              const Icon = item.icon;
              return (
                <a
                  key={item.label}
                  href={item.href}
                  className="px-3 py-1.5 rounded-full bg-[#f2f3ff] dark:bg-[#0d1c2d] hover:bg-[#e2dfff] dark:hover:bg-[#132337] text-[#131b2e] dark:text-slate-200 text-xs font-semibold whitespace-nowrap transition-colors flex items-center gap-1.5 border border-slate-200/40 dark:border-[#1e2d42]"
                >
                  <Icon className="w-3.5 h-3.5 text-[#4F46E5] dark:text-indigo-400" />
                  <span>{item.label}</span>
                </a>
              );
            })}
          </div>
        </div>

        {/* ─── Hero Intro Section ───────────────────────────────────────────── */}
        <section className="max-w-7xl mx-auto px-6 sm:px-8 pt-16 pb-14 w-full text-center relative overflow-hidden">
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[640px] h-[300px] bg-[#c3c0ff]/30 dark:bg-indigo-600/15 blur-[110px] rounded-full pointer-events-none -z-10" />

          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#e2dfff] dark:bg-[#1e2d42] text-[#3525cd] dark:text-indigo-300 text-xs font-bold mb-5 shadow-xs border border-[#c3c0ff]/50 dark:border-[#1e2d42]">
            <span className="w-2 h-2 rounded-full bg-[#4F46E5] dark:bg-indigo-400 animate-pulse" />
            TaskFlow 3.0 Platform Capabilities
          </div>

          <h1 className="text-4xl sm:text-5xl font-extrabold text-[#131b2e] dark:text-white max-w-4xl mx-auto tracking-tight mb-4 leading-tight">
            Everything you need to manage modern software work
          </h1>

          <p className="text-lg text-[#464555] dark:text-slate-400 max-w-2xl mx-auto mb-8 leading-relaxed">
            TaskFlow combines projects, tasks, Kanban boards, teams, and real-time
            progress tracking in one unified, distraction-free interface.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-3 max-w-3xl mx-auto">
            <span className="px-4 py-2 rounded-xl bg-white dark:bg-[#0d1c2d] shadow-xs text-[#131b2e] dark:text-slate-200 text-xs font-semibold flex items-center gap-2 border border-slate-200/80 dark:border-[#1e2d42]">
              <Bolt className="w-4 h-4 text-[#4F46E5] dark:text-indigo-400" />
              <span>Sub-second UI response time</span>
            </span>
            <span className="px-4 py-2 rounded-xl bg-white dark:bg-[#0d1c2d] shadow-xs text-[#131b2e] dark:text-slate-200 text-xs font-semibold flex items-center gap-2 border border-slate-200/80 dark:border-[#1e2d42]">
              <CheckCircle2 className="w-4 h-4 text-[#0051d5] dark:text-sky-400" />
              <span>99.99% Guaranteed uptime</span>
            </span>
            <span className="px-4 py-2 rounded-xl bg-white dark:bg-[#0d1c2d] shadow-xs text-[#131b2e] dark:text-slate-200 text-xs font-semibold flex items-center gap-2 border border-slate-200/80 dark:border-[#1e2d42]">
              <ShieldCheck className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              <span>SOC-2 Type II Certified</span>
            </span>
          </div>
        </section>

        {/* ─── 8 Deep Dive Feature Sections ─────────────────────────────────── */}
        <div className="max-w-7xl mx-auto px-6 sm:px-8 space-y-24 pb-20 w-full">
          {/* Section 1: Project Management */}
          <section
            id="project-management"
            className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center pt-8 scroll-mt-28"
          >
            <div className="lg:col-span-5 space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e2dfff] dark:bg-[#1e2d42] text-[#3525cd] dark:text-indigo-300 text-xs font-semibold">
                <FolderKanban className="w-3.5 h-3.5" /> Strategic Planning
              </div>
              <h2 className="text-3xl font-bold text-[#131b2e] dark:text-white leading-snug">
                Organize milestones, roadmaps, and priorities
              </h2>
              <p className="text-sm text-[#464555] dark:text-slate-400 leading-relaxed">
                Structure complex team initiatives into clear, actionable phases.
                Set milestones, track delivery velocity, and stay ahead of deadlines
                without spreadsheet chaos.
              </p>
              <ul className="space-y-3 pt-2">
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#e2dfff] dark:bg-[#1e2d42] text-[#4F46E5] dark:text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                    <TrendingUp className="w-3 h-3" />
                  </div>
                  <div>
                    <strong className="text-xs font-bold text-[#131b2e] dark:text-white block">
                      Timeline visualization
                    </strong>
                    <span className="text-xs text-[#464555] dark:text-slate-400">
                      Interactive milestone and phase mapping that adjusts with
                      team velocity.
                    </span>
                  </div>
                </li>
                <li className="flex items-start gap-3">
                  <div className="w-5 h-5 rounded-full bg-[#e2dfff] dark:bg-[#1e2d42] text-[#4F46E5] dark:text-indigo-400 flex items-center justify-center shrink-0 mt-0.5">
                    <Flag className="w-3 h-3" />
                  </div>
                  <div>
                    <strong className="text-xs font-bold text-[#131b2e] dark:text-white block">
                      Milestone tracking
                    </strong>
                    <span className="text-xs text-[#464555] dark:text-slate-400">
                      Identify critical path gates with automated slip alerts and
                      target dates.
                    </span>
                  </div>
                </li>
              </ul>
            </div>

            {/* Visual Card 1 */}
            <div className="lg:col-span-7">
              <div className="bg-white dark:bg-[#0d1c2d] p-6 sm:p-8 rounded-2xl shadow-xl border border-slate-100 dark:border-[#1e2d42] space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-[#1e2d42]">
                  <span className="text-xs font-bold uppercase tracking-wider text-slate-400">
                    Project Roadmap
                  </span>
                  <span className="px-2.5 py-0.5 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-bold rounded-full">
                    96% On Track
                  </span>
                </div>
                <div className="space-y-3">
                  <div className="p-3.5 rounded-xl bg-[#f2f3ff] dark:bg-[#132337] space-y-2 border border-transparent dark:border-[#1e2d42]">
                    <div className="flex justify-between text-xs font-bold text-[#131b2e] dark:text-white">
                      <span>Core Engine API v3</span>
                      <span className="text-[#4F46E5] dark:text-indigo-400">88% Complete</span>
                    </div>
                    <div className="w-full bg-[#d2d9f4] dark:bg-slate-800 rounded-full h-2">
                      <div className="bg-[#4F46E5] dark:bg-indigo-500 h-2 rounded-full w-[88%]" />
                    </div>
                    <div className="flex justify-between text-[11px] text-[#464555] dark:text-slate-400">
                      <span>Milestone 1 • Due Feb 15</span>
                      <span>16 of 18 tasks shipped</span>
                    </div>
                  </div>

                  <div className="p-3.5 rounded-xl bg-[#f2f3ff] dark:bg-[#132337] space-y-2 border border-transparent dark:border-[#1e2d42]">
                    <div className="flex justify-between text-xs font-bold text-[#131b2e] dark:text-white">
                      <span>Mobile Push Notification Sync</span>
                      <span className="text-[#0051d5] dark:text-sky-400">64% Complete</span>
                    </div>
                    <div className="w-full bg-[#d2d9f4] dark:bg-slate-800 rounded-full h-2">
                      <div className="bg-[#0051d5] dark:bg-sky-500 h-2 rounded-full w-[64%]" />
                    </div>
                    <div className="flex justify-between text-[11px] text-[#464555] dark:text-slate-400">
                      <span>Milestone 2 • Due Feb 28</span>
                      <span>9 of 14 tasks shipped</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 2: Task Management */}
          <section
            id="task-management"
            className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center scroll-mt-28"
          >
            <div className="lg:col-span-7 order-2 lg:order-1">
              <div className="bg-white dark:bg-[#0d1c2d] p-6 sm:p-8 rounded-2xl shadow-xl border border-slate-100 dark:border-[#1e2d42] space-y-4">
                <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#1e2d42]">
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-[#ffdad6] dark:bg-rose-950/60 text-[#93000a] dark:text-rose-300 text-[10px] font-bold rounded">
                      Urgent
                    </span>
                    <span className="text-xs text-slate-400 font-mono">#TASK-104</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="px-2 py-0.5 bg-[#dbe1ff] dark:bg-[#1e2d42] text-[#003ea8] dark:text-sky-300 text-[11px] font-semibold rounded-md">
                      In Progress
                    </span>
                  </div>
                </div>
                <h3 className="text-base font-bold text-[#131b2e] dark:text-white">
                  Implement Edge Token Rotation & Session Revocation
                </h3>
                <p className="text-xs text-[#464555] dark:text-slate-400 leading-relaxed">
                  Configure Redis store to invalidate compromised refresh tokens
                  and handle graceful 401 recovery queues on mobile clients.
                </p>
                <div className="space-y-2 pt-2 border-t border-slate-100 dark:border-[#1e2d42]">
                  <div className="text-[11px] font-bold text-[#131b2e] dark:text-white">
                    Subtasks Checklist (3/4)
                  </div>
                  <div className="space-y-1.5 text-xs text-[#464555] dark:text-slate-400">
                    <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span className="line-through">Create Redis blacklist key prefix</span>
                    </div>
                    <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span className="line-through">Add JWT interceptor queue handling</span>
                    </div>
                    <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400">
                      <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 dark:text-emerald-400" />
                      <span className="line-through">Write NestJS unit tests</span>
                    </div>
                    <div className="flex items-center gap-2 font-medium text-[#131b2e] dark:text-white">
                      <div className="w-3.5 h-3.5 rounded border border-slate-300 dark:border-slate-600" />
                      <span>Deploy edge worker configuration</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 space-y-4 order-1 lg:order-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#dbe1ff] dark:bg-[#162a45] text-[#0051d5] dark:text-sky-300 text-xs font-semibold">
                <CheckCircle2 className="w-3.5 h-3.5" /> Granular Control
              </div>
              <h2 className="text-3xl font-bold text-[#131b2e] dark:text-white leading-snug">
                Deep clarity into every single deliverable
              </h2>
              <p className="text-sm text-[#464555] dark:text-slate-400 leading-relaxed">
                Capture every detail with custom task labels, priorities, subtask
                checklists, markdown descriptions, and file attachments without
                slowing down.
              </p>
              <ul className="space-y-3 pt-2">
                <li className="flex items-center gap-2 text-xs text-[#131b2e] dark:text-slate-200 font-medium">
                  <Check className="w-4 h-4 text-[#0051d5] dark:text-sky-400" />
                  <span>Subtask progress bars & interactive checklists</span>
                </li>
                <li className="flex items-center gap-2 text-xs text-[#131b2e] dark:text-slate-200 font-medium">
                  <Check className="w-4 h-4 text-[#0051d5] dark:text-sky-400" />
                  <span>Priority tags with color-coded warning pills</span>
                </li>
                <li className="flex items-center gap-2 text-xs text-[#131b2e] dark:text-slate-200 font-medium">
                  <Check className="w-4 h-4 text-[#0051d5] dark:text-sky-400" />
                  <span>Due date countdowns with automated reminders</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Section 3: Visual Kanban Boards */}
          <section
            id="kanban-boards"
            className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center scroll-mt-28"
          >
            <div className="lg:col-span-5 space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#ffdbcc] dark:bg-amber-950/50 text-[#7e3000] dark:text-amber-300 text-xs font-semibold">
                <Kanban className="w-3.5 h-3.5" /> Flow-Based Execution
              </div>
              <h2 className="text-3xl font-bold text-[#131b2e] dark:text-white leading-snug">
                Smooth drag-and-drop Kanban workflow
              </h2>
              <p className="text-sm text-[#464555] dark:text-slate-400 leading-relaxed">
                Visualize workflow from Backlog to Done with configurable columns,
                WIP constraints, and fluid drag-and-drop mechanics engineered for
                focus.
              </p>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3.5 bg-white dark:bg-[#0d1c2d] rounded-xl shadow-xs border border-slate-100 dark:border-[#1e2d42]">
                  <span className="text-xs font-bold text-[#131b2e] dark:text-white block">
                    WIP Limits
                  </span>
                  <span className="text-[11px] text-[#464555] dark:text-slate-400">
                    Prevent bottlenecks before they stall release cycles
                  </span>
                </div>
                <div className="p-3.5 bg-white dark:bg-[#0d1c2d] rounded-xl shadow-xs border border-slate-100 dark:border-[#1e2d42]">
                  <span className="text-xs font-bold text-[#131b2e] dark:text-white block">
                    Fast Interaction
                  </span>
                  <span className="text-[11px] text-[#464555] dark:text-slate-400">
                    Sub-second reordering with optimistic state updates
                  </span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="bg-[#eaedff] dark:bg-[#08121f] p-4 rounded-2xl shadow-lg border border-slate-200/60 dark:border-[#1e2d42] grid grid-cols-3 gap-3">
                <div className="bg-white dark:bg-[#0d1c2d] p-3 rounded-xl shadow-xs space-y-2 border border-transparent dark:border-[#1e2d42]">
                  <div className="text-[11px] font-bold text-[#464555] dark:text-slate-400 flex justify-between">
                    <span>TO DO</span>
                    <span>3</span>
                  </div>
                  <div className="p-2.5 bg-[#f2f3ff] dark:bg-[#132337] rounded-lg text-xs font-medium text-[#131b2e] dark:text-white space-y-1">
                    <div>Data Migration v2</div>
                    <span className="px-1.5 py-0.2 bg-[#ffdbcc] dark:bg-amber-950/50 text-[#7e3000] dark:text-amber-300 text-[9px] font-bold rounded">
                      High
                    </span>
                  </div>
                </div>

                <div className="bg-white dark:bg-[#0d1c2d] p-3 rounded-xl shadow-xs space-y-2 ring-1 ring-[#4F46E5]/40 border border-transparent dark:border-[#1e2d42]">
                  <div className="text-[11px] font-bold text-[#0051d5] dark:text-sky-300 flex justify-between">
                    <span>IN PROGRESS</span>
                    <span>2</span>
                  </div>
                  <div className="p-2.5 bg-[#f2f3ff] dark:bg-[#132337] rounded-lg text-xs font-medium text-[#131b2e] dark:text-white space-y-1">
                    <div>Dark Theme Tokens</div>
                    <span className="px-1.5 py-0.2 bg-[#e2dfff] dark:bg-[#1e2d42] text-[#3525cd] dark:text-indigo-300 text-[9px] font-bold rounded">
                      Active: 2h
                    </span>
                  </div>
                </div>

                <div className="bg-white dark:bg-[#0d1c2d] p-3 rounded-xl shadow-xs space-y-2 border border-transparent dark:border-[#1e2d42]">
                  <div className="text-[11px] font-bold text-emerald-700 dark:text-emerald-400 flex justify-between">
                    <span>DONE</span>
                    <span>18</span>
                  </div>
                  <div className="p-2.5 bg-[#f2f3ff] dark:bg-[#132337] rounded-lg text-xs font-medium text-slate-400 line-through space-y-1">
                    <div>Billing Webhooks</div>
                    <span className="px-1.5 py-0.2 bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-[9px] font-bold rounded block w-max">
                      Shipped
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 4: Team Collaboration */}
          <section
            id="team-collaboration"
            className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center scroll-mt-28"
          >
            <div className="lg:col-span-7 order-2 lg:order-1">
              <div className="bg-white dark:bg-[#0d1c2d] p-6 sm:p-8 rounded-2xl shadow-xl border border-slate-100 dark:border-[#1e2d42] space-y-4">
                <div className="flex items-center justify-between pb-2 border-b border-slate-100 dark:border-[#1e2d42]">
                  <span className="text-xs font-bold text-[#131b2e] dark:text-white">
                    Discussion Feed (#TASK-89)
                  </span>
                  <span className="text-[11px] text-slate-400">4 comments</span>
                </div>
                <div className="space-y-3">
                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#4F46E5] text-white flex items-center justify-center text-xs font-bold shrink-0">
                      SM
                    </div>
                    <div className="p-3 bg-[#f2f3ff] dark:bg-[#132337] rounded-xl text-xs space-y-1 flex-1">
                      <div className="flex justify-between font-bold text-[#131b2e] dark:text-white">
                        <span>Sarah Mitchell</span>
                        <span className="text-slate-400 font-normal">10m ago</span>
                      </div>
                      <p className="text-[#464555] dark:text-slate-300">
                        PR has passed CI checks. Ready for QA sign-off on staging!
                      </p>
                    </div>
                  </div>

                  <div className="flex items-start gap-3">
                    <div className="w-8 h-8 rounded-full bg-[#0051d5] text-white flex items-center justify-center text-xs font-bold shrink-0">
                      AR
                    </div>
                    <div className="p-3 bg-[#f2f3ff] dark:bg-[#132337] rounded-xl text-xs space-y-1 flex-1">
                      <div className="flex justify-between font-bold text-[#131b2e] dark:text-white">
                        <span>Alex Rivera</span>
                        <span className="text-slate-400 font-normal">2m ago</span>
                      </div>
                      <p className="text-[#464555] dark:text-slate-300">
                        Confirmed on staging. Merging now! 🚀
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 space-y-4 order-1 lg:order-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e2dfff] dark:bg-indigo-950/60 text-[#3525cd] dark:text-indigo-300 text-xs font-semibold">
                <Users className="w-3.5 h-3.5" /> Team Sync
              </div>
              <h2 className="text-3xl font-bold text-[#131b2e] dark:text-white leading-snug">
                Bring your builders into complete lockstep
              </h2>
              <p className="text-sm text-[#464555] dark:text-slate-300 leading-relaxed">
                Empower cross-functional collaboration with inline comments,
                contextual mentions, shared attachments, and live activity streams
                that keep conversations where the work lives.
              </p>
              <ul className="space-y-2.5 text-xs text-[#131b2e] dark:text-slate-300 font-medium pt-2">
                <li className="flex items-center gap-2">
                  <MessageSquare className="w-4 h-4 text-[#4F46E5] dark:text-indigo-400" />
                  <span>Inline markdown task comment threads</span>
                </li>
                <li className="flex items-center gap-2">
                  <Activity className="w-4 h-4 text-[#4F46E5] dark:text-indigo-400" />
                  <span>Live activity feed for all project updates</span>
                </li>
                <li className="flex items-center gap-2">
                  <Paperclip className="w-4 h-4 text-[#4F46E5] dark:text-indigo-400" />
                  <span>Secure attachments and file previews</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Section 5: Analytics & Dashboards */}
          <section
            id="dashboard-analytics"
            className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center scroll-mt-28"
          >
            <div className="lg:col-span-5 space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
                <TrendingUp className="w-3.5 h-3.5" /> Real-Time Analytics
              </div>
              <h2 className="text-3xl font-bold text-[#131b2e] dark:text-white leading-snug">
                High-signal metrics without spreadsheet fatigue
              </h2>
              <p className="text-sm text-[#464555] dark:text-slate-300 leading-relaxed">
                Gain instant visibility into project velocity, delivery metrics,
                task status distribution, and team throughput with zero manual
                reporting.
              </p>
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div className="p-3 bg-white dark:bg-[#0d1c2d] rounded-xl shadow-xs border border-slate-100 dark:border-[#1e2d42]">
                  <div className="text-lg font-extrabold text-[#4F46E5] dark:text-indigo-400">84%</div>
                  <div className="text-[11px] text-[#464555] dark:text-slate-400">Project Completion</div>
                </div>
                <div className="p-3 bg-white dark:bg-[#0d1c2d] rounded-xl shadow-xs border border-slate-100 dark:border-[#1e2d42]">
                  <div className="text-lg font-extrabold text-emerald-600 dark:text-emerald-400">+18%</div>
                  <div className="text-[11px] text-[#464555] dark:text-slate-400">Velocity Growth</div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="bg-white dark:bg-[#0d1c2d] p-6 sm:p-8 rounded-2xl shadow-xl border border-slate-100 dark:border-[#1e2d42] space-y-4">
                <div className="flex justify-between items-center pb-2 border-b border-slate-100 dark:border-[#1e2d42]">
                  <span className="text-xs font-bold text-[#131b2e] dark:text-white">
                    Platform Core Health Overview
                  </span>
                  <span className="text-xs text-[#4F46E5] dark:text-indigo-400 font-semibold">
                    18 / 23 Tasks Shipped
                  </span>
                </div>
                <div className="grid grid-cols-3 gap-3 text-center">
                  <div className="p-3 bg-[#f2f3ff] dark:bg-[#132337] rounded-xl">
                    <div className="text-xl font-bold text-[#131b2e] dark:text-white">23</div>
                    <div className="text-[10px] text-[#464555] dark:text-slate-400">Total Tasks</div>
                  </div>
                  <div className="p-3 bg-[#f2f3ff] dark:bg-[#132337] rounded-xl">
                    <div className="text-xl font-bold text-[#0051d5] dark:text-sky-400">4</div>
                    <div className="text-[10px] text-[#464555] dark:text-slate-400">In Flight</div>
                  </div>
                  <div className="p-3 bg-[#f2f3ff] dark:bg-[#132337] rounded-xl">
                    <div className="text-xl font-bold text-emerald-600 dark:text-emerald-400">18</div>
                    <div className="text-[10px] text-[#464555] dark:text-slate-400">Completed</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 6: Workspaces Multi-Tenancy */}
          <section
            id="workspace-management"
            className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center scroll-mt-28"
          >
            <div className="lg:col-span-7 order-2 lg:order-1">
              <div className="bg-white dark:bg-[#0d1c2d] p-6 sm:p-8 rounded-2xl shadow-xl border border-slate-100 dark:border-[#1e2d42] space-y-3">
                <div className="text-xs font-bold text-[#131b2e] dark:text-white pb-1">
                  Active Workspaces Directory
                </div>
                <div className="p-3.5 bg-[#f2f3ff] dark:bg-[#132337] rounded-xl flex items-center justify-between border border-[#4F46E5]/30 dark:border-indigo-500/40">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#4F46E5] text-white flex items-center justify-center font-bold text-xs">
                      AO
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#131b2e] dark:text-white">
                        Alpha Operations
                      </div>
                      <div className="text-[10px] text-slate-400">
                        taskflow.app/alpha-operations • 14 Members
                      </div>
                    </div>
                  </div>
                  <span className="px-2 py-0.5 bg-[#e2dfff] dark:bg-indigo-950/80 text-[#3525cd] dark:text-indigo-300 text-[10px] font-bold rounded-full">
                    Current Active
                  </span>
                </div>

                <div className="p-3.5 bg-white dark:bg-[#0d1c2d] rounded-xl flex items-center justify-between border border-slate-100 dark:border-[#1e2d42]">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-lg bg-[#0051d5] text-white flex items-center justify-center font-bold text-xs">
                      BC
                    </div>
                    <div>
                      <div className="text-xs font-bold text-[#131b2e] dark:text-white">
                        BrightLabs Core
                      </div>
                      <div className="text-[10px] text-slate-400">
                        taskflow.app/brightlabs-core • 8 Members
                      </div>
                    </div>
                  </div>
                  <span className="text-xs text-[#4F46E5] dark:text-indigo-400 font-semibold cursor-pointer">
                    Switch ➔
                  </span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 space-y-4 order-1 lg:order-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#dbe1ff] dark:bg-sky-950/60 text-[#0051d5] dark:text-sky-300 text-xs font-semibold">
                <Building2 className="w-3.5 h-3.5" /> Workspace Multi-Tenancy
              </div>
              <h2 className="text-3xl font-bold text-[#131b2e] dark:text-white leading-snug">
                Isolate client work and internal teams
              </h2>
              <p className="text-sm text-[#464555] dark:text-slate-300 leading-relaxed">
                Organize multiple companies, departments, or client engagements
                into separate isolated workspaces under a single user login.
              </p>
              <ul className="space-y-2 text-xs text-[#131b2e] dark:text-slate-300 font-medium pt-2">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#0051d5] dark:text-sky-400" />
                  <span>One-click workspace switching</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-[#0051d5] dark:text-sky-400" />
                  <span>Independent team memberships & permissions</span>
                </li>
              </ul>
            </div>
          </section>

          {/* Section 7: Roles & RBAC */}
          <section
            id="roles-permissions"
            className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center scroll-mt-28"
          >
            <div className="lg:col-span-5 space-y-4">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e2dfff] dark:bg-indigo-950/60 text-[#3525cd] dark:text-indigo-300 text-xs font-semibold">
                <Sliders className="w-3.5 h-3.5" /> Granular Access
              </div>
              <h2 className="text-3xl font-bold text-[#131b2e] dark:text-white leading-snug">
                Enterprise role-based governance
              </h2>
              <p className="text-sm text-[#464555] dark:text-slate-300 leading-relaxed">
                Define who can create projects, delete tasks, invite members, or
                modify billing settings with three clear built-in access tiers.
              </p>
              <div className="space-y-2 pt-2">
                <div className="p-3 bg-white dark:bg-[#0d1c2d] rounded-xl shadow-xs border border-slate-100 dark:border-[#1e2d42] flex items-center justify-between">
                  <span className="text-xs font-bold text-[#131b2e] dark:text-white">Owner</span>
                  <span className="text-xs text-[#464555] dark:text-slate-400">Full governance & billing</span>
                </div>
                <div className="p-3 bg-white dark:bg-[#0d1c2d] rounded-xl shadow-xs border border-slate-100 dark:border-[#1e2d42] flex items-center justify-between">
                  <span className="text-xs font-bold text-[#131b2e] dark:text-white">Admin</span>
                  <span className="text-xs text-[#464555] dark:text-slate-400">Manage members & projects</span>
                </div>
                <div className="p-3 bg-white dark:bg-[#0d1c2d] rounded-xl shadow-xs border border-slate-100 dark:border-[#1e2d42] flex items-center justify-between">
                  <span className="text-xs font-bold text-[#131b2e] dark:text-white">Member</span>
                  <span className="text-xs text-[#464555] dark:text-slate-400">Create & update project tasks</span>
                </div>
              </div>
            </div>

            <div className="lg:col-span-7">
              <div className="bg-white dark:bg-[#0d1c2d] p-6 sm:p-8 rounded-2xl shadow-xl border border-slate-100 dark:border-[#1e2d42] space-y-3">
                <div className="text-xs font-bold text-[#131b2e] dark:text-white pb-1">
                  Team Member Permission Matrix
                </div>
                <div className="space-y-2 text-xs">
                  <div className="flex items-center justify-between p-2.5 bg-[#f2f3ff] dark:bg-[#132337] rounded-lg">
                    <span className="font-semibold text-[#131b2e] dark:text-white">Create / Archive Projects</span>
                    <span className="text-[#3525cd] dark:text-indigo-400 font-bold">Owner, Admin</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 bg-[#f2f3ff] dark:bg-[#132337] rounded-lg">
                    <span className="font-semibold text-[#131b2e] dark:text-white">Manage Tasks & Comments</span>
                    <span className="text-emerald-700 dark:text-emerald-400 font-bold">All Roles</span>
                  </div>
                  <div className="flex items-center justify-between p-2.5 bg-[#f2f3ff] dark:bg-[#132337] rounded-lg">
                    <span className="font-semibold text-[#131b2e] dark:text-white">Modify Workspace Billing</span>
                    <span className="text-[#93000a] dark:text-rose-400 font-bold">Owner Only</span>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* Section 8: Enterprise Security */}
          <section
            id="secure-authentication"
            className="grid grid-cols-1 lg:grid-cols-12 gap-10 items-center scroll-mt-28"
          >
            <div className="lg:col-span-7 order-2 lg:order-1">
              <div className="bg-white dark:bg-[#0d1c2d] p-6 sm:p-8 rounded-2xl shadow-xl border border-slate-100 dark:border-[#1e2d42] space-y-4">
                <div className="flex items-center gap-2 text-emerald-700 dark:text-emerald-400 text-xs font-bold pb-2 border-b border-slate-100 dark:border-[#1e2d42]">
                  <ShieldCheck className="w-4 h-4" />
                  <span>Hardened Security Architecture</span>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                  <div className="p-3 bg-[#f2f3ff] dark:bg-[#132337] rounded-xl space-y-1">
                    <div className="font-bold text-[#131b2e] dark:text-white">JWT Rotation</div>
                    <p className="text-[#464555] dark:text-slate-300">
                      15-minute access tokens with Redis session blacklisting.
                    </p>
                  </div>
                  <div className="p-3 bg-[#f2f3ff] dark:bg-[#132337] rounded-xl space-y-1">
                    <div className="font-bold text-[#131b2e] dark:text-white">HTTP-Only Cookies</div>
                    <p className="text-[#464555] dark:text-slate-300">
                      Prevents XSS token exfiltration with strict SameSite rules.
                    </p>
                  </div>
                  <div className="p-3 bg-[#f2f3ff] dark:bg-[#132337] rounded-xl space-y-1">
                    <div className="font-bold text-[#131b2e] dark:text-white">Argon2 / Bcrypt</div>
                    <p className="text-[#464555] dark:text-slate-300">
                      Military-grade cryptographic password hashing algorithms.
                    </p>
                  </div>
                  <div className="p-3 bg-[#f2f3ff] dark:bg-[#132337] rounded-xl space-y-1">
                    <div className="font-bold text-[#131b2e] dark:text-white">Rate Limiting</div>
                    <p className="text-[#464555] dark:text-slate-300">
                      Automatic throttling on sensitive auth and API endpoints.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            <div className="lg:col-span-5 space-y-4 order-1 lg:order-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-100 dark:bg-emerald-950/60 text-emerald-800 dark:text-emerald-300 text-xs font-semibold">
                <Lock className="w-3.5 h-3.5" /> Security by Design
              </div>
              <h2 className="text-3xl font-bold text-[#131b2e] dark:text-white leading-snug">
                Production-grade protection from day one
              </h2>
              <p className="text-sm text-[#464555] dark:text-slate-300 leading-relaxed">
                TaskFlow implements a zero-compromise security posture with edge
                middleware guards, encrypted tokens, and full audit logs.
              </p>
              <ul className="space-y-2 text-xs text-[#131b2e] dark:text-slate-300 font-medium pt-2">
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Automated 401 token refresh queue</span>
                </li>
                <li className="flex items-center gap-2">
                  <Check className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Edge route protection via Next.js Middleware</span>
                </li>
              </ul>
            </div>
          </section>
        </div>

        {/* ─── Final CTA ────────────────────────────────────────────────────── */}
        <section className="w-full px-6 sm:px-8 py-16 max-w-7xl mx-auto mb-12">
          <div className="relative w-full rounded-3xl bg-[#4F46E5] overflow-hidden p-8 sm:p-12 md:p-16 text-center text-white shadow-2xl">
            <div className="absolute -right-20 -top-20 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -left-20 -bottom-20 w-96 h-96 bg-[#0051d5]/30 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-2xl mx-auto space-y-5">
              <h2 className="text-3xl sm:text-4xl font-bold text-white tracking-tight">
                Ready to experience modern project management?
              </h2>
              <p className="text-base text-[#e2dfff] max-w-lg mx-auto">
                Explore every feature hands-on with a 14-day free trial. No credit
                card required.
              </p>
              <div className="pt-4 flex flex-col sm:flex-row items-center justify-center gap-4">
                <Link href={ROUTES.REGISTER}>
                  <Button className="h-12 px-8 bg-white hover:bg-slate-100 text-[#4F46E5] font-bold text-base rounded-xl shadow-lg transition-transform hover:scale-105 active:scale-95">
                    Start Free Trial
                  </Button>
                </Link>
                <Link href={ROUTES.LOGIN}>
                  <Button
                    variant="inverse"
                    className="h-12 px-6 font-semibold text-base rounded-xl shadow-sm transition-transform hover:scale-105 active:scale-95"
                  >
                    Sign In to Existing Workspace
                  </Button>
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
