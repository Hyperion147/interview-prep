"use client";

import { useCallback, useEffect, useState } from "react";
import { CalendarClock, CheckCircle2, CircleAlert, FileCheck2, Plus } from "lucide-react";
import { adminRequest } from "@/lib/crm/admin-request";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { SelectField } from "@/components/ui/select-field";

type ChecklistItem={id:string;label:string;required:boolean;status:"missing"|"uploaded"|"under_review"|"approved"|"rejected"|"not_required";rejectionReason:string|null;dueAt:string|null};
const statuses:ChecklistItem["status"][]=["missing","uploaded","under_review","approved","rejected","not_required"];

export function VisaChecklist({applicationId,onProgressChanged}:{applicationId:string;onProgressChanged?:()=>void}){
  const [items,setItems]=useState<ChecklistItem[]>([]); const [loading,setLoading]=useState(true); const [adding,setAdding]=useState(false);
  const load=useCallback(async()=>{const response=await adminRequest(`/api/visas/${applicationId}/workflow`);if(response.ok)setItems(await response.json());setLoading(false)},[applicationId]);
  useEffect(()=>{const controller=new AbortController();adminRequest(`/api/visas/${applicationId}/workflow`,{signal:controller.signal}).then(async response=>{if(response.ok){const rows=await response.json();if(!controller.signal.aborted)setItems(rows)}}).finally(()=>{if(!controller.signal.aborted)setLoading(false)});return()=>controller.abort()},[applicationId]);
  async function add(formData:FormData){const label=String(formData.get("label")??"");const dueAt=String(formData.get("dueAt")??"");const response=await adminRequest(`/api/visas/${applicationId}/workflow`,{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({label,dueAt:dueAt||null})});if(response.ok){setAdding(false);await load()}}
  async function update(item:ChecklistItem,status:ChecklistItem["status"]){const response=await adminRequest(`/api/visas/${applicationId}/workflow`,{method:"PATCH",headers:{"Content-Type":"application/json"},body:JSON.stringify({itemId:item.id,status,rejectionReason:status==="rejected"?"Please provide a complete, legible document.":null})});if(response.ok){await load();onProgressChanged?.()}}
  const approved=items.filter(i=>i.status==="approved"||i.status==="not_required").length;
  return <section className="rounded-2xl border bg-white p-6 shadow-sm"><div className="flex flex-wrap items-start justify-between gap-3"><div><p className="text-xs font-semibold uppercase tracking-[.15em] text-indigo-600">Visa workflow</p><h2 className="mt-1 font-bold">Document checklist</h2><p className="mt-1 text-xs text-slate-500">Review uploads and automatically keep application progress in sync.</p></div><Button size="sm" variant="outline" onClick={()=>setAdding(v=>!v)}><Plus className="size-4"/>Add requirement</Button></div>
    {adding&&<form action={add} className="mt-4 grid gap-3 rounded-xl border bg-slate-50 p-4 sm:grid-cols-[1fr_170px_auto]"><Input name="label" required placeholder="e.g. Bank statement"/><Input name="dueAt" type="date"/><Button>Add</Button></form>}
    <div className="mt-5 flex items-center gap-3"><div className="h-2 flex-1 rounded-full bg-slate-100"><div className="h-full rounded-full bg-indigo-600" style={{width:`${items.length?Math.round(approved/items.length*100):0}%`}}/></div><span className="text-xs font-semibold">{approved}/{items.length} ready</span></div>
    <div className="mt-4 divide-y rounded-xl border">{loading?<div className="h-40 animate-pulse bg-slate-100"/>:items.length?items.map(item=><div key={item.id} className="flex flex-col justify-between gap-3 p-4 sm:flex-row sm:items-center"><div className="flex min-w-0 gap-3"><div className={`grid size-9 shrink-0 place-items-center rounded-lg ${item.status==="approved"?"bg-emerald-50 text-emerald-600":item.status==="rejected"?"bg-rose-50 text-rose-600":"bg-amber-50 text-amber-600"}`}>{item.status==="approved"?<CheckCircle2 className="size-4"/>:item.status==="rejected"?<CircleAlert className="size-4"/>:<FileCheck2 className="size-4"/>}</div><div className="min-w-0"><p className="truncate text-sm font-semibold">{item.label}</p><div className="mt-1 flex flex-wrap gap-2">{item.required&&<Badge variant="outline" className="text-[10px]">Required</Badge>}{item.dueAt&&<span className="flex items-center gap-1 text-[10px] text-slate-500"><CalendarClock className="size-3"/>Due {new Date(item.dueAt).toLocaleDateString("en-IN")}</span>}</div>{item.rejectionReason&&<p className="mt-1 text-xs text-rose-600">{item.rejectionReason}</p>}</div></div><SelectField value={item.status} onValueChange={(value)=>void update(item,value as ChecklistItem["status"])} className="w-40 text-xs capitalize" options={statuses.map(value=>({value,label:value.replace("_"," ")}))}/></div>):<p className="p-6 text-center text-sm text-slate-500">No document requirements yet.</p>}</div>
  </section>
}
