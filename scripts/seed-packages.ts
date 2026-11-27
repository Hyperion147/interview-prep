import "dotenv/config";
import { count, inArray } from "drizzle-orm";
import { drizzle } from "drizzle-orm/node-postgres";
import { Pool } from "pg";
import { travelPackages } from "../src/db/schema/packages";

if (!process.env.DATABASE_URL) {
    throw new Error("DATABASE_URL is required to seed packages");
}

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const db = drizzle(pool);

const packages = [
    {
        name: "Kashmir Paradise Tour",
        region: "North India",
        state: "Jammu & Kashmir",
        city: "Srinagar",
        locationLabel: "Srinagar & Gulmarg",
        imageUrl: "https://images.unsplash.com/photo-1595815771614-ade9d652a65d?q=80&w=1400",
        hotel: "The Lalit Grand Palace",
        rating: "4.9",
        price: "25000",
        durationDays: 6,
        durationNights: 5,
        features: ["Dal Lake shikara ride", "Gulmarg gondola", "Daily breakfast"],
        description: "A serene journey through alpine valleys, Mughal gardens, Dal Lake and the snow-framed landscapes of Gulmarg.",
    },
    {
        name: "Ladakh Bike Expedition",
        region: "North India",
        state: "Ladakh",
        city: "Leh",
        locationLabel: "Leh, Nubra & Pangong",
        imageUrl: "https://images.unsplash.com/photo-1536295243470-d7cba4efab7b?q=80&w=1400",
        hotel: "The Grand Dragon Ladakh",
        rating: "4.8",
        price: "32000",
        durationDays: 8,
        durationNights: 7,
        features: ["Royal Enfield rental", "Experienced road captain", "Fuel and permits"],
        description: "Ride across high mountain passes to Nubra Valley and Pangong Lake on an expertly supported Himalayan expedition.",
    },
    {
        name: "Himachal Scenic Drive",
        region: "North India",
        state: "Himachal Pradesh",
        city: "Shimla",
        locationLabel: "Shimla, Manali & Solang",
        imageUrl: "https://images.unsplash.com/photo-1626621341517-bbf3d9990a23?q=80&w=1400",
        hotel: "The Himalayan Resort",
        rating: "4.7",
        price: "22000",
        durationDays: 7,
        durationNights: 6,
        features: ["Private cab", "Solang Valley excursion", "Breakfast and dinner"],
        description: "Wind through pine forests, heritage hill towns and the spectacular valleys of Shimla and Manali.",
    },
    {
        name: "Spiritual Uttarakhand",
        region: "North India",
        state: "Uttarakhand",
        city: "Rishikesh",
        locationLabel: "Rishikesh & Mussoorie",
        imageUrl: "https://images.unsplash.com/photo-1608942025318-1191eeade556?q=80&w=1400",
        hotel: "Ganga Kinare Retreat",
        rating: "4.6",
        price: "18000",
        durationDays: 5,
        durationNights: 4,
        features: ["Ganga aarti", "Yoga session", "Mussoorie sightseeing"],
        description: "Balance soulful riverside experiences in Rishikesh with the fresh mountain air and views of Mussoorie.",
    },
    {
        name: "Kerala Backwaters & Hills",
        region: "South India",
        state: "Kerala",
        city: "Munnar",
        locationLabel: "Munnar, Thekkady & Alleppey",
        imageUrl: "https://images.unsplash.com/photo-1602216056096-3b40cc0c9944?q=80&w=1400",
        hotel: "Fragrant Nature Resort",
        rating: "4.9",
        price: "28500",
        durationDays: 7,
        durationNights: 6,
        features: ["Private houseboat stay", "Tea estate tour", "Wildlife sanctuary"],
        description: "Discover misty tea estates, spice country and Kerala's tranquil backwaters with a private houseboat night.",
    },
    {
        name: "Royal Mysore & Coorg",
        region: "South India",
        state: "Karnataka",
        city: "Mysuru",
        locationLabel: "Mysore & Coorg",
        imageUrl: "https://images.unsplash.com/photo-1600112356915-089abb8fc71a?q=80&w=1400",
        hotel: "Evolve Back Coorg",
        rating: "4.8",
        price: "24000",
        durationDays: 6,
        durationNights: 5,
        features: ["Mysore Palace tour", "Coffee plantation walk", "Private transfers"],
        description: "Pair Mysore's royal grandeur with waterfalls, forests and aromatic coffee estates in Coorg.",
    },
    {
        name: "Temple Trails of Tamil Nadu",
        region: "South India",
        state: "Tamil Nadu",
        city: "Madurai",
        locationLabel: "Madurai, Thanjavur & Rameswaram",
        imageUrl: "https://images.unsplash.com/photo-1582510003544-4d00b7f74220?q=80&w=1400",
        hotel: "Heritage Madurai",
        rating: "4.7",
        price: "21000",
        durationDays: 6,
        durationNights: 5,
        features: ["Expert heritage guide", "Temple visits", "Daily breakfast"],
        description: "Explore the architectural masterpieces, living traditions and coastal spirituality of Tamil Nadu.",
    },
    {
        name: "Goa Beach Party & Chill",
        region: "West & Central",
        state: "Goa",
        city: "Panaji",
        locationLabel: "North & South Goa",
        imageUrl: "https://images.unsplash.com/photo-1512343879784-a960bf40e7f2?q=80&w=1400",
        hotel: "Taj Fort Aguada Resort",
        rating: "4.8",
        price: "19500",
        durationDays: 5,
        durationNights: 4,
        features: ["Beachfront stay", "Sunset cruise", "North Goa sightseeing"],
        description: "Mix golden beaches, Portuguese heritage, watersports and relaxed evenings on India's favourite coast.",
    },
    {
        name: "Royal Rajasthan Heritage",
        region: "West & Central",
        state: "Rajasthan",
        city: "Jaipur",
        locationLabel: "Jaipur, Jodhpur & Udaipur",
        imageUrl: "https://images.unsplash.com/photo-1477587458883-47145ed94245?q=80&w=1400",
        hotel: "Trident Udaipur",
        rating: "4.9",
        price: "35000",
        durationDays: 8,
        durationNights: 7,
        features: ["Heritage hotels", "Fort and palace tours", "Cultural dinner"],
        description: "Travel between Rajasthan's pink, blue and lake cities while staying amid regal heritage and desert culture.",
    },
    {
        name: "Darjeeling Tea & Toy Train",
        region: "East & North East",
        state: "West Bengal",
        city: "Darjeeling",
        locationLabel: "Darjeeling & Kalimpong",
        imageUrl: "https://images.unsplash.com/photo-1622308644420-b20142dc993c?q=80&w=1400",
        hotel: "Mayfair Darjeeling",
        rating: "4.7",
        price: "20500",
        durationDays: 5,
        durationNights: 4,
        features: ["Toy train ride", "Tea garden tour", "Tiger Hill sunrise"],
        description: "Wake to Kanchenjunga views, ride the historic toy train and walk through legendary Himalayan tea gardens.",
    },
    {
        name: "Mystical Meghalaya",
        region: "East & North East",
        state: "Meghalaya",
        city: "Shillong",
        locationLabel: "Shillong, Cherrapunji & Dawki",
        imageUrl: "https://images.unsplash.com/photo-1577706881850-bf7c7d8906a5?q=80&w=1400",
        hotel: "Ri Kynjai Serenity",
        rating: "4.9",
        price: "26000",
        durationDays: 6,
        durationNights: 5,
        features: ["Living root bridge trek", "Dawki boat ride", "Waterfall circuit"],
        description: "Journey through cloud forests, crystal-clear rivers, living root bridges and dramatic waterfalls.",
    },
].map((item) => ({
    ...item,
    category: "domestic" as const,
    country: "India",
    status: "active" as const,
}));

async function seed() {
    const names = packages.map((item) => item.name);
    await db.delete(travelPackages).where(inArray(travelPackages.name, names));
    await db.insert(travelPackages).values(packages);
    const [{ total }] = await db.select({ total: count() }).from(travelPackages);
    console.log(`Seeded ${packages.length} enhanced travel packages. Database total: ${total}.`);
    await pool.end();
}

seed().catch((error) => {
    console.error("Unable to seed travel packages", error);
    void pool.end();
    process.exitCode = 1;
});
