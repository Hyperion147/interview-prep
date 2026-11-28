# Setup and operations

## Environment variables

Copy `.env.example` to `.env`. Keep `.env` out of version control.

### Database and authentication

| Variable | Purpose |
| --- | --- |
| `DATABASE_URL` | Direct PostgreSQL connection used by Drizzle and scripts |
| `NEXT_PUBLIC_SUPABASE_URL` | Public Supabase project URL |
| `NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY` | Browser-safe Supabase publishable key |
| `SUPABASE_SERVICE_ROLE_KEY` | Server-only administrative key |
| `ADMIN_EMAIL` | Initial admin email used by the bootstrap script |
| `ADMIN_PASSWORD` | Initial admin password used by the bootstrap script |

### AI

| Variable | Purpose |
| --- | --- |
| `GEMINI_API_KEY` | Gemini access for chatbot and CRM automation |
| `GEMINI_MODEL` | Gemini model name; defaults to the value in `.env.example` |

### WhatsApp Cloud API

| Variable | Purpose |
| --- | --- |
| `WHATSAPP_ACCESS_TOKEN` | Server-side Meta access token |
| `WHATSAPP_PHONE_NUMBER_ID` | Sending phone-number ID, not the visible phone number |
| `WHATSAPP_BUSINESS_ACCOUNT_ID` | WhatsApp Business Account ID |
| `WHATSAPP_APP_SECRET` | App secret used to verify webhook HMAC signatures |
| `WHATSAPP_VERIFY_TOKEN` | Application-defined webhook verification string |
| `WHATSAPP_GRAPH_VERSION` | Graph API version |

## Database initialization

Push the table definitions first:

```bash
pnpm db:push
```

Then apply the workflow SQL in this order when setting up a fresh environment:

1. `sql/secure-crm-rls.sql`
2. `sql/whatsapp-events.sql`
3. `sql/lead-automation.sql`
4. `sql/lead-automation-details.sql`
5. `sql/inbox-ai-workflow.sql`
6. `sql/automation-visibility.sql`
7. `sql/trip-workflow.sql`
8. `sql/traveler-portal-visa-workflow.sql`

Apply each file through the Supabase SQL editor, or with a PostgreSQL client:

```bash
psql "$DATABASE_URL" -v ON_ERROR_STOP=1 -f sql/secure-crm-rls.sql
```

The files are designed for the project schema and should be reviewed before applying them to an existing production database.

## Authentication configuration

In Supabase Authentication:

1. Set the site URL for the deployed application.
2. Add local and deployed callback URLs ending in `/auth/callback`.
3. Enable Google if customer OAuth is required.
4. Configure email confirmation according to the deployment policy.
5. Run `pnpm auth:bootstrap-admin` once the admin variables are set.

Customer registration writes a `user` role. Admin and agent records are managed separately; never promote a customer by editing browser metadata.

## Seed data

Run:

```bash
pnpm db:seed:travelers
```

The script is transactional and idempotent. It expects lead and visa application rows to exist, and safely reuses previously created traveler groups and checklist items.

## Meta webhook configuration

Use a publicly reachable HTTPS callback:

```text
https://your-domain.example/api/webhooks/whatsapp
```

Enter the exact `WHATSAPP_VERIFY_TOKEN` value in Meta and subscribe to the `messages` webhook field. Keep the Meta app secret and access token server-side.

For local development, expose the Next.js server with a stable HTTPS tunnel and update the callback when the tunnel address changes.

## Release checklist

Run all validation commands:

```bash
pnpm exec tsc --noEmit
pnpm lint
pnpm test
pnpm build
```

Before production deployment, also verify:

- Supabase callback URLs match the final domain.
- RLS is enabled for customer and staff data tables.
- The service-role key is never present in client bundles.
- Meta webhook verification and signed test delivery succeed.
- The WhatsApp access token is a managed production token rather than a temporary test token.
- Gemini and WhatsApp failure paths hand work to staff instead of silently dropping it.
- Seed scripts are not run against production without an explicit decision.
