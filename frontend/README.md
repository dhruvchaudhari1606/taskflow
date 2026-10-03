# TaskFlow — Web Client

The Next.js frontend for [TaskFlow](../README.md). It includes a marketing site, authentication flows, and the app itself: workspace dashboard, projects, Kanban boards, tasks, team and settings.

**Stack:** Next.js 16 (App Router, Turbopack) · React 19 · TypeScript 5.9 · Tailwind CSS v4 · shadcn/ui (Base UI) · TanStack Query v5 · Zustand v5 · @dnd-kit · Recharts · Axios

---

## Highlights

### Silent token refresh with request queueing

The backend issues short-lived access tokens in `HttpOnly` cookies. [`src/lib/api/interceptors.ts`](src/lib/api/interceptors.ts) keeps expiry invisible to the user:

```mermaid
sequenceDiagram
    autonumber
    participant UI as React Query hooks
    participant Axios as Axios interceptors
    participant Refresh as Shared refreshPromise
    participant API as TaskFlow API

    UI->>Axios: GET /tasks, GET /projects
    Axios->>API: Requests (access token expired)
    API-->>Axios: 401 Unauthorized
    Note over Axios,Refresh: First 401 starts the refresh; later ones await the same promise
    Axios->>Refresh: performTokenRefresh()
    UI->>Axios: GET /workspaces (sent during refresh)
    Axios->>Refresh: Held until the refresh settles
    Refresh->>API: POST /auth/refresh (refresh_token cookie)
    API-->>Refresh: New cookies
    Axios->>API: Replay /tasks, /projects · send /workspaces
    API-->>UI: 200 OK — no visible interruption
```

- **One refresh at a time.** Every concurrent `401`, and every new request sent mid-refresh, waits on a single shared promise.
- **No custom headers.** Requests are flagged internally (`_skipAuthRefresh`), so the refresh call never triggers extra CORS preflights.
- **Resilient logout.** The user is sent to `/login?callbackUrl=…` only when the refresh itself returns `401` or `403`. Network blips and `5xx` errors don't end the session.

### Route protection

[`src/proxy.ts`](src/proxy.ts) is a Next.js 16 proxy (the successor to `middleware.ts`). It guards dashboard routes and treats a user as signed in if **either** the `access_token` or the `refresh_token` cookie is present. That avoids premature redirects to `/login` while an expired access token is being renewed.

### Kanban board

- Drag-and-drop across custom, per-project board columns, built with `@dnd-kit`.
- Moves update the UI immediately; the new order is saved via `PATCH /api/v1/tasks/:id/reorder`.
- Columns can be added, renamed and deleted. The board also has inline task creation, search and assignee filters.
- Task detail modal with editable title and description, priority, status, due date, tags and a comment thread.

### Dashboard & theming

- Recharts status-distribution and progress charts, KPI tiles and a recent-activity feed built from workspace tasks and comments.
- Light, dark and system themes. An inline script in the root layout applies the saved theme before first paint, so there's no flash of the wrong theme.

## Project structure

```text
frontend/
├── src/
│   ├── app/
│   │   ├── (marketing)/     # Landing, features, pricing, about, contact
│   │   ├── (auth)/          # Login, register (OTP), forgot/reset password, accept invite
│   │   ├── (dashboard)/     # dashboard, projects/[projectId], tasks, team, settings
│   │   ├── layout.tsx       # Root layout, fonts, theme bootstrap script
│   │   └── providers.tsx    # TanStack Query, theme and tooltip providers
│   ├── components/
│   │   ├── ui/              # shadcn/ui primitives
│   │   ├── layout/          # Sidebar, header, public header/footer
│   │   └── common/          # Avatar, badges, dialogs, empty/error states, theme
│   ├── features/            # auth, dashboard, projects, tasks (Kanban), team, workspace, …
│   ├── hooks/               # useDebounce, useHydrated, useCurrentUser, …
│   ├── lib/api/             # Axios client, interceptors, typed API modules
│   ├── stores/              # Zustand: auth, workspace, UI
│   ├── types/               # Shared TypeScript types
│   └── proxy.ts             # Route guard
├── public/                  # Static assets
├── Dockerfile               # Multi-stage build → Next.js standalone server
└── next.config.ts           # output: "standalone"
```

## Getting started

**Prerequisites:** Node.js 22+ and the [TaskFlow backend](../backend/README.md) running on `http://localhost:4000`.

```bash
npm install
```

Create `.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:4000/api/v1
NEXT_PUBLIC_APP_URL=http://localhost:3000
NEXT_PUBLIC_APP_VERSION=1.0.0   # optional: version shown on the landing and login pages
```

```bash
npm run dev     # http://localhost:3000
```

Sign in with a [demo account](../README.md#demo-accounts) such as `sarah.mitchell@taskflow.test` / `password123`.

## Scripts

| Script | Description |
| :-- | :-- |
| `npm run dev` | Dev server (Turbopack) |
| `npm run build` | Production build (standalone output) |
| `npm run start` | Serve the production build |
| `npm run lint` | ESLint (Next.js core-web-vitals + TypeScript rules) |
| `npm run type-check` | `tsc --noEmit` |

## Docker

The [`Dockerfile`](Dockerfile) builds the Next.js standalone server and runs it as a non-root user. `NEXT_PUBLIC_*` values are inlined into the browser bundle at build time, so pass them as build args:

```bash
docker build \
  --build-arg NEXT_PUBLIC_API_URL=https://api.example.com/api/v1 \
  --build-arg NEXT_PUBLIC_APP_URL=https://app.example.com \
  --build-arg NEXT_PUBLIC_APP_VERSION=1.0.0 \
  -t taskflow-frontend .
```

To run the full stack, use the root [`docker-compose.yml`](../docker-compose.yml).

## License

[MIT](../LICENSE)
