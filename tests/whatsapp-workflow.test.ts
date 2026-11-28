import assert from "node:assert/strict";
import { createHmac } from "node:crypto";
import test from "node:test";
import {
    canAdvanceDeliveryStatus,
    extractWhatsAppBody,
    needsImmediateHandoff,
    verifyWebhookSignature,
    type IncomingWhatsAppMessage,
} from "../src/lib/whatsapp/webhook-logic";

function incoming(overrides: Partial<IncomingWhatsAppMessage> = {}) {
    return {
        id: "wamid.test",
        from: "15551234567",
        timestamp: Math.floor(Date.now() / 1000).toString(),
        type: "text",
        text: { body: "I want a Goa trip for two people" },
        ...overrides,
    } satisfies IncomingWhatsAppMessage;
}

test("validates Meta webhook HMAC signatures", () => {
    const raw = Buffer.from('{"object":"whatsapp_business_account"}');
    const secret = "test-secret";
    const signature = `sha256=${createHmac("sha256", secret).update(raw).digest("hex")}`;
    assert.equal(verifyWebhookSignature(raw, signature, secret), true);
    assert.equal(verifyWebhookSignature(raw, signature, "wrong-secret"), false);
    assert.equal(verifyWebhookSignature(raw, "invalid", secret), false);
});

test("extracts text, button, and list reply bodies", () => {
    assert.equal(extractWhatsAppBody(incoming()), "I want a Goa trip for two people");
    assert.equal(extractWhatsAppBody(incoming({ text: undefined, type: "button", button: { text: "Call me" } })), "Call me");
    assert.equal(extractWhatsAppBody(incoming({ text: undefined, type: "interactive", interactive: { list_reply: { title: "Bali" } } })), "Bali");
});

test("allows current travel enquiries to use automation", () => {
    const message = incoming();
    assert.equal(needsImmediateHandoff(extractWhatsAppBody(message), message), false);
});

test("hands sensitive and human-request messages to staff", () => {
    for (const body of ["I need a human", "Please cancel", "I want a refund", "There is an emergency", "Payment failed"]) {
        const message = incoming({ text: { body } });
        assert.equal(needsImmediateHandoff(body, message), true, body);
    }
});

test("hands stale, future, empty, and unsupported messages to staff", () => {
    const now = Date.now();
    assert.equal(needsImmediateHandoff("hello", incoming({ timestamp: String(Math.floor((now - 25 * 60 * 60 * 1000) / 1000)) }), now), true);
    assert.equal(needsImmediateHandoff("hello", incoming({ timestamp: String(Math.floor((now + 2 * 60 * 1000) / 1000)) }), now), true);
    assert.equal(needsImmediateHandoff("", incoming({ text: undefined }), now), true);
    assert.equal(needsImmediateHandoff("image", incoming({ type: "image" }), now), true);
});

test("does not regress delivery status", () => {
    assert.equal(canAdvanceDeliveryStatus("sent", "delivered"), true);
    assert.equal(canAdvanceDeliveryStatus("delivered", "read"), true);
    assert.equal(canAdvanceDeliveryStatus("read", "delivered"), false);
    assert.equal(canAdvanceDeliveryStatus("read", "failed"), true);
});
