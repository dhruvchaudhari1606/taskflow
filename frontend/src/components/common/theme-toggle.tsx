"use client";

import React, { useState, useRef, useEffect } from "react";
import { Sun, Moon, Laptop, ChevronDown, Check } from "lucide-react";
import { useTheme } from "./theme-provider";
import { cn } from "@/lib/utils";

interface ThemeToggleProps {
  variant?: "icon" | "dropdown" | "pill";
  className?: string;
}

export function ThemeToggle({ variant = "icon", className }: ThemeToggleProps) {
  const { theme, setTheme, toggleTheme, isDark } = useTheme();
  const [menuOpen, setMenuOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  if (variant === "dropdown") {
    return (
      <div className={cn("relative", className)} ref={menuRef}>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="flex items-center gap-2 px-3 py-1.5 rounded-xl text-xs font-semibold bg-slate-100 dark:bg-[#1e293b] border border-slate-200/80 dark:border-[#334155] text-slate-700 dark:text-slate-200 hover:border-[#4F46E5]/40 transition-colors"
          aria-label="Select theme"
        >
          {isDark ? (
            <Moon className="w-3.5 h-3.5 text-[#818cf8]" />
          ) : (
            <Sun className="w-3.5 h-3.5 text-amber-500" />
          )}
          <span className="capitalize">{theme}</span>
          <ChevronDown className="w-3 h-3 text-slate-400" />
        </button>

        {menuOpen && (
          <div className="absolute right-0 mt-2 w-36 bg-white dark:bg-[#111827] rounded-xl shadow-xl border border-slate-200/80 dark:border-[#334155] p-1 z-50 animate-in fade-in zoom-in-95 duration-150">
            <button
              onClick={() => {
                setTheme("light");
                setMenuOpen(false);
              }}
              className={cn(
                "w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors",
                theme === "light"
                  ? "bg-[#e2dfff] text-[#3525cd] font-bold dark:bg-indigo-950/60 dark:text-indigo-300"
                  : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1e293b]"
              )}
            >
              <div className="flex items-center gap-2">
                <Sun className="w-3.5 h-3.5 text-amber-500" />
                <span>Light</span>
              </div>
              {theme === "light" && <Check className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={() => {
                setTheme("dark");
                setMenuOpen(false);
              }}
              className={cn(
                "w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors",
                theme === "dark"
                  ? "bg-[#e2dfff] text-[#3525cd] font-bold dark:bg-indigo-950/60 dark:text-[#818cf8]"
                  : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1e293b]"
              )}
            >
              <div className="flex items-center gap-2">
                <Moon className="w-3.5 h-3.5 text-[#818cf8]" />
                <span>Dark</span>
              </div>
              {theme === "dark" && <Check className="w-3.5 h-3.5" />}
            </button>

            <button
              onClick={() => {
                setTheme("system");
                setMenuOpen(false);
              }}
              className={cn(
                "w-full flex items-center justify-between px-2.5 py-1.5 rounded-lg text-xs font-medium transition-colors",
                theme === "system"
                  ? "bg-[#e2dfff] text-[#3525cd] font-bold dark:bg-indigo-950/60 dark:text-indigo-300"
                  : "text-slate-700 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-[#1e293b]"
              )}
            >
              <div className="flex items-center gap-2">
                <Laptop className="w-3.5 h-3.5 text-slate-400" />
                <span>System</span>
              </div>
              {theme === "system" && <Check className="w-3.5 h-3.5" />}
            </button>
          </div>
        )}
      </div>
    );
  }

  // Default icon toggle button
  return (
    <button
      onClick={toggleTheme}
      className={cn(
        "p-2 rounded-xl text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-[#f8fafc] hover:bg-slate-100 dark:hover:bg-[#1e293b] border border-transparent hover:border-slate-200/60 dark:hover:border-[#334155] transition-all relative",
        className
      )}
      title={`Switch to ${isDark ? "light" : "dark"} mode`}
      aria-label="Toggle theme"
    >
      {isDark ? (
        <Sun className="w-4 h-4 text-amber-400 rotate-0 transition-transform duration-300 hover:rotate-45" />
      ) : (
        <Moon className="w-4 h-4 text-[#4F46E5] rotate-0 transition-transform duration-300 hover:-rotate-12" />
      )}
    </button>
  );
}
