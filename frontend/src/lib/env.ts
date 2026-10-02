import { z } from "zod";

// ─── Environment Variable Schema ──────────────────────────────────────────────
// Validates all required env vars at startup. The app will throw a clear,
// descriptive error if any required variable is missing or malformed.

const envSchema = z.object({
  NEXT_PUBLIC_API_URL: z
    .string()
    .url("NEXT_PUBLIC_API_URL must be a valid URL")
    .min(1, "NEXT_PUBLIC_API_URL is required"),

  NEXT_PUBLIC_APP_URL: z
    .string()
    .url("NEXT_PUBLIC_APP_URL must be a valid URL")
    .min(1, "NEXT_PUBLIC_APP_URL is required"),
});

// ─── Parsed & Validated Env ───────────────────────────────────────────────────

const _parsed = envSchema.safeParse(process.env);

if (!_parsed.success) {
  console.error(
    "❌ Invalid environment variables:\n",
    _parsed.error.flatten().fieldErrors
  );
  throw new Error("Invalid environment variables — check your .env.local file");
}

export const env = _parsed.data;
