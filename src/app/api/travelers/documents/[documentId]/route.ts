import { eq } from "drizzle-orm";
import { db } from "@/db";
import { travelerDocuments } from "@/db/schema/travelers";
import { canAccess } from "@/lib/auth/authorization";

export async function PATCH(
    request: Request,
    context: { params: Promise<{ documentId: string }> },
) {
    if (!(await canAccess("leads:write")))
        return Response.json({ error: "Forbidden" }, { status: 403 });
    const { documentId } = await context.params;
    const body = await request.json();
    const statuses = [
        "requested",
        "uploaded",
        "approved",
        "rejected",
        "expired",
    ] as const;
    if (!statuses.includes(body.status))
        return Response.json(
            { error: "Invalid document status" },
            { status: 400 },
        );
    const [document] = await db
        .update(travelerDocuments)
        .set({
            status: body.status,
            rejectionReason:
                body.status === "rejected"
                    ? String(
                          body.rejectionReason ??
                              "Please upload a clearer document",
                      ).slice(0, 1000)
                    : null,
            updatedAt: new Date(),
        })
        .where(eq(travelerDocuments.id, documentId))
        .returning();
    return document
        ? Response.json(document)
        : Response.json({ error: "Document not found" }, { status: 404 });
}
