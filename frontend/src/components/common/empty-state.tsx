import React from "react";
import { LucideIcon, FolderKanban } from "lucide-react";
import { cn } from "@/lib/utils";
import { Button } from "@/components/ui/button";

interface EmptyStateProps {
  icon?: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
  className?: string;
}

export function EmptyState({
  icon: Icon = FolderKanban,
  title,
  description,
  actionLabel,
  onAction,
  className,
}: EmptyStateProps) {
  return (
    <div
      className={cn(
        "flex flex-col items-center justify-center p-8 sm:p-12 text-center rounded-2xl bg-white dark:bg-slate-900 border border-dashed border-slate-200 dark:border-slate-800 shadow-sm",
        className
      )}
    >
      <div className="w-14 h-14 rounded-2xl bg-[#e2dfff] dark:bg-indigo-950/60 text-[#4F46E5] flex items-center justify-center mb-4">
        <Icon className="w-7 h-7" />
      </div>
      <h3 className="text-lg font-bold text-[#131b2e] dark:text-slate-100 mb-1">
        {title}
      </h3>
      <p className="text-sm text-[#464555] dark:text-slate-400 max-w-sm mb-6">
        {description}
      </p>
      {actionLabel && onAction && (
        <Button
          onClick={onAction}
          className="bg-[#4F46E5] hover:bg-[#3525cd] text-white shadow-sm"
        >
          {actionLabel}
        </Button>
      )}
    </div>
  );
}
