BEGIN;
ALTER TABLE public.lead_automation
    ADD COLUMN IF NOT EXISTS last_viewed_at timestamptz;
CREATE TABLE IF NOT EXISTS public.crm_automation_settings (
    id text PRIMARY KEY DEFAULT 'default',
    whatsapp_auto_reply_enabled boolean NOT NULL DEFAULT true,
    updated_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.crm_automation_settings ENABLE ROW LEVEL SECURITY;
INSERT INTO public.crm_automation_settings (id) VALUES ('default') ON CONFLICT DO NOTHING;
COMMIT;
