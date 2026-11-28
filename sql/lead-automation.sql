BEGIN;

DO $$ BEGIN
    CREATE TYPE public.whatsapp_direction AS ENUM ('inbound', 'outbound');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

DO $$ BEGIN
    CREATE TYPE public.whatsapp_message_status AS ENUM ('received', 'queued', 'sent', 'delivered', 'read', 'failed');
EXCEPTION WHEN duplicate_object THEN NULL;
END $$;

CREATE TABLE IF NOT EXISTS public.lead_automation (
    lead_id uuid PRIMARY KEY REFERENCES public.leads(id) ON DELETE CASCADE,
    auto_reply_enabled boolean NOT NULL DEFAULT true,
    handoff_required boolean NOT NULL DEFAULT false,
    summary text,
    intent text,
    sentiment text,
    priority text,
    missing_details jsonb NOT NULL DEFAULT '[]'::jsonb,
    suggested_reply text,
    extracted_details jsonb NOT NULL DEFAULT '{}'::jsonb,
    last_inbound_at timestamptz,
    last_outbound_at timestamptz,
    summarized_at timestamptz,
    last_viewed_at timestamptz,
    updated_at timestamptz NOT NULL DEFAULT now(),
    CONSTRAINT lead_automation_intent_check CHECK (intent IS NULL OR intent IN ('researching', 'planning', 'ready_to_book', 'support', 'unknown')),
    CONSTRAINT lead_automation_sentiment_check CHECK (sentiment IS NULL OR sentiment IN ('positive', 'neutral', 'negative')),
    CONSTRAINT lead_automation_priority_check CHECK (priority IS NULL OR priority IN ('low', 'medium', 'high'))
);

CREATE TABLE IF NOT EXISTS public.whatsapp_messages (
    id text PRIMARY KEY,
    lead_id uuid NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
    direction public.whatsapp_direction NOT NULL,
    status public.whatsapp_message_status NOT NULL,
    body text NOT NULL,
    error text,
    provider_timestamp timestamptz,
    created_at timestamptz NOT NULL DEFAULT now(),
    updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS whatsapp_messages_lead_idx ON public.whatsapp_messages (lead_id, created_at);
CREATE INDEX IF NOT EXISTS whatsapp_messages_status_idx ON public.whatsapp_messages (status);

ALTER TABLE public.lead_automation ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_messages ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.crm_automation_settings (
    id text PRIMARY KEY DEFAULT 'default',
    whatsapp_auto_reply_enabled boolean NOT NULL DEFAULT true,
    updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.crm_automation_settings ENABLE ROW LEVEL SECURITY;
INSERT INTO public.crm_automation_settings (id) VALUES ('default') ON CONFLICT DO NOTHING;

COMMIT;
