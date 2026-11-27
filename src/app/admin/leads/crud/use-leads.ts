"use client";

import { useEffect, useReducer } from "react";
import type { Lead, LeadDraft } from "./types";

type LeadRow = Omit<Lead, "estimatedValue" | "nextFollowUpAt" | "notes"> & {
  estimatedValue: string;
  nextFollowUpAt: string | null;
  notes: string | null;
};

type Action =
  | { type: "hydrate"; payload: Lead[] }
  | { type: "create"; payload: Lead }
  | { type: "update"; payload: Lead }
  | { type: "delete"; id: string };

function normalizeLead(row: LeadRow): Lead {
  return {
    ...row,
    estimatedValue: Number(row.estimatedValue),
    nextFollowUpAt: row.nextFollowUpAt?.slice(0, 10) ?? "",
    notes: row.notes ?? "",
  };
}

function reducer(state: Lead[], action: Action): Lead[] {
  if (action.type === "hydrate") return action.payload;
  if (action.type === "create") return [action.payload, ...state];
  if (action.type === "update")
    return state.map((lead) =>
      lead.id === action.payload.id ? action.payload : lead,
    );
  return state.filter((lead) => lead.id !== action.id);
}

async function request<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  if (!response.ok) {
    const data = await response.json().catch(() => null);
    throw new Error(data?.error ?? "Request failed");
  }
  return response.json();
}

export function useLeads() {
  const [leads, dispatch] = useReducer(reducer, []);
  useEffect(() => {
    let active = true;
    fetch("/api/leads")
      .then((response) => {
        if (!response.ok) throw new Error("Failed to load leads");
        return response.json();
      })
      .then((rows: LeadRow[]) => {
        if (!active) return;
        dispatch({
          type: "hydrate",
          payload: rows.map(normalizeLead),
        });
      })
      .catch((error) => console.error(error));
    return () => {
      active = false;
    };
  }, []);
  return {
    leads,
    createLead: async (draft: LeadDraft) => {
      const created = await request<LeadRow>("/api/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      dispatch({ type: "create", payload: normalizeLead(created) });
    },
    updateLead: async (id: string, draft: LeadDraft) => {
      const updated = await request<LeadRow>(`/api/leads/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(draft),
      });
      dispatch({ type: "update", payload: normalizeLead(updated) });
    },
    deleteLead: async (id: string) => {
      await request(`/api/leads/${id}`, { method: "DELETE" });
      dispatch({ type: "delete", id });
    },
  };
}
