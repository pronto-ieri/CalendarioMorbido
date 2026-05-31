# Authentication — Analysis and Decision

## Context

Two popular libraries were ruled out upfront:

- **Lucia** — officially deprecated in early 2025, now a learning resource only
- **Auth.js v5** — in beta for nearly two years, no released Fastify support, maintenance transferred to the Better Auth team. Ruled out.

---

## Comparison

| Criterion | Clerk | Auth0 | Better Auth (self-hosted) | Custom @fastify/jwt + bcrypt |
| --- | --- | --- | --- | --- |
| **Free tier** | 50K MAU | 25K MAU | Unlimited (infra cost only) | Unlimited |
| **Paid starts at** | $25/mo (Pro) | $35/mo (Essentials) | Free (MIT) | Free |
| **Email/password** | Yes | Yes | Yes | DIY |
| **Email verification** | Yes | Yes | Yes (requires email sender) | DIY |
| **Password reset** | Yes | Yes | Yes (requires email sender) | DIY |
| **OAuth providers** | Yes (Pro for unlimited) | Yes | Yes (many built-in) | DIY |
| **MFA** | Pro plan only | Essentials+ only | Yes (free plugin) | DIY |
| **User data location** | Clerk servers (EU) | Auth0 servers (EU) | Own PostgreSQL | Own PostgreSQL |
| **TypeScript** | Excellent | Good | Excellent | Depends on implementation |
| **Fastify support** | Official SDK | Official SDK (Apr 2025) | Official guide + community plugin | Native |
| **Time to working** | 2–4 hours | 4–8 hours | 4–6 hours | 2–4 weeks |
| **Ongoing maintenance** | Near-zero | Low | Low-medium | High |
| **Vendor lock-in** | High | High | None | None |

---

## Option Analysis

### Clerk

The best managed service option. Official Fastify SDK, 50K MAU free, setup in a few hours. User data resides on Clerk servers (EU, GDPR-compliant) but is not owned by the project. MFA available on Pro plan only ($25/mo).

### Auth0

More complex to configure, lower free tier (25K MAU), MFA costs extra. No concrete advantage over Clerk for this use case.

### Better Auth (self-hosted)

MIT library running inside the Fastify process. User data stays in the PostgreSQL already on Railway. OAuth, MFA, email verification and password reset included as free plugins. Native Drizzle integration. YC-backed ($5M funding), low abandonment risk. Only overhead: configuring an email sender for verification and reset (Resend: free up to 3K emails/month).

### Custom @fastify/jwt + bcrypt

Full control, zero external dependencies. However, correctly implementing refresh token rotation, revocation, rate limiting and all security flows requires 2–4 weeks. Not justified for MVP.

---

## Decision

**Better Auth self-hosted** is the recommended choice for this project:

- User data stays in PostgreSQL on Railway — GDPR handled, no vendor lock-in
- Zero per-user cost, no billing surprises as the app grows
- Fastify officially supported, Railway templates exist for this exact stack
- Direct integration with Drizzle (already chosen for migrations)

**Alternative** if zero maintenance is preferred and storing user data on third-party servers is acceptable: **Clerk** (official Fastify SDK, 50K MAU free).
