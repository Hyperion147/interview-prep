import "dotenv/config";
import pg from "pg";

const secondaryNames = ["Mira", "Kabir", "Anaya"];
const documentTemplates = [
  { type: "passport", label: "Passport bio page" },
  { type: "photo", label: "Recent passport photograph" },
  { type: "insurance", label: "Travel insurance certificate" },
];
const visaTemplates = ["Passport copy", "Passport photograph", "Bank statements", "Flight itinerary", "Hotel confirmation"];

async function main() {
if (!process.env.DATABASE_URL) throw new Error("DATABASE_URL is required");
const pool = new pg.Pool({ connectionString: process.env.DATABASE_URL });
const client = await pool.connect();
try {
  await client.query("BEGIN");
  const { rows: leads } = await client.query(`select id, full_name, lower(email) email, phone, destination, travelers from leads where status <> 'lost' order by created_at limit 3`);
  for (const [index, lead] of leads.entries()) {
    let group = (await client.query(`select id from traveler_groups where lead_id=$1 limit 1`, [lead.id])).rows[0];
    if (!group) group = (await client.query(`insert into traveler_groups (lead_id,name,customer_email,status,emergency_contact) values ($1,$2,$3,$4,$5) returning id`, [lead.id, `${lead.full_name} travel party`, lead.email, lead.status === "won" ? "active" : "prospect", JSON.stringify({ name: `Emergency contact ${index + 1}`, phone: `+91 90000 0000${index}`, relationship: "Family" })])).rows[0];
    let primary = (await client.query(`select id from travelers where group_id=$1 and is_primary limit 1`, [group.id])).rows[0];
    if (!primary) primary = (await client.query(`insert into travelers (group_id,full_name,email,phone,relationship,date_of_birth,nationality,passport_last4,passport_country,passport_expiry,preferences,is_primary) values ($1,$2,$3,$4,'primary',$5,'Indian',$6,'India',$7,$8,true) returning id`, [group.id, lead.full_name, lead.email, lead.phone, `199${index}-0${index+2}-14`, `${4100+index}`, `203${index+1}-0${index+4}-15`, JSON.stringify({ dietary: index === 1 ? ["Vegetarian"] : [], hotel: "Quiet room", seat: "Aisle" })])).rows[0];
    const desiredMembers = Math.max(2, Math.min(Number(lead.travelers || 2), 4));
    for (let memberIndex=1; memberIndex<desiredMembers; memberIndex++) {
      const fullName=`${secondaryNames[(index+memberIndex-1)%secondaryNames.length]} ${String(lead.full_name).split(" ").at(-1)}`;
      const existing=(await client.query(`select id from travelers where group_id=$1 and full_name=$2 limit 1`,[group.id,fullName])).rows[0];
      if(!existing) await client.query(`insert into travelers (group_id,full_name,relationship,date_of_birth,nationality,passport_last4,passport_country,passport_expiry,preferences) values ($1,$2,$3,$4,'Indian',$5,'India',$6,$7)`,[group.id,fullName,memberIndex===1?"spouse":"child",`199${memberIndex+index}-06-20`,`${5200+index*10+memberIndex}`,`203${index+2}-08-11`,JSON.stringify({dietary:[],seat:"Window"})]);
    }
    const members=(await client.query(`select id from travelers where group_id=$1 order by is_primary desc, created_at`,[group.id])).rows;
    for(const [memberIndex,member] of members.entries()) for(const [docIndex,doc] of documentTemplates.entries()) {
      const exists=(await client.query(`select 1 from traveler_documents where traveler_id=$1 and label=$2`,[member.id,doc.label])).rowCount;
      if(!exists) await client.query(`insert into traveler_documents (traveler_id,type,label,status,expires_at,rejection_reason) values ($1,$2,$3,$4,$5,$6)`,[member.id,doc.type,doc.label,docIndex===0&&memberIndex===0?"approved":docIndex===1?"uploaded":"requested",doc.type==="passport"?`203${index+1}-0${index+4}-15`:null,null]);
    }
  }
  const {rows:visas}=await client.query(`select id from visa_applications order by created_at limit 5`);
  for(const [visaIndex,visa] of visas.entries()) for(const [itemIndex,label] of visaTemplates.entries()) {
    const exists=(await client.query(`select 1 from visa_checklist_items where visa_application_id=$1 and label=$2`,[visa.id,label])).rowCount;
    if(!exists) await client.query(`insert into visa_checklist_items (visa_application_id,label,status,due_at,reviewed_at) values ($1,$2,$3,current_date + (($4+5)||' days')::interval,$5)`,[visa.id,label,itemIndex<visaIndex%4?"approved":itemIndex===visaIndex%4?"under_review":"missing",itemIndex,itemIndex<visaIndex%4?new Date():null]);
  }
  await client.query(`update visa_applications v set progress=x.progress, document_status=case when x.progress=100 then 'verified'::document_status when x.progress>0 then 'partial'::document_status else 'pending'::document_status end, updated_at=now() from (select visa_application_id,round(100.0*count(*) filter(where status='approved')/nullif(count(*) filter(where required),0))::int progress from visa_checklist_items group by visa_application_id)x where v.id=x.visa_application_id`);
  await client.query("COMMIT");
  const counts=await client.query(`select (select count(*) from traveler_groups) groups,(select count(*) from travelers) travelers,(select count(*) from traveler_documents) documents,(select count(*) from visa_checklist_items) visa_items`);
  console.log("Traveler workflow seed complete", counts.rows[0]);
} catch(error){await client.query("ROLLBACK");throw error} finally {client.release();await pool.end()}
}

main().catch((error)=>{console.error(error);process.exitCode=1});
