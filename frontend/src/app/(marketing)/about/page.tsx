"use client";

import React from "react";
import Link from "next/link";
import { PublicHeader } from "@/components/layout/public-header";
import { PublicFooter } from "@/components/layout/public-footer";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import {
  Sparkles,
  Users,
  Target,
  ShieldCheck,
  Zap,
  ArrowRight,
  Heart,
  Globe,
  Award,
} from "lucide-react";

interface TeamMember {
  name: string;
  role: string;
  bio: string;
  initials: string;
  color: string;
  avatar?: string;
}

const teamMembers: TeamMember[] = [
  {
    name: "Sarah Mitchell",
    role: "VP of Product & Co-Founder",
    bio: "Former Lead PM at Northstar Labs. Passionate about eliminating status meeting fatigue and crafting friction-free developer tools.",
    initials: "SM",
    color: "bg-[#4F46E5]",
    avatar: "/images/sarah-mitchell.jpg",
  },
  {
    name: "Alex Rivera",
    role: "VP of Engineering & Co-Founder",
    bio: "Distributed systems architect previously at BrightLabs. Focused on sub-second UI responsiveness, real-time sync, and edge resilience.",
    initials: "AR",
    color: "bg-[#0051d5]",
  },
  {
    name: "Elena Chen",
    role: "Head of Product Design",
    bio: "Ex-Design Director at Orbit Tech. Champion of high-density, accessible interfaces and modern technical clarity.",
    initials: "EC",
    color: "bg-[#7e3000]",
  },
];

