BEGIN;
CREATE TABLE IF NOT EXISTS public.trip_workflow (
    lead_id uuid PRIMARY KEY REFERENCES public.leads(id) ON DELETE CASCADE,
    customer_email text NOT NULL,
    itinerary text NOT NULL,
    total integer NOT NULL CHECK (total > 0),
    due_at timestamptz NOT NULL,
    stage text NOT NULL CHECK (stage IN ('proposed', 'accepted', 'booked', 'paid')),
    reminder_id uuid
);
ALTER TABLE public.trip_workflow ENABLE ROW LEVEL SECURITY;
COMMIT;
