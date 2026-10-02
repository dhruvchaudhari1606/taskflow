import React from "react";
import Link from "next/link";
import { cn } from "@/lib/utils";

interface LogoProps {
  size?: "sm" | "md" | "lg";
  showText?: boolean;
  textClassName?: string;
  className?: string;
  href?: string;
}

const sizeMap = {
  sm: { icon: 28, rx: 7, text: "text-base", circle: 2.2, stroke: 2.6 },
  md: { icon: 36, rx: 9, text: "text-lg", circle: 2.8, stroke: 3.2 },
  lg: { icon: 44, rx: 11, text: "text-xl", circle: 3.2, stroke: 3.8 },
};

export function TaskFlowIcon({
  className,
  size = "md",
}: {
  className?: string;
  size?: "sm" | "md" | "lg";
}) {
  const { icon } = sizeMap[size];

  return (
    <svg
      width={icon}
      height={icon}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("flex-shrink-0 transition-transform hover:scale-105", className)}
      aria-label="TaskFlow Logo"
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
  );
}

export function Logo({
  size = "md",
  showText = true,
  textClassName,
  className,
  href = "/",
}: LogoProps) {
  const { text } = sizeMap[size];

  const content = (
    <div className={cn("inline-flex items-center gap-2.5 select-none", className)}>
      <TaskFlowIcon size={size} />
      {showText && (
        <span
          className={cn(
            "font-bold tracking-tight text-[#131b2e] dark:text-white font-sans",
            text,
            textClassName
          )}
        >
          TaskFlow
        </span>
      )}
    </div>
  );

  if (href) {
    return (
      <Link href={href} className="inline-flex items-center focus:outline-none">
        {content}
      </Link>
    );
  }

  return content;
}
