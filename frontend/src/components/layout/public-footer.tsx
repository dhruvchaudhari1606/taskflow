import React from "react";
import Link from "next/link";
import { Logo } from "@/components/common/logo";
import { ROUTES } from "@/constants/routes";

export function PublicFooter() {
  return (
    <footer className="w-full bg-[#f2f3ff] dark:bg-[#030b14] py-16 border-t border-slate-200/60 dark:border-[#1e2d42]">
      <div className="max-w-7xl mx-auto px-6 sm:px-8">
        {/* Top 4-Column Directory Grid */}
        <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-12">
          {/* Brand Column */}
          <div className="col-span-2 md:col-span-1 space-y-4">
            <Logo size="md" href="/" />
            <p className="text-xs text-[#464555] dark:text-slate-400 leading-relaxed max-w-xs">
              High-velocity project management engineered for modern product teams, cross-functional builders, and scale.
            </p>
          </div>

          {/* Product */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#131b2e] dark:text-slate-100 mb-4">
              Product
            </h4>
            <ul className="space-y-2.5 text-sm text-[#464555] dark:text-slate-400">
              <li>
                <Link href={ROUTES.FEATURES} className="hover:text-[#4F46E5] transition-colors">
                  Features
                </Link>
              </li>
              <li>
                <Link href={ROUTES.PRICING} className="hover:text-[#4F46E5] transition-colors">
                  Pricing
                </Link>
              </li>
              <li>
                <Link href="/#product-demo" className="hover:text-[#4F46E5] transition-colors">
                  Interactive Demo
                </Link>
              </li>
              <li>
                <Link href="/#showcase" className="hover:text-[#4F46E5] transition-colors">
                  Workflows
                </Link>
              </li>
            </ul>
          </div>

          {/* Company */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#131b2e] dark:text-slate-100 mb-4">
              Company
            </h4>
            <ul className="space-y-2.5 text-sm text-[#464555] dark:text-slate-400">
              <li>
                <Link href={ROUTES.ABOUT} className="hover:text-[#4F46E5] transition-colors">
                  About Us
                </Link>
              </li>
              <li>
                <Link href={ROUTES.CONTACT} className="hover:text-[#4F46E5] transition-colors">
                  Contact & Support
                </Link>
              </li>
              <li>
                <span className="cursor-default hover:text-[#4F46E5] transition-colors">
                  Careers (Hiring)
                </span>
              </li>
              <li>
                <span className="cursor-default hover:text-[#4F46E5] transition-colors">
                  Security & SOC-2
                </span>
              </li>
            </ul>
          </div>

          {/* Resources */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#131b2e] dark:text-slate-100 mb-4">
              Resources
            </h4>
            <ul className="space-y-2.5 text-sm text-[#464555] dark:text-slate-400">
              <li>
                <Link href="/#faq" className="hover:text-[#4F46E5] transition-colors">
                  Help & FAQ
                </Link>
              </li>
              <li>
                <span className="cursor-default hover:text-[#4F46E5] transition-colors">
                  API Documentation
                </span>
              </li>
              <li>
                <span className="cursor-default hover:text-[#4F46E5] transition-colors">
                  Product Changelog
                </span>
              </li>
              <li>
                <span className="cursor-default hover:text-[#4F46E5] transition-colors">
                  System Status (99.99%)
                </span>
              </li>
            </ul>
          </div>

          {/* Legal */}
          <div>
            <h4 className="text-xs font-bold uppercase tracking-wider text-[#131b2e] dark:text-slate-100 mb-4">
              Legal
            </h4>
            <ul className="space-y-2.5 text-sm text-[#464555] dark:text-slate-400">
              <li>
                <span className="cursor-default hover:text-[#4F46E5] transition-colors">
                  Privacy Policy
                </span>
              </li>
              <li>
                <span className="cursor-default hover:text-[#4F46E5] transition-colors">
                  Terms of Service
                </span>
              </li>
              <li>
                <span className="cursor-default hover:text-[#4F46E5] transition-colors">
                  Security & SOC-2
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-slate-200/80 dark:border-slate-800 text-xs text-[#464555] dark:text-slate-400">
          <p>© 2026 TaskFlow Inc. All rights reserved.</p>
          <div className="flex items-center gap-6">
            <span className="hover:text-[#4F46E5] cursor-pointer transition-colors">
              Terms
            </span>
            <span>•</span>
            <span className="hover:text-[#4F46E5] cursor-pointer transition-colors">
              Privacy
            </span>
            <span>•</span>
            <span className="hover:text-[#4F46E5] cursor-pointer transition-colors">
              Security
            </span>
          </div>
        </div>
      </div>
    </footer>
  );
}
