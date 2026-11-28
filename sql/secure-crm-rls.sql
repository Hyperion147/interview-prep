BEGIN;

-- All CRM reads and writes go through authenticated Next.js route handlers.
-- The server connects directly with DATABASE_URL, while Supabase REST clients
-- receive no table policies and therefore cannot bypass application RBAC.
ALTER TABLE public.leads ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.follow_ups ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.travel_packages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visa_applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.chatbot_daily_usage ENABLE ROW LEVEL SECURITY;

-- Staff/auth tables and automation tables must remain server-only as well.
ALTER TABLE public.users ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.admins ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.agents ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.trip_workflow ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_events ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.whatsapp_messages ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lead_automation ENABLE ROW LEVEL SECURITY;

COMMIT;
