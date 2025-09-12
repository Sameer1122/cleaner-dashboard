"use client";

import { Cleaning, Property, Reservation } from "@/types/domain";

type Props = {
  properties: Property[];
  reservations: Reservation[];
  cleanings: Cleaning[];
};

export default function AssignmentsTable({ properties, reservations, cleanings }: Props) {
  const propMap = new Map(properties.map((p) => [p.id, p] as const));
  const cleaningByReservation = new Map(cleanings.filter((c) => c.reservationId).map((c) => [c.reservationId!, c] as const));

  const rows = reservations
    .slice()
    .sort((a, b) => a.propertyId.localeCompare(b.propertyId) || a.start.localeCompare(b.start));

  return (
    <div className="mt-6 overflow-hidden rounded-xl border border-input/50">
      <table className="w-full text-sm">
        <thead className="bg-accent/50 text-muted-foreground">
          <tr>
            <Th>Property</Th>
            <Th>Reservation</Th>
            <Th>Guest</Th>
            <Th>Check-in</Th>
            <Th>Check-out</Th>
            <Th>Turnover Cleaning</Th>
            <Th>Status</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => {
            const p = propMap.get(r.propertyId);
            const c = cleaningByReservation.get(r.id);
            return (
              <tr key={r.id} className="border-t border-input/50">
                <Td>
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full" style={{ background: p?.color || "#999" }} />
                    <span className="truncate">{p?.name || r.propertyId}</span>
                  </div>
                </Td>
                <Td className="font-mono text-xs">{r.id}</Td>
                <Td>{r.guestName}</Td>
                <Td>{fmt(r.start)}</Td>
                <Td>{fmt(r.end)}</Td>
                <Td>{c ? `${fmt(c.start)} → ${fmt(c.end)}` : "—"}</Td>
                <Td>{r.status || "confirmed"}</Td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wide">{children}</th>;
}
function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-3 py-2 ${className}`}>{children}</td>;
}

function fmt(iso: string) {
  try {
    return new Date(iso).toLocaleString();
  } catch {
    return iso;
  }
}
