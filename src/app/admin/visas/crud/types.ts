export const visaStatuses = ["draft", "processed", "published"] as const;
export const documentStatuses = ["pending", "partial", "submitted", "verified"] as const;
export type VisaStatus = (typeof visaStatuses)[number];
export type DocumentStatus = (typeof documentStatuses)[number];

export type VisaApplication = {
  id: string; applicantName: string; email: string; phone: string; passportNumber: string;
  destinationCountry: string; visaType: string; status: VisaStatus; documentStatus: DocumentStatus;
  progress: number; applicationValue: number; notes: string; submittedAt: string; createdAt: string; updatedAt: string;
};
export type VisaDraft = Omit<VisaApplication, "id" | "createdAt" | "updatedAt">;

export function normalizeVisa(row: Omit<VisaApplication, "applicationValue" | "notes" | "submittedAt"> & { applicationValue: string | number; notes: string | null; submittedAt: string | null }): VisaApplication {
  return { ...row, applicationValue: Number(row.applicationValue), notes: row.notes ?? "", submittedAt: row.submittedAt?.slice(0, 10) ?? "" };
}
