import React from "react";
import Image from "next/image";
import { cn, getInitials } from "@/lib/utils";

interface AvatarProps {
  name?: string;
  fallback?: string;
  alt?: string;
  avatarUrl?: string | null;
  src?: string | null;
  size?: "xs" | "sm" | "md" | "lg";
  isOnline?: boolean;
  className?: string;
}

const sizeClasses = {
  xs: "w-6 h-6 text-[10px]",
  sm: "w-8 h-8 text-xs",
  md: "w-10 h-10 text-sm",
  lg: "w-12 h-12 text-base",
};

// Distinct vibrant background colors for initials
const avatarBgColors = [
  "bg-indigo-600 text-white",
  "bg-blue-600 text-white",
  "bg-violet-600 text-white",
  "bg-amber-600 text-white",
  "bg-emerald-600 text-white",
  "bg-rose-600 text-white",
  "bg-sky-600 text-white",
];

function getBgColor(name: string) {
  let hash = 0;
  for (let i = 0; i < name.length; i++) {
    hash = name.charCodeAt(i) + ((hash << 5) - hash);
  }
  return avatarBgColors[Math.abs(hash) % avatarBgColors.length];
}

export function UserAvatar({
  name,
  fallback,
  alt,
  avatarUrl,
  src,
  size = "sm",
  isOnline,
  className,
}: AvatarProps) {
  const displayName = (name || fallback || alt || "").trim();
  const displayUrl = src ?? avatarUrl;
  const initials = displayName ? getInitials(displayName) : "?";
  const colorClass = getBgColor(displayName || "A");

  return (
    <div className="relative inline-flex items-center justify-center flex-shrink-0">
      <div
        className={cn(
          "rounded-full flex items-center justify-center font-bold font-sans overflow-hidden ring-2 ring-white dark:ring-slate-900 shadow-sm",
          sizeClasses[size],
          !displayUrl && colorClass,
          className
        )}
      >
        {displayUrl ? (
          <img
            src={displayUrl}
            alt={displayName}
            className="w-full h-full object-cover"
          />
        ) : (
          <span>{initials}</span>
        )}
      </div>

      {typeof isOnline === "boolean" && (
        <span
          className={cn(
            "absolute bottom-0 right-0 rounded-full ring-1.5 ring-white dark:ring-slate-900",
            size === "xs" ? "w-1.5 h-1.5" : "w-2 h-2",
            isOnline ? "bg-emerald-500" : "bg-slate-400"
          )}
          title={isOnline ? "Online" : "Offline"}
        />
      )}
    </div>
  );
}

export { UserAvatar as Avatar };
