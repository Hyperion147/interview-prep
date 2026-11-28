import "dotenv/config";

import { createHmac, randomUUID } from "node:crypto";
import { Client } from "pg";

async function main() {
const baseUrl = process.env.WHATSAPP_TEST_BASE_URL ?? "http://localhost:3000";
const secret = process.env.WHATSAPP_APP_SECRET;
const phoneNumberId = process.env.WHATSAPP_PHONE_NUMBER_ID;
const databaseUrl = process.env.DATABASE_URL;

if (!secret || !phoneNumberId || !databaseUrl) {
    throw new Error(
        "WHATSAPP_APP_SECRET, WHATSAPP_PHONE_NUMBER_ID, and DATABASE_URL are required",
    );
}

const suffix = Date.now().toString().slice(-8);
const sender = `1555${suffix}`;
const messageId = `wamid.test.${randomUUID()}`;
const timestamp = Math.floor(Date.now() / 1000).toString();
const payload = JSON.stringify({
    object: "whatsapp_business_account",
    entry: [
        {
            id: process.env.WHATSAPP_BUSINESS_ACCOUNT_ID ?? "test-waba",
            changes: [
                {
                    field: "messages",
                    value: {
                        messaging_product: "whatsapp",
                        metadata: {
                            display_phone_number: "15550000000",
                            phone_number_id: phoneNumberId,
                        },
                        contacts: [
                            {
                                profile: { name: "Webhook Test Lead" },
                                wa_id: sender,
                            },
                        ],
                        messages: [
                            {
                                from: sender,
                                id: messageId,
                                timestamp,
                                type: "text",
                                text: {
                                    body: "I am planning a Goa trip and want to speak to a human agent",
                                },
                            },
                        ],
                    },
                },
            ],
        },
    ],
});
const signature = `sha256=${createHmac("sha256", secret).update(payload).digest("hex")}`;

const response = await fetch(`${baseUrl}/api/webhooks/whatsapp`, {
    method: "POST",
    headers: {
        "Content-Type": "application/json",
        "x-hub-signature-256": signature,
    },
    body: payload,
});

if (!response.ok) {
    throw new Error(`Webhook returned ${response.status}: ${await response.text()}`);
}
console.log(`Webhook accepted (${response.status}). Waiting for background processing…`);

const client = new Client({ connectionString: databaseUrl });
await client.connect();
try {
    let result;
    for (let attempt = 0; attempt < 20; attempt += 1) {
        result = await client.query(
            `SELECT e.id, e.status, e.lead_id, l.full_name, l.phone,
                    a.handoff_required, a.auto_reply_enabled,
                    m.direction, m.body,
                    EXISTS (
                        SELECT 1 FROM public.follow_ups f
                        WHERE f.lead_id = e.lead_id
                          AND f.channel = 'whatsapp'
                          AND f.priority = 'high'
                    ) AS follow_up_created
             FROM public.whatsapp_events e
             JOIN public.leads l ON l.id = e.lead_id
             JOIN public.whatsapp_messages m ON m.id = e.id
             JOIN public.lead_automation a ON a.lead_id = e.lead_id
             WHERE e.id = $1`,
            [messageId],
        );
        if (result.rowCount) break;
        await new Promise((resolve) => setTimeout(resolve, 500));
    }
    const row = result?.rows[0];
    if (!row) throw new Error("Webhook was accepted but no CRM record appeared");
    const passed =
        row.status === "needs_review" &&
        row.handoff_required === true &&
        row.auto_reply_enabled === false &&
        row.direction === "inbound" &&
        row.follow_up_created === true;
    console.log({
        leadId: row.lead_id,
        leadName: row.full_name,
        eventStatus: row.status,
        handoffRequired: row.handoff_required,
        autoReplyEnabled: row.auto_reply_enabled,
        followUpCreated: row.follow_up_created,
    });
    if (!passed) throw new Error("Webhook records were created but workflow assertions failed");
    console.log("WhatsApp webhook workflow passed.");
} finally {
    await client.end();
}
}

main().catch((error) => {
    console.error(error instanceof Error ? error.message : error);
    process.exitCode = 1;
});
