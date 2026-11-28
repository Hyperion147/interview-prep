import { Suspense } from "react";
import Hero from "@/components/pages/landing/Hero";
import { getStaffIdentity } from "@/lib/auth/authorization";
import { hasSupabaseAuthConfig } from "@/lib/supabase/config";
import { createClient } from "@/lib/supabase/server";

// Supabase validates token expiry against the current time. This route therefore
// requires request-time rendering instead of an instant-navigation prerender.
export const instant = false;

async function AuthenticatedLanding() {
  if (!hasSupabaseAuthConfig()) return <Hero />;

  const supabase = await createClient();
  const { data } = await supabase.auth.getUser();
  if (!data.user) return <Hero />;

  const staff = await getStaffIdentity();
  if (staff) {
    return <Hero accountHref="/admin" accountLabel="Admin dashboard" />;
  }

  return <Hero accountHref="/portal" accountLabel="My portal" />;
}

export default function Landing() {
  return (
    <Suspense fallback={<Hero />}>
      <AuthenticatedLanding />
    </Suspense>
  );
}
