BEGIN;
DO $$ BEGIN CREATE TYPE public.inbox_status AS ENUM ('open', 'done'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.lead_activity_kind AS ENUM ('note', 'ai_summary', 'stage_change', 'assignment'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

ALTER TABLE public.lead_automation
    ADD COLUMN IF NOT EXISTS inbox_status public.inbox_status NOT NULL DEFAULT 'open',
    ADD COLUMN IF NOT EXISTS important boolean NOT NULL DEFAULT false,
    ADD COLUMN IF NOT EXISTS assigned_agent_id uuid REFERENCES public.agents(id) ON DELETE SET NULL,
    ADD COLUMN IF NOT EXISTS lead_score integer NOT NULL DEFAULT 0,
    ADD COLUMN IF NOT EXISTS score_reasons jsonb NOT NULL DEFAULT '[]'::jsonb,
    ADD COLUMN IF NOT EXISTS prompt_version text,
    ADD COLUMN IF NOT EXISTS model text;

CREATE TABLE IF NOT EXISTS public.lead_ai_insight_history (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id uuid NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
    summary text NOT NULL,
    intent text NOT NULL,
    sentiment text NOT NULL,
    priority text NOT NULL,
    missing_details jsonb NOT NULL DEFAULT '[]'::jsonb,
    suggested_reply text NOT NULL,
    edited_reply text,
    extracted_details jsonb NOT NULL DEFAULT '{}'::jsonb,
    lead_score integer NOT NULL DEFAULT 0,
    score_reasons jsonb NOT NULL DEFAULT '[]'::jsonb,
    model text NOT NULL,
    prompt_version text NOT NULL,
    accepted_at timestamptz,
    created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS lead_ai_history_lead_idx ON public.lead_ai_insight_history (lead_id, created_at);
ALTER TABLE public.lead_ai_insight_history ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.lead_activities (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    lead_id uuid NOT NULL REFERENCES public.leads(id) ON DELETE CASCADE,
    kind public.lead_activity_kind NOT NULL,
    body text NOT NULL,
    metadata jsonb NOT NULL DEFAULT '{}'::jsonb,
    created_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS lead_activities_lead_idx ON public.lead_activities (lead_id, created_at);
ALTER TABLE public.lead_activities ENABLE ROW LEVEL SECURITY;

COMMIT;
