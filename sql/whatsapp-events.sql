BEGIN;
CREATE TABLE IF NOT EXISTS public.whatsapp_events (
    id text PRIMARY KEY,
    lead_id uuid REFERENCES public.leads(id) ON DELETE SET NULL,
    status text NOT NULL,
    created_at timestamptz NOT NULL DEFAULT now()
);
ALTER TABLE public.whatsapp_events ENABLE ROW LEVEL SECURITY;
COMMIT;
