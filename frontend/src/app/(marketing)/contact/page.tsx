"use client";

import React, { useState } from "react";
import Link from "next/link";
import { PublicHeader } from "@/components/layout/public-header";
import { PublicFooter } from "@/components/layout/public-footer";
import { Button } from "@/components/ui/button";
import { ROUTES } from "@/constants/routes";
import {
  Mail,
  Phone,
  MapPin,
  Clock,
  ExternalLink,
  ShieldCheck,
  CheckCircle2,
  Zap,
  Building2,
  Headphones,
  Send,
  Loader2,
  MessageSquare,
  HelpCircle,
  Sparkles,
  ArrowRight,
} from "lucide-react";
import { toast } from "sonner";

export default function ContactPage() {
  const [firstName, setFirstName] = useState("");
  const [lastName, setLastName] = useState("");
  const [email, setEmail] = useState("");
  const [company, setCompany] = useState("");
  const [teamSize, setTeamSize] = useState("21 - 100 employees");
  const [inquiryType, setInquiryType] = useState("sales");
  const [message, setMessage] = useState("");
  const [subscribeUpdates, setSubscribeUpdates] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!firstName || !email || !message) {
      toast.error("Please provide your name, email, and message");
      return;
    }

    setIsSubmitting(true);

    setTimeout(() => {
      setIsSubmitting(false);
      toast.success(
        "Inquiry received! Our product specialist will respond within 2 hours."
      );
      setMessage("");
    }, 1000);
  };

  return (
    <div className="min-h-screen bg-[#faf8ff] dark:bg-[#051424] text-[#131b2e] dark:text-slate-100 flex flex-col font-sans selection:bg-[#4F46E5] selection:text-white">
      <PublicHeader />

      <main className="w-full pt-16 flex-1">
        {/* ─── Top Intro ────────────────────────────────────────────────────── */}
        <section className="max-w-7xl mx-auto px-6 sm:px-8 pt-12 pb-8 w-full relative">
          <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 pb-4">
            <div className="space-y-3">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#e2dfff] dark:bg-indigo-950/60 text-[#3525cd] dark:text-indigo-300 text-xs font-bold shadow-xs border border-[#c3c0ff]/60 dark:border-indigo-800/40">
                <span className="w-2 h-2 rounded-full bg-[#4F46E5] animate-pulse" />
                <span>Contact Us • We&apos;re here to help</span>
              </div>
              <h1 className="text-4xl sm:text-5xl font-extrabold tracking-tight text-[#131b2e] dark:text-white">
                Let&apos;s talk.
              </h1>
              <p className="text-base text-[#464555] dark:text-slate-300 max-w-xl leading-relaxed">
                Have questions about plans, enterprise deployments, integrations,
                or custom team setups? Our product specialists and support
                engineers are ready to help.
              </p>
            </div>

            {/* Operational Status Pill */}
            <div className="inline-flex items-center gap-2.5 px-4 py-2 rounded-xl bg-white dark:bg-[#0d1c2d] border border-slate-200 dark:border-[#1e2d42] shadow-xs text-xs font-semibold text-[#131b2e] dark:text-slate-200">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
              <span>All Systems Operational</span>
              <span className="text-slate-300 dark:text-slate-600">|</span>
              <span className="text-[#0051d5] dark:text-sky-400 flex items-center gap-1">
                99.99% Uptime
                <ExternalLink className="w-3 h-3" />
              </span>
            </div>
          </div>
        </section>

        {/* ─── Main Two-Column Layout ───────────────────────────────────────── */}
        <section className="max-w-7xl mx-auto px-6 sm:px-8 pb-20 w-full">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* ── Left Form Card ────────────────────────────────────────────── */}
            <div className="lg:col-span-7 bg-white dark:bg-[#0d1c2d] p-6 sm:p-10 rounded-2xl shadow-xl border border-slate-100 dark:border-[#1e2d42] space-y-6">
              <div className="flex items-center justify-between pb-3 border-b border-slate-100 dark:border-[#1e2d42]">
                <div>
                  <h2 className="text-xl font-bold text-[#131b2e] dark:text-white">
                    Send an Inquiry
                  </h2>
                  <p className="text-xs text-[#464555] dark:text-slate-400 mt-0.5">
                    Fill out the brief form below and our team will get back to you
                    promptly.
                  </p>
                </div>
                <span className="hidden sm:inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-[#dbe1ff] dark:bg-sky-950/60 text-[#003ea8] dark:text-sky-300 text-[11px] font-bold">
                  <Zap className="w-3.5 h-3.5" /> Fast Track Routing
                </span>
              </div>

              <form onSubmit={handleSubmit} className="space-y-4">
                {/* First & Last Name */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-[#131b2e] dark:text-slate-200">
                      First Name <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      placeholder="Elena"
                      required
                      className="w-full h-10 px-3.5 bg-slate-50 dark:bg-[#08121f] border border-slate-200 dark:border-[#1e2d42] text-[#131b2e] dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:bg-white dark:focus:bg-[#0d1c2d] transition-all font-sans"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-[#131b2e] dark:text-slate-200">
                      Last Name
                    </label>
                    <input
                      type="text"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      placeholder="Chen"
                      className="w-full h-10 px-3.5 bg-slate-50 dark:bg-[#08121f] border border-slate-200 dark:border-[#1e2d42] text-[#131b2e] dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:bg-white dark:focus:bg-[#0d1c2d] transition-all font-sans"
                    />
                  </div>
                </div>

                {/* Work Email */}
                <div className="space-y-1">
                  <label className="block text-xs font-bold text-[#131b2e] dark:text-slate-200">
                    Work Email Address <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="email"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="elena@company.com"
                    required
                    className="w-full h-10 px-3.5 bg-slate-50 dark:bg-[#08121f] border border-slate-200 dark:border-[#1e2d42] text-[#131b2e] dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:bg-white dark:focus:bg-[#0d1c2d] transition-all font-sans"
                  />
                  <p className="text-[11px] text-[#464555] dark:text-slate-400">
                    Please use your company work domain for prioritized response.
                  </p>
                </div>

                {/* Company Name & Team Size */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-[#131b2e] dark:text-slate-200">
                      Company Name
                    </label>
                    <input
                      type="text"
                      value={company}
                      onChange={(e) => setCompany(e.target.value)}
                      placeholder="Acme Logistics, Inc."
                      className="w-full h-10 px-3.5 bg-slate-50 dark:bg-[#08121f] border border-slate-200 dark:border-[#1e2d42] text-[#131b2e] dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:bg-white dark:focus:bg-[#0d1c2d] transition-all font-sans"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="block text-xs font-bold text-[#131b2e] dark:text-slate-200">
                      Team Size
                    </label>
                    <select
                      value={teamSize}
                      onChange={(e) => setTeamSize(e.target.value)}
                      className="w-full h-10 px-3.5 bg-slate-50 dark:bg-[#08121f] border border-slate-200 dark:border-[#1e2d42] text-[#131b2e] dark:text-white rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:bg-white dark:focus:bg-[#0d1c2d] transition-all font-sans cursor-pointer"
                    >
                      <option value="1 - 10 employees">1 - 10 employees</option>
                      <option value="11 - 50 employees">11 - 50 employees</option>
                      <option value="21 - 100 employees">21 - 100 employees</option>
                      <option value="101 - 500 employees">101 - 500 employees</option>
                      <option value="500+ employees">500+ employees</option>
                    </select>
                  </div>
                </div>

                {/* Inquiry Type Radio Buttons */}
                <div className="space-y-2 pt-1">
                  <label className="block text-xs font-bold text-[#131b2e] dark:text-slate-200">
                    What can we help you with? <span className="text-red-500">*</span>
                  </label>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {[
                      { id: "sales", label: "Sales & Enterprise Demo" },
                      { id: "product", label: "Product & Technology" },
                      { id: "billing", label: "Billing & Invoices" },
                      { id: "partnership", label: "Partnership & Integrations" },
                    ].map((option) => (
                      <label
                        key={option.id}
                        className={`flex items-center gap-2.5 p-3 rounded-xl border text-xs font-semibold cursor-pointer transition-all ${
                          inquiryType === option.id
                            ? "bg-[#e2dfff] dark:bg-indigo-950/80 text-[#3525cd] dark:text-indigo-200 border-[#4F46E5] dark:border-indigo-500"
                            : "bg-slate-50 dark:bg-[#08121f] text-[#131b2e] dark:text-slate-300 border-slate-200 dark:border-[#1e2d42] hover:bg-slate-100 dark:hover:bg-[#132337]"
                        }`}
                      >
                        <input
                          type="radio"
                          name="inquiryType"
                          value={option.id}
                          checked={inquiryType === option.id}
                          onChange={() => setInquiryType(option.id)}
                          className="text-[#4F46E5] focus:ring-[#4F46E5]"
                        />
                        <span>{option.label}</span>
                      </label>
                    ))}
                  </div>
                </div>

                {/* Message Field */}
                <div className="space-y-1 pt-1">
                  <label className="block text-xs font-bold text-[#131b2e] dark:text-slate-200">
                    Message <span className="text-red-500">*</span>
                  </label>
                  <textarea
                    rows={4}
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Tell us a bit about your team's workflow, scale, and what you need assistance with..."
                    required
                    className="w-full p-3.5 bg-slate-50 dark:bg-[#08121f] border border-slate-200 dark:border-[#1e2d42] text-[#131b2e] dark:text-white placeholder:text-slate-400 dark:placeholder:text-slate-500 rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-[#4F46E5] focus:bg-white dark:focus:bg-[#0d1c2d] transition-all font-sans resize-none"
                  />
                </div>

                {/* Subscription Checkbox */}
                <div className="flex items-start gap-2 pt-1">
                  <input
                    id="subscribe-updates"
                    type="checkbox"
                    checked={subscribeUpdates}
                    onChange={(e) => setSubscribeUpdates(e.target.checked)}
                    className="w-4 h-4 mt-0.5 rounded border-slate-300 dark:border-slate-600 text-[#4F46E5] focus:ring-[#4F46E5]"
                  />
                  <label
                    htmlFor="subscribe-updates"
                    className="text-xs text-[#464555] dark:text-slate-400 cursor-pointer select-none leading-snug"
                  >
                    Send me a copy of this request and subscribe to monthly
                    engineering and roadmap updates. Unsubscribe anytime.
                  </label>
                </div>

                {/* Submit Button & SLA */}
                <div className="pt-2 flex flex-col sm:flex-row items-center justify-between gap-4">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full sm:w-auto h-11 px-8 bg-[#4F46E5] hover:bg-[#3525cd] text-white font-bold text-sm rounded-xl shadow-md transition-all duration-150 active:scale-[0.98] flex items-center justify-center space-x-2 disabled:opacity-70 cursor-pointer"
                  >
                    {isSubmitting ? (
                      <>
                        <Loader2 className="w-4 h-4 animate-spin" />
                        <span>Sending Message...</span>
                      </>
                    ) : (
                      <>
                        <span>Send Message</span>
                        <Send className="w-4 h-4" />
                      </>
                    )}
                  </button>

                  <span className="text-xs text-[#464555] dark:text-slate-400 flex items-center gap-1.5">
                    <Zap className="w-3.5 h-3.5 text-[#4F46E5] dark:text-indigo-400" />
                    <span>Typical response time &lt; 2 hours</span>
                  </span>
                </div>
              </form>
            </div>

            {/* ── Right Column ───────────────────────────────────────────── */}
            <div className="lg:col-span-5 space-y-6">
              {/* Direct Communication Channels */}
              <div className="space-y-3">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Direct Communication Channels
                </h3>

                {/* Sales */}
                <div className="p-4 bg-white dark:bg-[#0d1c2d] rounded-2xl shadow-xs border border-slate-100 dark:border-[#1e2d42] space-y-2 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-sm text-[#131b2e] dark:text-white">
                      <Building2 className="w-4 h-4 text-[#4F46E5] dark:text-indigo-400" />
                      <span>Talk to Sales</span>
                    </div>
                    <span className="px-2 py-0.5 bg-[#e2dfff] dark:bg-indigo-950/80 text-[#3525cd] dark:text-indigo-300 text-[10px] font-bold rounded-full">
                      Enterprise
                    </span>
                  </div>
                  <p className="text-xs text-[#464555] dark:text-slate-300 leading-relaxed">
                    Discuss custom pricing, SOC-2 compliance reports, or procurement
                    processes.
                  </p>
                  <div className="pt-1 flex items-center justify-between text-xs">
                    <span className="font-mono text-[#0051d5] dark:text-sky-400">
                      sales@taskflow.example
                    </span>
                    <a
                      href="mailto:sales@taskflow.example"
                      className="text-[#4F46E5] dark:text-indigo-400 font-semibold hover:underline flex items-center gap-1"
                    >
                      Schedule Demo <ExternalLink className="w-3 h-3" />
                    </a>
                  </div>
                </div>

                {/* Technical Support */}
                <div className="p-4 bg-white dark:bg-[#0d1c2d] rounded-2xl shadow-xs border border-slate-100 dark:border-[#1e2d42] space-y-2 hover:shadow-md transition-shadow">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2 font-bold text-sm text-[#131b2e] dark:text-white">
                      <Headphones className="w-4 h-4 text-[#0051d5] dark:text-sky-400" />
                      <span>Technical Support</span>
                    </div>
                    <span className="px-2 py-0.5 bg-emerald-100 dark:bg-emerald-950/80 text-emerald-800 dark:text-emerald-300 text-[10px] font-bold rounded-full">
                      24/7 Priority SLA
                    </span>
                  </div>
                  <p className="text-xs text-[#464555] dark:text-slate-300 leading-relaxed">
                    API debugging, authentication errors, and dedicated engineering
                    escalation.
                  </p>
                  <div className="pt-1 flex items-center justify-between text-xs">
                    <span className="font-mono text-[#0051d5] dark:text-sky-400">
                      support@taskflow.example
                    </span>
                    <span className="text-[#0051d5] dark:text-sky-400 font-semibold cursor-pointer hover:underline flex items-center gap-1">
                      Ticket Portal <ExternalLink className="w-3 h-3" />
                    </span>
                  </div>
                </div>

                {/* Partnerships */}
                <div className="p-4 bg-white dark:bg-[#0d1c2d] rounded-2xl shadow-xs border border-slate-100 dark:border-[#1e2d42] space-y-2 hover:shadow-md transition-shadow">
                  <div className="flex items-center gap-2 font-bold text-sm text-[#131b2e] dark:text-white">
                    <Sparkles className="w-4 h-4 text-[#7e3000] dark:text-amber-400" />
                    <span>Partnerships & Media</span>
                  </div>
                  <p className="text-xs text-[#464555] dark:text-slate-300 leading-relaxed">
                    Technology alliances, co-marketing webinars, or press interviews.
                  </p>
                  <div className="pt-1 flex items-center justify-between text-xs">
                    <span className="font-mono text-[#464555] dark:text-slate-400">
                      press@taskflow.example
                    </span>
                    <span className="text-[#4F46E5] dark:text-indigo-400 font-semibold cursor-pointer hover:underline">
                      Brand Assets
                    </span>
                  </div>
                </div>
              </div>

              {/* Global Headquarters & Hubs */}
              <div className="p-5 bg-white dark:bg-[#0d1c2d] rounded-2xl shadow-xs border border-slate-100 dark:border-[#1e2d42] space-y-3.5">
                <h3 className="text-xs font-bold uppercase tracking-wider text-slate-400 dark:text-slate-500">
                  Global Headquarters & Hubs
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="p-3 bg-[#f2f3ff] dark:bg-[#132337] rounded-xl space-y-1">
                    <div className="text-xs font-bold text-[#131b2e] dark:text-white">
                      San Francisco (HQ)
                    </div>
                    <div className="text-[11px] text-[#464555] dark:text-slate-300">
                      500 Howard St, Suite 400
                      <br />
                      San Francisco, CA 94105
                    </div>
                    <div className="text-[10px] text-slate-400 dark:text-slate-400 pt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> 08:00 - 18:00 PST
                    </div>
                  </div>

                  <div className="p-3 bg-[#f2f3ff] dark:bg-[#132337] rounded-xl space-y-1">
                    <div className="text-xs font-bold text-[#131b2e] dark:text-white">
                      London Hub
                    </div>
                    <div className="text-[11px] text-[#464555] dark:text-slate-300">
                      10 Finsbury Square
                      <br />
                      London, EC2A 1AF
                    </div>
                    <div className="text-[10px] text-slate-400 dark:text-slate-400 pt-1 flex items-center gap-1">
                      <Clock className="w-3 h-3" /> 09:00 - 18:00 GMT
                    </div>
                  </div>
                </div>
              </div>

              {/* Instant Answers Accordion Links */}
              <div className="p-4 bg-[#eaedff]/60 dark:bg-[#0d1c2d]/70 rounded-2xl border border-slate-200/60 dark:border-[#1e2d42] space-y-2 text-xs">
                <span className="font-bold text-[#131b2e] dark:text-white block uppercase tracking-wider text-[10px]">
                  Looking for Instant Answers?
                </span>
                <Link
                  href="/#faq"
                  className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-[#132337] text-[#131b2e] dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#162536] transition-colors font-medium"
                >
                  <span>Looking for REST API or Webhook docs?</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#4F46E5] dark:text-indigo-400" />
                </Link>
                <Link
                  href={ROUTES.PRICING}
                  className="flex items-center justify-between p-2 rounded-lg bg-white dark:bg-[#132337] text-[#131b2e] dark:text-slate-200 hover:bg-slate-50 dark:hover:bg-[#162536] transition-colors font-medium"
                >
                  <span>Need to cancel, pause, or switch plans?</span>
                  <ArrowRight className="w-3.5 h-3.5 text-[#4F46E5] dark:text-indigo-400" />
                </Link>
              </div>
            </div>
          </div>
        </section>

        {/* ─── Bottom Enterprise Trust Bar ──────────────────────────────────── */}
        <section className="w-full bg-white dark:bg-[#08121f] py-10 border-t border-slate-200/70 dark:border-[#1e2d42]">
          <div className="max-w-7xl mx-auto px-6 sm:px-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className="p-4 rounded-xl bg-[#f2f3ff] dark:bg-[#0d1c2d] flex items-center gap-3.5 border border-slate-100 dark:border-[#1e2d42]">
                <div className="w-10 h-10 rounded-xl bg-[#e2dfff] dark:bg-indigo-950 text-[#4F46E5] dark:text-indigo-400 flex items-center justify-center shrink-0">
                  <ShieldCheck className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#131b2e] dark:text-white">
                    SOC 2 Type II Certified
                  </h4>
                  <p className="text-[11px] text-[#464555] dark:text-slate-400">
                    Enterprise-grade security controls and annual third-party audits.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#f2f3ff] dark:bg-[#0d1c2d] flex items-center gap-3.5 border border-slate-100 dark:border-[#1e2d42]">
                <div className="w-10 h-10 rounded-xl bg-[#dbe1ff] dark:bg-sky-950 text-[#0051d5] dark:text-sky-400 flex items-center justify-center shrink-0">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#131b2e] dark:text-white">
                    99.99% Uptime Commitment
                  </h4>
                  <p className="text-[11px] text-[#464555] dark:text-slate-400">
                    Financial-backed SLAs with geo-distributed cloud redundancy.
                  </p>
                </div>
              </div>

              <div className="p-4 rounded-xl bg-[#f2f3ff] dark:bg-[#0d1c2d] flex items-center gap-3.5 border border-slate-100 dark:border-[#1e2d42]">
                <div className="w-10 h-10 rounded-xl bg-[#e2dfff] dark:bg-indigo-950 text-[#3525cd] dark:text-indigo-300 flex items-center justify-center shrink-0">
                  <Headphones className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-[#131b2e] dark:text-white">
                    Dedicated CSM & Engineer
                  </h4>
                  <p className="text-[11px] text-[#464555] dark:text-slate-400">
                    Direct Slack channel connection for high-tier organizations.
                  </p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>

      <PublicFooter />
    </div>
  );
}
