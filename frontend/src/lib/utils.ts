import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";
import { formatDistanceToNow, format, parseISO } from "date-fns";

// ─── Tailwind Class Merger ────────────────────────────────────────────────────

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// ─── Date Utilities ───────────────────────────────────────────────────────────

/**
 * Format a date string or Date object to a readable format
 * e.g. "Jan 15, 2025"
 */
export function formatDate(date: string | Date | null | undefined): string {
  if (!date) return "—";
  try {
    const parsed = typeof date === "string" ? parseISO(date) : date;
    return format(parsed, "MMM d, yyyy");
  } catch {
    return "—";
  }
}

/**
 * Format a date as relative time
 * e.g. "2 minutes ago", "3 days ago"
 */
export function formatRelativeTime(
  date: string | Date | null | undefined
): string {
  if (!date) return "—";
  try {
    const parsed = typeof date === "string" ? parseISO(date) : date;
    return formatDistanceToNow(parsed, { addSuffix: true });
  } catch {
    return "—";
  }
}

/**
 * Format a date for display in short format
 * e.g. "Jan 15"
 */
export function formatShortDate(
  date: string | Date | null | undefined
): string {
  if (!date) return "—";
  try {
    const parsed = typeof date === "string" ? parseISO(date) : date;
    return format(parsed, "MMM d");
  } catch {
    return "—";
  }
}

// ─── String Utilities ─────────────────────────────────────────────────────────

/**
 * Truncate a string to a max length with ellipsis
 */
export function truncate(str: string | null | undefined, maxLength: number): string {
  if (!str) return "";
  if (str.length <= maxLength) return str;
  return `${str.slice(0, maxLength)}...`;
}

/**
 * Get user initials from a name for avatar fallback
 * e.g. "John Doe" → "JD"
 */
export function getInitials(name: string | null | undefined): string {
  if (!name || typeof name !== "string") return "?";
  const clean = name.trim();
  if (!clean) return "?";
  const parts = clean.split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "?";
  if (parts.length === 1) {
    return parts[0][0]?.toUpperCase() || "?";
  }
  return ((parts[0][0] || "") + (parts[parts.length - 1][0] || "")).toUpperCase();
}

/**
 * Convert a string to a URL-friendly slug
 * e.g. "My Project Name" → "my-project-name"
 */
export function toSlug(str: string): string {
  return str
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

// ─── Number Utilities ─────────────────────────────────────────────────────────

/**
 * Calculate progress percentage
 * e.g. getProgress(8, 10) → 80
 */
export function getProgress(
  completed: number,
  total: number
): number {
  if (total === 0) return 0;
  return Math.round((completed / total) * 100);
}

// ─── API Error Parsing ────────────────────────────────────────────────────────

/**
 * Extract a readable error message from an Axios/API error
 */
export function getErrorMessage(error: unknown): string {
  if (typeof error === "string") return error;

  if (error && typeof error === "object") {
    const axiosError = error as {
      response?: { data?: { message?: string } };
      message?: string;
    };
    return (
      axiosError.response?.data?.message ||
      axiosError.message ||
      "Something went wrong. Please try again."
    );
  }

  return "Something went wrong. Please try again.";
}
