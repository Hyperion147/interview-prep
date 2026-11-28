BEGIN;
ALTER TABLE public.lead_automation
    ADD COLUMN IF NOT EXISTS extracted_details jsonb NOT NULL DEFAULT '{}'::jsonb;
COMMIT;
