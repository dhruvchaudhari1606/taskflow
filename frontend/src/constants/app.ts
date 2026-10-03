/**
 * Product domain used for display URLs and demo addresses.
 * `.test` is reserved (RFC 2606) and can never receive real mail, so demo
 * invites or verification emails can't reach a third party.
 */
export const APP_DOMAIN = "taskflow.test";

/** Public workspace URL shown in the UI, e.g. "https://app.taskflow.test/alpha-operations". */
export const workspaceUrl = (slug = "") => `https://app.${APP_DOMAIN}/${slug}`;

/**
 * App version shown in the UI (landing badge, login badge).
 * Set NEXT_PUBLIC_APP_VERSION where the frontend is built (.env.local, Vercel,
 * or the Docker build arg). Read literally so Next.js inlines it into the
 * browser bundle; the fallback only applies when the variable is unset.
 */
export const APP_VERSION = process.env.NEXT_PUBLIC_APP_VERSION || "1.0.0";

/** Seats included in the workspace plan (members + pending invitations). */
export const PLAN_SEAT_LIMIT = 10;
