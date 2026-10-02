"use client";

import React, { useState } from "react";
import Link from "next/link";
import { PublicHeader } from "@/components/layout/public-header";
import { PublicFooter } from "@/components/layout/public-footer";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import {
  CheckCircle2,
  X,
  Sparkles,
  HelpCircle,
  ArrowRight,
  ShieldCheck,
  Zap,
} from "lucide-react";

export default function PricingPage() {
  const [billingCycle, setBillingCycle] = useState<"monthly" | "yearly">(
    "monthly"
  );

  const isYearly = billingCycle === "yearly";

  return (
    <div className="min-h-screen bg-[#faf8ff] dark:bg-[#051424] text-[#131b2e] dark:text-slate-100 flex flex-col font-sans selection:bg-[#4F46E5] selection:text-white">
      <PublicHeader />

      <main className="w-full pt-16 flex-1">
        {/* Hero Section */}
        <section className="relative w-full max-w-7xl mx-auto px-6 sm:px-8 pt-16 pb-12 text-center overflow-hidden">
          <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-[600px] h-[280px] bg-[#c3c0ff]/30 dark:bg-indigo-600/15 blur-[100px] rounded-full pointer-events-none -z-10" />

          <span className="text-xs uppercase font-bold tracking-wider text-[#4F46E5] dark:text-indigo-400">
            Plans & Packaging
          </span>
          <h1 className="text-4xl sm:text-5xl font-extrabold text-[#131b2e] dark:text-white mt-2 mb-4 tracking-tight">
            Simple, transparent pricing for every team
          </h1>
          <p className="text-base sm:text-lg text-[#464555] dark:text-slate-300 max-w-2xl mx-auto mb-8 leading-relaxed">
            Choose the plan that fits your execution pace. Start free, upgrade
            anytime, or tailor an enterprise deployment.
          </p>

          {/* Billing Cycle Toggle */}
          <div className="inline-flex items-center gap-3 p-1.5 bg-[#eaedff] dark:bg-[#0d1c2d] rounded-xl border border-slate-200/60 dark:border-[#1e2d42] shadow-xs">
            <button
              type="button"
              onClick={() => setBillingCycle("monthly")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all ${
                !isYearly
                  ? "bg-white dark:bg-[#162a45] text-[#131b2e] dark:text-white shadow-xs"
                  : "text-[#464555] dark:text-slate-400 hover:text-[#131b2e] dark:hover:text-white"
              }`}
            >
              Monthly Billing
            </button>
            <button
              type="button"
              onClick={() => setBillingCycle("yearly")}
              className={`px-4 py-2 rounded-lg text-xs font-bold transition-all flex items-center gap-1.5 ${
                isYearly
                  ? "bg-[#4F46E5] text-white shadow-xs"
                  : "text-[#464555] dark:text-slate-400 hover:text-[#131b2e] dark:hover:text-white"
              }`}
            >
              <span>Annual Billing</span>
              <span
                className={`px-1.5 py-0.5 rounded-full text-[10px] font-bold ${
                  isYearly
                    ? "bg-white text-[#4F46E5]"
                    : "bg-[#dbe1ff] dark:bg-indigo-950 text-[#003ea8] dark:text-indigo-300"
                }`}
              >
                Save 20%
              </span>
            </button>
          </div>
        </section>

        {/* Pricing Cards Grid */}
        <section className="w-full max-w-7xl mx-auto px-6 sm:px-8 pb-20">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-stretch">
            {/* Free Tier */}
            <div className="bg-white dark:bg-[#0d1c2d] p-8 rounded-2xl shadow-xs flex flex-col justify-between border border-slate-200/80 dark:border-[#1e2d42] hover:border-slate-300 dark:hover:border-slate-600 transition-all">
              <div>
                <h3 className="text-xl font-bold text-[#131b2e] dark:text-white">Free</h3>
                <p className="text-xs text-[#464555] dark:text-slate-400 mt-1">
                  For individual developers and small side-hustles.
                </p>
                <div className="my-6">
                  <span className="text-4xl font-extrabold text-[#131b2e] dark:text-white">
                    $0
                  </span>
                  <span className="text-xs text-[#464555] dark:text-slate-400"> / month forever</span>
                </div>
                <ul className="space-y-3.5 text-sm text-[#131b2e] dark:text-slate-200 mb-8">
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                    <span>Up to 3 active projects</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                    <span>Standard Kanban board</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                    <span>Basic task management</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                    <span>Community forum support</span>
                  </li>
                  <li className="flex items-center gap-2.5 text-slate-400 dark:text-slate-500">
                    <X className="w-4 h-4 text-slate-300 dark:text-slate-600 flex-shrink-0" />
                    <span className="line-through">Real-time team presence</span>
                  </li>
                  <li className="flex items-center gap-2.5 text-slate-400 dark:text-slate-500">
                    <X className="w-4 h-4 text-slate-300 dark:text-slate-600 flex-shrink-0" />
                    <span className="line-through">Custom RBAC permissions</span>
                  </li>
                </ul>
              </div>
              <Link href={ROUTES.REGISTER}>
                <Button
                  variant="outline"
                  className="w-full py-5 rounded-xl border-slate-200 dark:border-[#1e2d42] hover:bg-slate-50 dark:hover:bg-[#162a45] text-[#131b2e] dark:text-white font-semibold text-sm"
                >
                  Start Free
                </Button>
              </Link>
            </div>

            {/* Pro Tier (Popular) */}
            <div className="bg-white dark:bg-[#0f1f33] p-8 rounded-2xl shadow-xl flex flex-col justify-between relative ring-2 ring-[#4F46E5] dark:ring-indigo-500 border border-transparent">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 px-4 py-1 rounded-full bg-[#4F46E5] text-white text-[11px] font-bold uppercase tracking-wider shadow-md flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 fill-white" />
                <span>Most Popular</span>
              </div>
              <div>
                <h3 className="text-xl font-bold text-[#131b2e] dark:text-white">Pro</h3>
                <p className="text-xs text-[#464555] dark:text-slate-400 mt-1">
                  For growing product teams shipping features every week.
                </p>
                <div className="my-6">
                  <span className="text-4xl font-extrabold text-[#131b2e] dark:text-white">
                    {isYearly ? "$9.60" : "$12"}
                  </span>
                  <span className="text-xs text-[#464555] dark:text-slate-400">
                    {" "}
                    / user / month {isYearly && "(billed annually)"}
                  </span>
                </div>
                <ul className="space-y-3.5 text-sm text-[#131b2e] dark:text-slate-200 mb-8">
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#4F46E5] dark:text-indigo-400 flex-shrink-0" />
                    <span className="font-semibold">Unlimited projects</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#4F46E5] dark:text-indigo-400 flex-shrink-0" />
                    <span>Real-time team collaboration</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#4F46E5] dark:text-indigo-400 flex-shrink-0" />
                    <span>Advanced tags, filters & dependencies</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#4F46E5] dark:text-indigo-400 flex-shrink-0" />
                    <span>Velocity & cycle-time analytics</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-[#4F46E5] dark:text-indigo-400 flex-shrink-0" />
                    <span>Priority email support (2h SLA)</span>
                  </li>
                  <li className="flex items-center gap-2.5 text-slate-400 dark:text-slate-500">
                    <X className="w-4 h-4 text-slate-300 dark:text-slate-600 flex-shrink-0" />
                    <span className="line-through">Okta SAML 2.0 SSO</span>
                  </li>
                </ul>
              </div>
              <Link href={ROUTES.REGISTER}>
                <Button className="w-full py-5 rounded-xl bg-[#4F46E5] hover:bg-[#3525cd] text-white font-semibold text-sm shadow-md">
                  Start 14-Day Free Trial
                </Button>
              </Link>
            </div>

            {/* Business Tier */}
            <div className="bg-white dark:bg-[#0d1c2d] p-8 rounded-2xl shadow-xs flex flex-col justify-between border border-slate-200/80 dark:border-[#1e2d42] hover:border-slate-300 dark:hover:border-slate-600 transition-all">
              <div>
                <h3 className="text-xl font-bold text-[#131b2e] dark:text-white">Business</h3>
                <p className="text-xs text-[#464555] dark:text-slate-400 mt-1">
                  For scaled organizations demanding compliance & governance.
                </p>
                <div className="my-6">
                  <span className="text-4xl font-extrabold text-[#131b2e] dark:text-white">
                    {isYearly ? "$20" : "$25"}
                  </span>
                  <span className="text-xs text-[#464555] dark:text-slate-400">
                    {" "}
                    / user / month {isYearly && "(billed annually)"}
                  </span>
                </div>
                <ul className="space-y-3.5 text-sm text-[#131b2e] dark:text-slate-200 mb-8">
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                    <span className="font-semibold">Everything in Pro</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                    <span>Advanced RBAC & custom roles</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                    <span>SAML 2.0 / Okta / Azure AD SSO</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                    <span>Complete audit logging & SIEM export</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                    <span>Dedicated customer success manager</span>
                  </li>
                  <li className="flex items-center gap-2.5">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
                    <span>99.99% uptime SLA guarantee</span>
                  </li>
                </ul>
              </div>
              <Link href={ROUTES.REGISTER}>
                <Button
                  variant="outline"
                  className="w-full py-5 rounded-xl border-slate-200 dark:border-[#1e2d42] hover:bg-slate-50 dark:hover:bg-[#162a45] text-[#131b2e] dark:text-white font-semibold text-sm"
                >
                  Contact Enterprise Sales
                </Button>
              </Link>
            </div>
          </div>
        </section>

        {/* Feature Comparison Matrix */}
        <section className="w-full py-16 bg-white dark:bg-[#08121f] border-t border-slate-200/70 dark:border-[#1e2d42]">
          <div className="max-w-7xl mx-auto px-6 sm:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12">
              <h2 className="text-2xl sm:text-3xl font-bold text-[#131b2e] dark:text-white">
                Feature Matrix Comparison
              </h2>
              <p className="text-sm text-[#464555] dark:text-slate-400 mt-1">
                Deep dive into capabilities across all TaskFlow tiers.
              </p>
            </div>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-sm border-collapse">
                <thead>
                  <tr className="border-b border-slate-200 dark:border-[#1e2d42] text-xs font-bold uppercase tracking-wider text-[#464555] dark:text-slate-400">
                    <th className="py-4 px-4">Feature</th>
                    <th className="py-4 px-4">Free</th>
                    <th className="py-4 px-4 text-[#4F46E5] dark:text-indigo-400">Pro</th>
                    <th className="py-4 px-4">Business</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100 dark:divide-[#1e2d42] text-[#131b2e] dark:text-slate-200">
                  <tr>
                    <td className="py-3.5 px-4 font-semibold">Active Projects</td>
                    <td className="py-3.5 px-4 text-[#464555] dark:text-slate-400">3 projects</td>
                    <td className="py-3.5 px-4 font-semibold text-[#4F46E5] dark:text-indigo-400">Unlimited</td>
                    <td className="py-3.5 px-4 font-semibold">Unlimited</td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-4 font-semibold">Kanban Boards</td>
                    <td className="py-3.5 px-4 text-[#464555] dark:text-slate-400">Standard</td>
                    <td className="py-3.5 px-4 text-[#4F46E5] dark:text-indigo-400">Custom Columns + WIP</td>
                    <td className="py-3.5 px-4">Custom Columns + WIP</td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-4 font-semibold">Team Members</td>
                    <td className="py-3.5 px-4 text-[#464555] dark:text-slate-400">Up to 3</td>
                    <td className="py-3.5 px-4 text-[#4F46E5] dark:text-indigo-400">Unlimited</td>
                    <td className="py-3.5 px-4">Unlimited</td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-4 font-semibold">File Attachments</td>
                    <td className="py-3.5 px-4 text-[#464555] dark:text-slate-400">50 MB</td>
                    <td className="py-3.5 px-4 text-[#4F46E5] dark:text-indigo-400">10 GB / user</td>
                    <td className="py-3.5 px-4">100 GB / user</td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-4 font-semibold">Analytics & Charts</td>
                    <td className="py-3.5 px-4 text-[#464555] dark:text-slate-400">Basic Overview</td>
                    <td className="py-3.5 px-4 text-[#4F46E5] dark:text-indigo-400">Velocity & Burndown</td>
                    <td className="py-3.5 px-4">Custom BI Exports</td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-4 font-semibold">Security & SSO</td>
                    <td className="py-3.5 px-4 text-slate-300 dark:text-slate-600">—</td>
                    <td className="py-3.5 px-4 text-slate-300 dark:text-slate-600">—</td>
                    <td className="py-3.5 px-4 font-semibold text-emerald-600 dark:text-emerald-400">SAML 2.0 / Okta</td>
                  </tr>
                  <tr>
                    <td className="py-3.5 px-4 font-semibold">Audit Logging</td>
                    <td className="py-3.5 px-4 text-slate-300 dark:text-slate-600">—</td>
                    <td className="py-3.5 px-4 text-[#464555] dark:text-slate-400">30-day history</td>
                    <td className="py-3.5 px-4 font-semibold text-emerald-600 dark:text-emerald-400">Infinite + SIEM</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
