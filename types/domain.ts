// Domain types and mapping utilities for Syncfusion Scheduler

export type Property = {
  id: string;
  name: string;
  code?: string;
  timezone?: string; // IANA tz like "America/New_York"
  color?: string;
  address?: string;
};

export type Reservation = {
  id: string;
  propertyId: string;
  guestName: string;
  start: string; // ISO string with TZ offset
  end: string; // ISO string with TZ offset
  source?: string; // OTA / Direct
  status?: string;
};

export type CleaningType = "turnover" | "midstay" | "deep";

export type Cleaning = {
  id: string;
  propertyId: string;
  cleanerId?: string;
  type: CleaningType;
  start: string; // ISO string with TZ offset
  end: string; // ISO string with TZ offset
  status?: "pending" | "assigned" | "in_progress" | "done";
  notes?: string;
  reservationId?: string; // optional linkage
  jobName?: string; // display name for the cleaning job
};

export type Cleaner = {
  id: string;
  name: string;
  color?: string;
  capacity?: number;
  status?: "active" | "holiday" | "inactive";
};

// Scheduler event type: align with Syncfusion fields
export type CalendarEvent = {
  Id: string | number;
  Subject: string;
  StartTime: Date;
  EndTime: Date;
  IsAllDay?: boolean;
  // resource linking fields: must match ResourceDirective.field
  PropertyId?: string;
  CleanerId?: string;
  ReservationId?: string;
  Type?: "reservation" | "cleaning";
  Status?: string;
  Notes?: string;
  Color?: string;
  CssClass?: string; // Syncfusion event CSS hook
};

export function subjectFromReservation(r: Reservation, p?: Property): string {
  const code = p?.code ? `(${p.code}) ` : "";
  return `${code}${r.guestName}`.trim();
}

export function subjectFromCleaning(
  c: Cleaning,
  p?: Property,
  cleanerName?: string
): string {
  const code = p?.code ? `(${p.code}) ` : "";
  const who = cleanerName ? ` • ${cleanerName}` : "";
  return `${code}${capitalize(c.type)} Clean${who}`.trim();
}

function capitalize(s: string) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

export function mapReservationToEvent(
  r: Reservation,
  property?: Property
): CalendarEvent {
  return {
    Id: r.id,
    Subject: subjectFromReservation(r, property),
    StartTime: new Date(r.start),
    EndTime: new Date(r.end),
    PropertyId: r.propertyId,
    ReservationId: r.id,
    Type: "reservation",
    Status: r.status ?? "confirmed",
    Color: "#10b981", // emerald-500 for reservations
    CssClass: "evt-reservation",
  };
}

export function mapCleaningToEvent(
  c: Cleaning,
  property?: Property,
  cleaner?: Cleaner
): CalendarEvent {
  const subject = (c.jobName && c.jobName.trim())
    || (property?.address && String(property.address).trim())
    || property?.name
    || property?.code
    || `${capitalize(c.type)} Clean`;
  return {
    Id: c.id,
    Subject: subject,
    StartTime: new Date(c.start),
    EndTime: new Date(c.end),
    PropertyId: c.propertyId,
    CleanerId: c.cleanerId,
    ReservationId: c.reservationId,
    Type: "cleaning",
    Status: c.status ?? "pending",
    // Consistent cleaner color across all properties
    Color: "#2563eb", // primary-ish blue
    CssClass: "evt-cleaning",
  };
}

export function overlaps(
  a: { start: Date; end: Date },
  b: { start: Date; end: Date }
) {
  return a.start < b.end && b.start < a.end;
}

export function generateTurnoverCleaning(
  r: Reservation,
  durationMinutes = 240
): Cleaning {
  const start = new Date(r.end);
  const end = new Date(start.getTime() + durationMinutes * 60 * 1000);
  return {
    id: `clean_${r.id}`,
    propertyId: r.propertyId,
    type: "turnover",
    start: start.toISOString(),
    end: end.toISOString(),
    status: "pending",
    reservationId: r.id,
  };
}

export function chunkByRange<T extends CalendarEvent>(
  events: T[],
  rangeStart: Date,
  rangeEnd: Date
): T[] {
  return events.filter((e) =>
    overlaps(
      { start: e.StartTime, end: e.EndTime },
      { start: rangeStart, end: rangeEnd }
    )
  );
}
