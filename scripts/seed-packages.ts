import "dotenv/config";
import { inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { travelPackages, type NewTravelPackageRow } from "../src/db/schema/packages";

if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required");

const packages: NewTravelPackageRow[] = [
  { name: "Royal Rajasthan Escape", category: "domestic", country: "India", state: "Rajasthan", city: "Jaipur", description: "Palaces, forts, bazaars, and an unforgettable desert evening.", durationDays: 6, durationNights: 5, price: "45999", status: "active" },
  { name: "Goa Coastal Getaway", category: "domestic", country: "India", state: "Goa", city: "Panaji", description: "A relaxed beach holiday with heritage walks and sunset cruises.", durationDays: 4, durationNights: 3, price: "28999", status: "active" },
  { name: "Kerala Backwater Trail", category: "domestic", country: "India", state: "Kerala", city: "Alappuzha", description: "Houseboats, spice gardens, and the green landscapes of Kerala.", durationDays: 5, durationNights: 4, price: "38999", status: "draft" },
  { name: "Swiss Alpine Discovery", category: "international", country: "Switzerland", state: "Bern", city: "Interlaken", description: "Mountain railways, alpine villages, and spectacular lake views.", durationDays: 8, durationNights: 7, price: "245000", status: "active" },
  { name: "Dubai City & Desert", category: "international", country: "United Arab Emirates", state: "Dubai", city: "Dubai", description: "Modern landmarks, shopping, a marina cruise, and desert safari.", durationDays: 5, durationNights: 4, price: "89999", status: "active" },
  { name: "Bali Island Retreat", category: "international", country: "Indonesia", state: "Bali", city: "Ubud", description: "Temples, rice terraces, beaches, and a restorative island stay.", durationDays: 7, durationNights: 6, price: "112000", status: "inactive" },
];

async function seed() {
  const pool = new Pool({ connectionString: process.env.DATABASE_URL });
  const db = drizzle(pool);
  try {
    await db.transaction(async (tx) => {
      await tx.delete(travelPackages).where(inArray(travelPackages.name, packages.map((item) => item.name)));
      await tx.insert(travelPackages).values(packages);
    });
    const [{ count }] = await db.select({ count: travelPackages.id }).from(travelPackages);
    console.log(`Seeded ${packages.length} packages. Database now contains package records (verification id: ${count}).`);
  } finally { await pool.end(); }
}

seed().catch((error) => { console.error("Package seed failed:", error); process.exitCode = 1; });
