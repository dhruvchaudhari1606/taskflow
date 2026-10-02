"use client";

import React, { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu, X, ArrowRight } from "lucide-react";
import { Logo } from "@/components/common/logo";
import { ThemeToggle } from "@/components/common/theme-toggle";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ROUTES } from "@/constants/routes";

const navLinks = [
  { label: "Features", href: ROUTES.FEATURES },
  { label: "Pricing", href: ROUTES.PRICING },
  { label: "About", href: ROUTES.ABOUT },
  { label: "Contact", href: ROUTES.CONTACT },
];

export function PublicHeader() {
  const pathname = usePathname();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/90 dark:bg-[#051424]/90 backdrop-blur-xl shadow-[0_1px_8px_rgba(0,0,0,0.04)] dark:shadow-[0_4px_20px_rgba(0,0,0,0.3)] border-b border-slate-100/60 dark:border-[#1e2d42]/60">
      <div className="max-w-7xl mx-auto px-6 sm:px-8 h-16 flex items-center justify-between">
        {/* Brand Logo */}
        <Logo size="md" href="/" textClassName="text-xl" />

        {/* Desktop Navigation Links */}
        <nav className="hidden md:flex items-center gap-8">
          {navLinks.map((link) => {
            const isActive = pathname === link.href;

            return (
              <Link
                key={link.label}
                href={link.href}
                className={cn(
                  "text-sm font-medium transition-colors hover:text-[#4F46E5]",
                  isActive
                    ? "text-[#4F46E5] font-semibold"
                    : "text-[#464555] dark:text-slate-300"
                )}
              >
                {link.label}
              </Link>
            );
          })}
        </nav>

        {/* Desktop CTA Buttons */}
        <div className="hidden md:flex items-center gap-3">
          <ThemeToggle />
          <Link
            href={ROUTES.LOGIN}
            className="text-sm font-medium text-[#464555] hover:text-[#131b2e] dark:text-slate-300 dark:hover:text-white px-3 py-2 transition-colors"
          >
            Sign In
          </Link>
          <Link href={ROUTES.REGISTER}>
            <Button className="bg-[#4F46E5] hover:bg-[#3525cd] text-white font-medium text-sm px-4 py-2 rounded-lg shadow-sm transition-all hover:shadow hover:scale-[1.01]">
              <span>Get Started</span>
              <ArrowRight className="w-4 h-4 ml-1.5" />
            </Button>
          </Link>
        </div>

        {/* Mobile Hamburger Toggle & Theme Toggle */}
        <div className="md:hidden flex items-center gap-1.5">
          <ThemeToggle />
          <button
            type="button"
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="p-2 text-slate-600 hover:text-slate-900 dark:text-slate-300 rounded-lg transition-colors"
            aria-label="Toggle Navigation Menu"
          >
            {mobileMenuOpen ? (
              <X className="w-6 h-6" />
            ) : (
              <Menu className="w-6 h-6" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile Menu Dropdown */}
      {mobileMenuOpen && (
        <div className="md:hidden bg-white dark:bg-[#051424] border-b border-slate-100 dark:border-[#1e2d42] px-6 py-4 shadow-xl space-y-3 animate-in slide-in-from-top-2 duration-200">
          <nav className="flex flex-col space-y-2">
            {navLinks.map((link) => (
              <Link
                key={link.label}
                href={link.href}
                onClick={() => setMobileMenuOpen(false)}
                className="py-2 text-sm font-medium text-slate-700 dark:text-slate-200 hover:text-[#4F46E5]"
              >
                {link.label}
              </Link>
            ))}
          </nav>
          <div className="pt-3 border-t border-slate-100 dark:border-slate-800 flex flex-col gap-2">
            <Link
              href={ROUTES.LOGIN}
              onClick={() => setMobileMenuOpen(false)}
              className="w-full text-center py-2 text-sm font-medium text-slate-700 dark:text-slate-200 rounded-lg border border-slate-200 dark:border-slate-700"
            >
              Sign In
            </Link>
            <Link
              href={ROUTES.REGISTER}
              onClick={() => setMobileMenuOpen(false)}
            >
              <Button className="w-full bg-[#4F46E5] hover:bg-[#3525cd] text-white">
                Get Started
              </Button>
            </Link>
          </div>
        </div>
      )}
    </header>
  );
}
