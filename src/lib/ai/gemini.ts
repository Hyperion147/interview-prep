import "server-only";

type InteractionResponse = {
    steps?: Array<{
        type?: string;
        content?: Array<{ type?: string; text?: string }>;
    }>;
};

function outputText(data: InteractionResponse) {
    return (data.steps ?? [])
        .filter((step) => step.type === "model_output")
        .flatMap((step) => step.content ?? [])
        .filter((part) => part.type === "text" && typeof part.text === "string")
        .map((part) => part.text)
        .join("\n")
        .trim();
}

export async function askGemini({
    input,
    instruction,
    responseSchema,
}: {
    input: string;
    instruction: string;
    responseSchema?: Record<string, unknown>;
}) {
    const apiKey = process.env.GEMINI_API_KEY;
    if (!apiKey) throw new Error("GEMINI_API_KEY is not configured");
    const response = await fetch(
        "https://generativelanguage.googleapis.com/v1beta/interactions",
        {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "x-goog-api-key": apiKey,
            },
            body: JSON.stringify({
                model: process.env.GEMINI_MODEL ?? "gemini-3.5-flash-lite",
                store: false,
                system_instruction: instruction,
                input: input.slice(0, 20_000),
                ...(responseSchema
                    ? {
                          response_format: {
                              type: "text",
                              mime_type: "application/json",
                              schema: responseSchema,
                          },
                      }
                    : {}),
            }),
            signal: AbortSignal.timeout(15_000),
        },
    );
    if (!response.ok) {
        const detail = await response.text().catch(() => "");
        throw new Error(`Gemini request failed (${response.status}): ${detail.slice(0, 200)}`);
    }
    const text = outputText((await response.json()) as InteractionResponse);
    if (!text) throw new Error("Gemini returned an empty response");
    return text;
}