const values = [
  {
    title: "High Signal, Low Noise",
    desc: "We believe project management should clarify priority, not generate busywork. Everything in TaskFlow is built to save hours, not log them.",
    icon: Zap,
    color: "text-[#4F46E5] dark:text-indigo-400 bg-[#e2dfff] dark:bg-indigo-950/60",
  },
  {
    title: "Sub-Second Velocity",
    desc: "Speed is a core feature. From board drag & drop to command palette navigation, every interaction responds in under 100 milliseconds.",
    icon: Target,
    color: "text-[#0051d5] dark:text-sky-400 bg-[#dbe1ff] dark:bg-sky-950/60",
  },
  {
    title: "Radical Transparency",
    desc: "No hidden agendas or siloed roadmaps. Clear ownership, open team velocity, and continuous deployment keep teams aligned.",
    icon: ShieldCheck,
    color: "text-emerald-700 dark:text-emerald-400 bg-emerald-100 dark:bg-emerald-950/60",
  },
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-[#faf8ff] dark:bg-[#051424] text-[#131b2e] dark:text-slate-100 flex flex-col font-sans selection:bg-[#4F46E5] selection:text-white">
      <PublicHeader />

      <main className="w-full pt-16 flex-1">
        {/* Hero Section */}
        <section className="relative w-full max-w-7xl mx-auto px-6 sm:px-8 pt-16 pb-14 text-center overflow-hidden">
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] h-[280px] bg-[#c3c0ff]/30 dark:bg-indigo-600/15 blur-[100px] rounded-full pointer-events-none -z-10" />

          <span className="text-xs uppercase font-bold tracking-wider text-[#4F46E5] dark:text-indigo-400">
            Our Story & Mission
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-[#131b2e] dark:text-white mt-2 mb-4 tracking-tight leading-tight">
            We build software for teams that ship.
          </h1>
          <p className="text-base sm:text-lg text-[#464555] dark:text-slate-300 max-w-2xl mx-auto mb-8 leading-relaxed">
            TaskFlow was founded with a singular conviction: modern software
            teams shouldn&apos;t have to sacrifice speed for organization. We
            give high-output builders the clarity they need to deliver on schedule.
          </p>

          <div className="flex items-center justify-center gap-6 text-xs text-[#464555] dark:text-slate-400 font-semibold">
            <span className="flex items-center gap-1.5">
              <Globe className="w-4 h-4 text-[#4F46E5] dark:text-indigo-400" />
              Distributed Global Team
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-[#0051d5] dark:text-sky-400" />
              12,000+ Active Teams
            </span>
            <span>•</span>
            <span className="flex items-center gap-1.5">
              <Award className="w-4 h-4 text-emerald-600 dark:text-emerald-400" />
              99.99% Historical Uptime
            </span>
          </div>
        </section>

        {/* Core Values Grid */}
        <section className="w-full py-16 bg-white dark:bg-[#08121f] border-y border-slate-100 dark:border-[#1e2d42]">
          <div className="max-w-7xl mx-auto px-6 sm:px-8">
            <div className="text-center max-w-2xl mx-auto mb-14">
              <span className="text-xs uppercase font-bold tracking-wider text-[#4F46E5] dark:text-indigo-400">
                What Guides Us
              </span>
              <h2 className="text-3xl font-bold text-[#131b2e] dark:text-white mt-1">
                Our Core Operating Principles
              </h2>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              {values.map((val) => {
                const Icon = val.icon;
                return (
                  <div
                    key={val.title}
                    className="p-7 rounded-2xl bg-[#faf8ff] dark:bg-[#0d1c2d] border border-slate-100 dark:border-[#1e2d42] space-y-3 hover:shadow-md transition-shadow"
                  >
                    <div
                      className={`w-12 h-12 rounded-xl flex items-center justify-center mb-4 ${val.color}`}
                    >
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-lg font-bold text-[#131b2e] dark:text-white">
                      {val.title}
                    </h3>
                    <p className="text-sm text-[#464555] dark:text-slate-300 leading-relaxed">
                      {val.desc}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Leadership Team Section */}
        <section className="w-full py-20 max-w-7xl mx-auto px-6 sm:px-8">
          <div className="text-center max-w-2xl mx-auto mb-14">
            <span className="text-xs uppercase font-bold tracking-wider text-[#4F46E5] dark:text-indigo-400">
              Leadership
            </span>
            <h2 className="text-3xl font-bold text-[#131b2e] dark:text-white mt-1">
              Built by builders, for builders
            </h2>
            <p className="text-sm text-[#464555] dark:text-slate-400 mt-2">
              Our founding team brings decades of combined experience building
              high-scale SaaS and enterprise tooling.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {teamMembers.map((member) => (
              <div
                key={member.name}
                className="bg-white dark:bg-[#0d1c2d] p-6 rounded-2xl shadow-xs border border-slate-100 dark:border-[#1e2d42] space-y-4 hover:shadow-md transition-shadow"
              >
                <div className="flex items-center gap-3.5">
                  {member.avatar ? (
                    <img
                      src={member.avatar}
                      alt={member.name}
                      className="w-14 h-14 rounded-2xl object-cover shadow-sm ring-2 ring-[#4F46E5]/30 dark:ring-indigo-500/30"
                    />
                  ) : (
                    <div
                      className={`w-14 h-14 rounded-2xl flex items-center justify-center text-white font-bold text-base shadow-sm ${member.color}`}
                    >
                      {member.initials}
                    </div>
                  )}
                  <div>
                    <h3 className="text-base font-bold text-[#131b2e] dark:text-white">
                      {member.name}
                    </h3>
                    <p className="text-xs text-[#4F46E5] dark:text-indigo-400 font-semibold">
                      {member.role}
                    </p>
                  </div>
                </div>
                <p className="text-xs text-[#464555] dark:text-slate-300 leading-relaxed">
                  {member.bio}
                </p>
              </div>
            ))}
          </div>
        </section>

        {/* Final CTA Banner */}
        <section className="w-full px-6 sm:px-8 py-14 max-w-7xl mx-auto mb-12">
          <div className="relative w-full rounded-3xl bg-[#4F46E5] overflow-hidden p-8 sm:p-12 text-center text-white shadow-2xl">
            <div className="absolute -right-20 -top-20 w-96 h-96 bg-white/10 rounded-full blur-3xl pointer-events-none" />
            <div className="absolute -left-20 -bottom-20 w-96 h-96 bg-[#0051d5]/30 rounded-full blur-3xl pointer-events-none" />

            <div className="relative z-10 max-w-2xl mx-auto space-y-4">
              <h2 className="text-3xl font-bold text-white tracking-tight">
                Want to build with us?
              </h2>
              <p className="text-sm sm:text-base text-[#e2dfff] max-w-lg mx-auto">
                Explore our live platform or reach out to our team directly.
              </p>
              <div className="pt-2 flex flex-col sm:flex-row items-center justify-center gap-3">
                <Link href={ROUTES.REGISTER}>
                  <Button className="h-11 px-7 bg-white hover:bg-slate-100 text-[#4F46E5] font-bold text-sm rounded-xl shadow-lg transition-transform hover:scale-105 active:scale-95">
                    Get Started Free
                  </Button>
                </Link>
                <Link href={ROUTES.CONTACT}>
                  <Button
                    variant="inverse"
                    className="h-11 px-6 font-semibold text-sm rounded-xl shadow-sm transition-transform hover:scale-105 active:scale-95"
                  >
                    Contact Our Team
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
