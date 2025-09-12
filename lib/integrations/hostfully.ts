// Hostfully API types and mappers (skeleton)
// Note: Per current plan, data will be fetched from your Lambda (RDS-backed),
// not directly from Hostfully. Keep these mappers if/when you proxy Hostfully
// via your backend; otherwise remove and rely on your Lambda contracts.

import { Cleaning, Cleaner, Property, Reservation } from "@/types/domain";

export type HostfullyProperty = {
  uid: string;
  name: string;
  code?: string;
  timeZoneName?: string;
  address?: string;
};

export type HostfullyReservation = {
  uid: string;
  propertyUid: string;
  guestName: string;
  startDate: string; // ISO
  endDate: string;   // ISO
  status?: string;
  source?: string;
};

// Housekeeping (if available via your plan); shape varies — stub here
export type HostfullyCleaning = {
  uid: string;
  propertyUid: string;
  cleanerUid?: string;
  type?: string; // e.g., 'TURNOVER'
  startDate: string;
  endDate: string;
  status?: string;
  notes?: string;
  reservationUid?: string;
};

export function mapHFProperty(p: HostfullyProperty): Property {
  return {
    id: p.uid,
    name: p.name,
    code: p.code,
    timezone: p.timeZoneName,
    address: p.address,
  };
}

export function mapHFReservation(r: HostfullyReservation): Reservation {
  return {
    id: r.uid,
    propertyId: r.propertyUid,
    guestName: r.guestName,
    start: r.startDate,
    end: r.endDate,
    status: (r.status as any) ?? "confirmed",
    source: r.source,
  };
}

export function mapHFCleaning(c: HostfullyCleaning): Cleaning {
  // naive normalization
  const lower = (c.type || "turnover").toLowerCase() as any;
  return {
    id: c.uid,
    propertyId: c.propertyUid,
    cleanerId: c.cleanerUid,
    type: ["turnover", "midstay", "deep"].includes(lower) ? lower : "turnover",
    start: c.startDate,
    end: c.endDate,
    status: (c.status as any) ?? "pending",
    notes: c.notes,
    reservationId: c.reservationUid,
  };
}

// Minimal fetch wrappers — you can wire these to your API routes.
export async function fetchHostfully<T = any>(path: string, init?: RequestInit): Promise<T> {
  const base = process.env.HOSTFULLY_BASE_URL;
  const token = process.env.HOSTFULLY_API_TOKEN;
  if (!base || !token) throw new Error("HOSTFULLY_BASE_URL or HOSTFULLY_API_TOKEN missing");
  const res = await fetch(`${base}${path}`, {
    ...init,
    headers: {
      ...(init?.headers || {}),
      Authorization: `Bearer ${token}`,
    },
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Hostfully request failed: ${res.status}`);
  return (await res.json()) as T;
}
