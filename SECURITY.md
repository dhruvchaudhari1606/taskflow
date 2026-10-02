# Security Policy

TaskFlow is built with security as a core requirement, especially around authentication and session handling. This document describes how to report a vulnerability and summarises the main safeguards.

## Supported versions

| Version | Supported |
| :-- | :-: |
| `main` (latest) | ✅ |
| Older commits | ❌ |

## Reporting a vulnerability

**Please do not open a public issue, discussion or pull request for security problems.**

1. **Preferred:** Use GitHub's private vulnerability reporting. Open the repository's **[Security tab](https://github.com/dhruvchaudhari1606/TaskFlow/security)**, choose **Report a vulnerability**, and fill in the form.
2. **Alternative:** Email **dhruv.chaudhari1606@gmail.com** with the subject `[SECURITY] TaskFlow — <short summary>`.

Please include:

- the affected component (for example `SessionsService`, `JwtAuthGuard`, `src/proxy.ts`);
- steps to reproduce, or a minimal proof of concept (cURL, Postman, or a Jest test);
- the impact (for example account takeover, session fixation, data exposure);
- a suggested fix, if you have one.

You'll get an acknowledgement as soon as possible, typically within a few days. Confirmed issues are fixed on `main` and disclosed through a GitHub Security Advisory, credited to you unless you'd rather stay anonymous.

## Security design summary

| Area | Safeguard |
| :-- | :-- |
| Token storage | Access and refresh tokens only in `HttpOnly`, `SameSite` cookies (`Secure` in production); never exposed to JavaScript |
| Token rotation | Refresh in a transaction with a row lock (`SELECT … FOR UPDATE`) and a 30-second grace window for parallel tabs |
| Replay detection | Reusing a superseded refresh token revokes all of the user's sessions and writes an audit event |
| Token invalidation | `token_version` on the user; incrementing it invalidates every outstanding access token |
| Passwords | bcrypt with configurable cost; strength policy enforced on register, reset and change |
| Reset & verification tokens | Stored only as SHA-256 hashes and time-limited; reset tokens are compared in constant time and wiped after use |
| HTTP hardening | Helmet (CSP, frameguard, no-sniff, referrer policy), strict CORS allow-list, global and per-route rate limiting |
| Input handling | Global `ValidationPipe` with `whitelist` + `forbidNonWhitelisted` |
| Authorization | Workspace membership checks plus role/permission-based guards (RBAC) |
| Observability | Audit log for auth events; Sentry events have cookies, auth headers and sensitive fields redacted |
| Configuration | Environment validated at startup; no secrets committed or baked into Docker images |

## Scope

**In scope:** authentication or session bypass, privilege escalation across workspaces or roles, token or credential leakage, injection, and rate-limit bypass on auth endpoints.

**Out of scope:** volumetric DoS, social engineering, issues that need a compromised client device, and vulnerabilities in third-party dependencies that aren't exploitable through TaskFlow (please report those upstream).
