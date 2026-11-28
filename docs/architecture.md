# Architecture and workflows

## Application boundaries

TravelDesk has three primary boundaries:

1. Public and customer routes under `src/app`, including the landing site, enquiry flow, authentication, packages, and `/portal`.
2. Staff routes under `src/app/admin`, protected by the admin layout and permission-aware API handlers.
3. Server integrations under `src/app/api`, including CRM CRUD, Gemini features, WhatsApp messaging, and Meta webhooks.

Database access is centralized through `src/db/index.ts`, with Drizzle schemas in `src/db/schema`. Supabase provides authentication while PostgreSQL remains the source of truth for CRM records.

## Role model

- `users` contains customer identities created through Google OAuth or email/password registration.
- `admins` contains privileged staff identities.
- `agents` contains staff provisioned by an admin, including status and permissions.

`getStaffIdentity()` validates the Supabase user against `admins` and `agents`. API routes use `canAccess(permission)` or `requireAdmin()` rather than trusting a role sent by the browser.

## Lead lifecycle

The operational lifecycle is:

```text
Enquiry → Lead → Conversation → Qualification → Proposal → Booking → Trip
                   ↓                ↓              ↓
               Follow-up        Traveler data   Visa workflow
```

Lead statuses are `new`, `contacted`, `qualified`, `proposal_sent`, `won`, and `lost`.

Automation can:

- Generate a Gemini lead summary and lead score
- Produce a suggested WhatsApp reply
- Decide whether a conversation needs human review
- Create or expose scheduled follow-up work
- Record automation history and staff acceptance

Sensitive requests, explicit requests for a human, stale messages, unsupported content, and messages outside the configured automation window are handed to staff.

## WhatsApp conversation flow

1. Meta calls `GET /api/webhooks/whatsapp` to verify the configured token.
2. Meta sends message and delivery events to `POST /api/webhooks/whatsapp`.
3. The endpoint validates the `X-Hub-Signature-256` HMAC using `WHATSAPP_APP_SECRET`.
4. Inbound messages are normalized and stored idempotently by Meta message ID.
5. The lead and automation state are updated.
6. Eligible messages receive a concise Gemini-assisted response; other messages enter the staff inbox.
7. Outbound delivery states are updated without allowing an older event to regress a newer state.

## Traveler profiles

`traveler_groups` represents a customer party and can link back to a lead and assigned agent. A group includes emergency-contact metadata and contains one or more `travelers`.

A traveler record stores only the passport suffix needed by the CRM UI, alongside passport country and expiry. Full document files should be kept in a private Supabase Storage bucket; `traveler_documents.storage_path` stores the private object path rather than a public URL.

Document states are `requested`, `uploaded`, `approved`, `rejected`, and `expired`. Rejections retain a customer-visible reason.

## Visa workflow

Visa applications contain high-level application state, document state, and calculated progress. `visa_checklist_items` provides the operational checklist for each application.

Checklist states are:

- `missing`
- `uploaded`
- `under_review`
- `approved`
- `rejected`
- `not_required`

Reviewing an item recalculates the parent application progress and document status. The customer portal exposes the same checklist as a read-only action list, while staff review it from the visa detail workspace.

## Customer portal

The portal joins records by the authenticated, confirmed customer email. It exposes only that customer’s:

- Active proposals and bookings
- Traveler party
- Document status and rejection feedback
- Visa applications and checklist progress
- Prioritized next actions

The portal does not accept a customer ID from the browser. The server derives identity from the Supabase session.

## UI conventions

- Use shadcn/Base UI primitives from `src/components/ui`.
- Use `SelectField` rather than native `<select>` elements.
- Use Sonner through the CRM request helper for mutation feedback.
- Use skeletons for route and record loading states.
- Prefer a list/detail workspace for relationship records.
- Put the current status and next action near the top of a detail view.
- When rendering a Next.js `Link` through the Base UI `Button` render prop, set `nativeButton={false}`.

## Next.js request-time constraints

This project uses Cache Components. Supabase validates token expiry with the current time, so session checks must not run in the prerender shell.

Server Components that read Supabase sessions must:

1. Live behind an appropriate `Suspense` boundary where practical.
2. Call `await connection()` before `auth.getUser()` or another helper that evaluates the session.
3. Opt out with `export const instant = false` where the route cannot satisfy instant-navigation validation.

Client effects using `AbortController` must handle the rejected request and abort with a cleanup reason to avoid unhandled development errors.
