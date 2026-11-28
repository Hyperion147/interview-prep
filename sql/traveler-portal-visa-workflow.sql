BEGIN;
DO $$ BEGIN CREATE TYPE public.traveler_group_status AS ENUM ('prospect','active','completed','cancelled'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.traveler_document_status AS ENUM ('requested','uploaded','approved','rejected','expired'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;
DO $$ BEGIN CREATE TYPE public.visa_checklist_status AS ENUM ('missing','uploaded','under_review','approved','rejected','not_required'); EXCEPTION WHEN duplicate_object THEN NULL; END $$;

CREATE TABLE IF NOT EXISTS public.traveler_groups (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), lead_id uuid REFERENCES public.leads(id) ON DELETE SET NULL,
 name varchar(180) NOT NULL, customer_email varchar(254) NOT NULL, status public.traveler_group_status NOT NULL DEFAULT 'prospect',
 assigned_agent_id uuid REFERENCES public.agents(id) ON DELETE SET NULL, emergency_contact jsonb NOT NULL DEFAULT '{}'::jsonb,
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS traveler_groups_email_idx ON public.traveler_groups(customer_email);
CREATE INDEX IF NOT EXISTS traveler_groups_lead_idx ON public.traveler_groups(lead_id);
ALTER TABLE public.traveler_groups ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.travelers (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), group_id uuid NOT NULL REFERENCES public.traveler_groups(id) ON DELETE CASCADE,
 full_name varchar(160) NOT NULL, email varchar(254), phone varchar(30), relationship varchar(60) NOT NULL DEFAULT 'traveler',
 date_of_birth date, nationality varchar(100), passport_last4 varchar(4), passport_country varchar(100), passport_expiry date,
 preferences jsonb NOT NULL DEFAULT '{}'::jsonb, is_primary boolean NOT NULL DEFAULT false,
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS travelers_group_idx ON public.travelers(group_id);
ALTER TABLE public.travelers ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.traveler_documents (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), traveler_id uuid NOT NULL REFERENCES public.travelers(id) ON DELETE CASCADE,
 type varchar(100) NOT NULL, label varchar(180) NOT NULL, status public.traveler_document_status NOT NULL DEFAULT 'requested',
 storage_path text, expires_at date, rejection_reason text,
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS traveler_documents_traveler_idx ON public.traveler_documents(traveler_id);
ALTER TABLE public.traveler_documents ENABLE ROW LEVEL SECURITY;

CREATE TABLE IF NOT EXISTS public.visa_checklist_items (
 id uuid PRIMARY KEY DEFAULT gen_random_uuid(), visa_application_id uuid NOT NULL REFERENCES public.visa_applications(id) ON DELETE CASCADE,
 traveler_id uuid REFERENCES public.travelers(id) ON DELETE SET NULL, label varchar(180) NOT NULL, required boolean NOT NULL DEFAULT true,
 status public.visa_checklist_status NOT NULL DEFAULT 'missing', storage_path text, rejection_reason text, due_at timestamptz, reviewed_at timestamptz,
 created_at timestamptz NOT NULL DEFAULT now(), updated_at timestamptz NOT NULL DEFAULT now()
);
CREATE INDEX IF NOT EXISTS visa_checklist_application_idx ON public.visa_checklist_items(visa_application_id);
ALTER TABLE public.visa_checklist_items ENABLE ROW LEVEL SECURITY;
COMMIT;
