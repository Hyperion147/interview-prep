import { createHmac, timingSafeEqual } from "node:crypto";

export type IncomingWhatsAppMessage = {
    id: string;
    from: string;
    timestamp: string;
    type?: string;
    text?: { body?: string };
    button?: { text?: string };
    interactive?: {
        button_reply?: { title?: string };
        list_reply?: { title?: string };
    };
};

export const deliveryStatusOrder = [
    "queued",
    "sent",
    "delivered",
    "read",
    "failed",
] as const;

export function extractWhatsAppBody(message: IncomingWhatsAppMessage) {
    return (
        message.text?.body?.trim() ||
        message.button?.text?.trim() ||
        message.interactive?.button_reply?.title?.trim() ||
        message.interactive?.list_reply?.title?.trim() ||
        ""
    );
}

export function needsImmediateHandoff(
    body: string,
    message: IncomingWhatsAppMessage,
    now = Date.now(),
) {
    const age = now - Number(message.timestamp) * 1000;
    return (
        !body ||
        !["text", "button", "interactive"].includes(message.type ?? "text") ||
        /\b(agent|human|refund|complaint|payment|cancel|emergency|unsafe)\b/i.test(
            body,
        ) ||
        !Number.isFinite(age) ||
        age < -60_000 ||
        age >= 24 * 60 * 60 * 1000
    );
}

export function verifyWebhookSignature(
    raw: Buffer,
    signature: string,
    appSecret: string,
) {
    if (!/^sha256=[a-f0-9]{64}$/.test(signature)) return false;
    const expected = `sha256=${createHmac("sha256", appSecret)
        .update(raw)
        .digest("hex")}`;
    return timingSafeEqual(Buffer.from(signature), Buffer.from(expected));
}

export function canAdvanceDeliveryStatus(
    current: string,
    next: (typeof deliveryStatusOrder)[number],
) {
    if (next === "failed") return true;
    return (
        deliveryStatusOrder.indexOf(next) >=
        deliveryStatusOrder.indexOf(
            current as (typeof deliveryStatusOrder)[number],
        )
    );
}
