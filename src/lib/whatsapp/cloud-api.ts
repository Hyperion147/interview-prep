import "server-only";

import { createHmac } from "node:crypto";

function config() {
    const token = process.env.WHATSAPP_ACCESS_TOKEN;
    const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
    const version = process.env.WHATSAPP_GRAPH_VERSION ?? "v27.0";
    const appSecret = process.env.WHATSAPP_APP_SECRET;
    if (!token || !phoneNumberId || !appSecret || !/^\d+$/.test(phoneNumberId) || !/^v\d+\.\d+$/.test(version)) {
        throw new Error("WhatsApp Cloud API is not configured");
    }
    const appSecretProof = createHmac("sha256", appSecret).update(token).digest("hex");
    return { token, phoneNumberId, version, appSecretProof };
}

export function whatsappConfigured() {
    try { config(); return true; } catch { return false; }
}

export async function sendWhatsAppText(to: string, body: string) {
    const { token, phoneNumberId, version, appSecretProof } = config();
    const response = await fetch(`https://graph.facebook.com/${version}/${phoneNumberId}/messages?appsecret_proof=${appSecretProof}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ messaging_product: "whatsapp", recipient_type: "individual", to, type: "text", text: { preview_url: false, body } }),
        signal: AbortSignal.timeout(10_000),
    });
    const data = await response.json().catch(() => ({})) as { messages?: Array<{ id?: string }>; error?: { message?: string } };
    const id = data.messages?.[0]?.id;
    if (!response.ok || !id) throw new Error(data.error?.message ?? `WhatsApp rejected the message (${response.status})`);
    return id;
}

export async function sendWhatsAppTemplate(to: string, name: string, language: string) {
    const { token, phoneNumberId, version, appSecretProof } = config();
    const response = await fetch(`https://graph.facebook.com/${version}/${phoneNumberId}/messages?appsecret_proof=${appSecretProof}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}`, "Content-Type": "application/json" },
        body: JSON.stringify({ messaging_product: "whatsapp", to, type: "template", template: { name, language: { code: language } } }),
        signal: AbortSignal.timeout(10_000),
    });
    const data = await response.json().catch(() => ({})) as { messages?: Array<{ id?: string }>; error?: { message?: string } };
    const id = data.messages?.[0]?.id;
    if (!response.ok || !id) throw new Error(data.error?.message ?? `WhatsApp rejected the template (${response.status})`);
    return id;
}
