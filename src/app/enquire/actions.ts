"use server";

import { redirect } from "next/navigation";
import { captureEnquiry } from "@/lib/crm/intake";
import { createClient } from "@/lib/supabase/server";

export async function submitEnquiry(form: FormData) {
    const supabase = await createClient();
    const {
        data: { user },
    } = await supabase.auth.getUser();
    if (!user?.email) redirect("/auth/login?next=/enquire");
    const name = String(form.get("name") ?? "").trim();
    const phone = String(form.get("phone") ?? "").trim();
    const destination = String(form.get("destination") ?? "").trim();
    if (
        !name ||
        name.length > 160 ||
        !/^\+[1-9]\d{6,14}$/.test(phone) ||
        !destination ||
        destination.length > 120
    )
        redirect("/enquire?result=invalid");
    await captureEnquiry({
        fullName: name,
        phone,
        destination,
        email: user.email,
        source: "website",
    });
    redirect("/enquire?result=sent");
}
