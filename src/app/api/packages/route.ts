import { desc } from "drizzle-orm";
import { db } from "@/db";
import { travelPackages } from "@/db/schema/packages";

const categories = ["domestic", "international"] as const;
const statuses = ["draft", "active", "inactive"] as const;

function packageValues(body: Record<string, unknown>) {
  const category = String(body.category) as (typeof categories)[number];
  const status = String(body.status) as (typeof statuses)[number];
  const durationDays = Number(body.durationDays);
  const durationNights = Number(body.durationNights);
  const price = Number(body.price);
  const required = [body.name, body.country, body.state, body.city, body.description];
  if (required.some((value) => !String(value ?? "").trim())) throw new Error("Name, location, and description are required");
  if (!categories.includes(category) || !statuses.includes(status)) throw new Error("Invalid category or status");
  if (!Number.isFinite(price) || price < 0 || !Number.isInteger(durationDays) || durationDays < 1 || !Number.isInteger(durationNights) || durationNights < 0) throw new Error("Invalid price or duration");
  return { name: String(body.name).trim(), category, country: String(body.country).trim(), state: String(body.state).trim(), city: String(body.city).trim(), description: String(body.description).trim(), durationDays, durationNights, price: String(price), status };
}

export async function GET() {
  try { return Response.json(await db.select().from(travelPackages).orderBy(desc(travelPackages.createdAt))); }
  catch (error) { console.error("GET /api/packages failed", error); return Response.json({ error: "Unable to load packages" }, { status: 500 }); }
}

export async function POST(request: Request) {
  try { const [created] = await db.insert(travelPackages).values(packageValues(await request.json())).returning(); return Response.json(created, { status: 201 }); }
  catch (error) { const message = error instanceof Error ? error.message : "Unable to create package"; console.error("POST /api/packages failed", error); return Response.json({ error: message }, { status: 400 }); }
}
