# TravelDesk CRM

TravelDesk is a role-based travel agency CRM and customer portal built with Next.js, Supabase, Drizzle, Gemini, and the Meta WhatsApp Cloud API. It combines lead management, conversations, follow-ups, traveler profiles, trip proposals, visas, packages, and agent administration in one workspace.

The dashboard follows a compact relationship-CRM design direction inspired by products such as Breakcold: searchable record lists, focused detail workspaces, visible status, contextual history, and a clear next action.

## Product surfaces

### Customer application

- Marketing homepage, destinations, packages, and enquiry flow
- Google or email/password authentication
- Customer sign-up and logout
- Authenticated portal with trips, travelers, documents, visa progress, and next actions
- Travel-only Gemini chatbot with daily anonymous and authenticated limits

### Admin and agent workspace

- Dashboard analytics backed by current CRM data
- Unified WhatsApp inbox with assignment, internal notes, and AI briefs
- Lead CRUD, AI summaries, scoring, suggested replies, and automation controls
- Follow-up scheduling and status management
- Traveler-party profiles, passport metadata, preferences, and document review
- Trip proposal and booking workflow
- Visa applications and document checklists
- Package management backed by Supabase
- Admin-only agent invitations, permissions, suspension, and account management

## Technology

- Next.js 16 with Cache Components and partial prerendering
- React 19 and TypeScript
- Tailwind CSS, shadcn components, Base UI, and Sonner
- Supabase Auth and PostgreSQL
- Drizzle ORM
- Gemini for summaries, chatbot answers, scoring, and reply drafts
- Meta WhatsApp Cloud API for inbound webhooks and outbound messages

## Requirements

- Node.js 20 or newer
- pnpm 12
- A Supabase project
- A Gemini API key for AI features
- A Meta developer app with the WhatsApp use case for live messaging

## Local setup

1. Install dependencies:

   ```bash
   pnpm install
   ```

2. Create the local environment file:

   ```bash
   cp .env.example .env
   ```

3. Populate the required variables:

   ```dotenv
   DATABASE_URL=postgresql://...
   NEXT_PUBLIC_SUPABASE_URL=https://your-project.supabase.co
   NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=...
   SUPABASE_SERVICE_ROLE_KEY=...
   GEMINI_API_KEY=...
   ```

4. Push the Drizzle schema:

   ```bash
   pnpm db:push
   ```

5. Apply the SQL files in [`sql/`](./sql) through the Supabase SQL editor or `psql`. See [docs/setup.md](./docs/setup.md) for the recommended order.

6. Create the initial admin account:

   ```bash
   pnpm auth:bootstrap-admin
   ```

7. Seed traveler and visa workflow data:

   ```bash
   pnpm db:seed:travelers
   ```

8. Start development:

   ```bash
   pnpm dev
   ```

Open [http://localhost:3000](http://localhost:3000).

## Authentication and roles

| Role | Authentication | Access |
| --- | --- | --- |
| `user` | Google or email/password | Customer portal and public application |
| `agent` | Email/password provisioned by an admin | CRM modules granted through permissions |
| `admin` | Email/password bootstrapped or provisioned securely | Complete CRM and agent management |

Customers can self-register. Agents cannot self-register; an admin creates their authorization from `/admin/agents`.

Important routes:

- `/auth/login` — traveler and staff sign-in modes
- `/auth/signup` — traveler registration
- `/portal` — authenticated customer portal
- `/admin` — protected staff workspace

Supabase session reads are executed behind explicit request-time boundaries. Do not remove `connection()` or the relevant `instant = false` declarations without revalidating Cache Components behavior.

## Database and seeded data

Drizzle table definitions live in [`src/db/schema`](./src/db/schema). Additional workflow migrations and RLS changes live in [`sql`](./sql).

The traveler seed is idempotent. It derives up to three travel parties from existing non-lost leads and creates:

- Primary and accompanying travelers
- Passport metadata and travel preferences
- Requested, uploaded, and approved travel documents
- Five checklist items for up to five visa applications
- Calculated visa progress and document status

It uses non-sensitive demonstration passport suffixes and contact data.

## WhatsApp setup

Configure these server variables:

```dotenv
WHATSAPP_ACCESS_TOKEN=
WHATSAPP_PHONE_NUMBER_ID=
WHATSAPP_BUSINESS_ACCOUNT_ID=
WHATSAPP_APP_SECRET=
WHATSAPP_VERIFY_TOKEN=
WHATSAPP_GRAPH_VERSION=v27.0
```

Set the Meta webhook callback to:

```text
https://your-public-domain.example/api/webhooks/whatsapp
```

Subscribe the WhatsApp `messages` field and use the same verify token in Meta and the application. A Meta test number works for approved test recipients; production messaging and a business-owned number require the corresponding Meta onboarding and verification steps.

Test webhook signing locally with:

```bash
pnpm whatsapp:test-webhook
```

Never expose the access token, app secret, service-role key, or database URL to the browser.

## Development commands

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Start the Next.js development server |
| `pnpm build` | Create and validate a production build |
| `pnpm lint` | Run ESLint |
| `pnpm test` | Run the automated tests |
| `pnpm db:generate` | Generate Drizzle migrations |
| `pnpm db:push` | Push the current Drizzle schema |
| `pnpm db:seed:travelers` | Seed traveler and visa workflow records |
| `pnpm auth:bootstrap-admin` | Create or connect the initial admin |
| `pnpm whatsapp:test-webhook` | Send the signed WhatsApp webhook fixture |

Before handing off changes, run:

```bash
pnpm exec tsc --noEmit
pnpm lint
pnpm test
pnpm build
```

## Documentation

- [Architecture and workflows](./docs/architecture.md)
- [Environment, database, and external-service setup](./docs/setup.md)
