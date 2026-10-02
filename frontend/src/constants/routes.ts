// ─── Application Routes ───────────────────────────────────────────────────────
// Single source of truth for all route paths.
// Use these constants everywhere instead of raw strings.

export const ROUTES = {
  // Public / Marketing
  home: "/",
  features: "/features",
  pricing: "/pricing",
  about: "/about",
  contact: "/contact",
  HOME: "/",
  FEATURES: "/features",
  PRICING: "/pricing",
  ABOUT: "/about",
  CONTACT: "/contact",

  // Auth
  login: "/login",
  register: "/register",
  forgotPassword: "/forgot-password",
  resetPassword: "/reset-password",
  acceptInvite: "/accept-invite",
  LOGIN: "/login",
  REGISTER: "/register",
  FORGOT_PASSWORD: "/forgot-password",
  RESET_PASSWORD: "/reset-password",
  ACCEPT_INVITE: "/accept-invite",

  // Dashboard (protected)
  dashboard: "/dashboard",
  DASHBOARD: "/dashboard",

  // Projects
  projects: "/projects",
  PROJECTS: "/projects",
  project: (projectId: string) => `/projects/${projectId}`,
  projectSettings: (projectId: string) => `/projects/${projectId}/settings`,

  // Tasks
  tasks: "/tasks",
  TASKS: "/tasks",

  // Team
  team: "/team",
  TEAM: "/team",

  // Settings
  settings: "/settings",
  SETTINGS: "/settings",
  settingsProfile: "/settings/profile",
} as const;

// Routes that require authentication
export const PROTECTED_ROUTES = [
  "/dashboard",
  "/projects",
  "/tasks",
  "/team",
  "/settings",
];

// Routes that should redirect authenticated users away
export const AUTH_ROUTES = [
  "/login",
  "/register",
  "/forgot-password",
  "/reset-password",
];
