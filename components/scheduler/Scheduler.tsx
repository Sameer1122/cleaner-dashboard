"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  ScheduleComponent,
  ViewsDirective,
  ViewDirective,
  Inject,
  TimelineViews,
  TimelineMonth,
  ResourcesDirective,
  ResourceDirective,
  DragAndDrop,
  Resize,
} from "@syncfusion/ej2-react-schedule";
// import { registerLicense } from "@syncfusion/ej2-base";

import { CalendarEvent, Cleaner, Property, Reservation, Cleaning, mapCleaningToEvent, mapReservationToEvent, overlaps } from "@/types/domain";
import type { EventClickArgs } from "@syncfusion/ej2-react-schedule";
import { generateMockData } from "./mockData";
import { eventTemplateAdapter } from "./eventTemplate";
import AssignmentDrawer from "./AssignmentDrawer";
import { Button } from "@/components/ui/button";
import { getAllTheData } from "./request";

// Register Syncfusion license (uses env var if set, otherwise falls back to provided key)


type Props = {
  properties?: Property[];
  cleaners?: Cleaner[];
  reservations?: Reservation[];
  cleanings?: Cleaning[];
};

export default function Scheduler({ properties, cleaners, reservations, cleanings }: Props) {
  console.log({properties, cleaners, reservations, cleanings})
  // Default dataset: 50 properties with turnover cleaning between consecutive stays
  const defaults = useMemo(() => generateMockData(50, 2), []);

  // Local state for data that can be overridden by backend payload
  const [dsProperties, setDsProperties] = useState<Property[]>(properties ?? defaults.properties);
  const [dsCleaners, setDsCleaners] = useState<Cleaner[]>(cleaners ?? defaults.cleaners);
  const [dsReservations, setDsReservations] = useState<Reservation[]>(reservations ?? defaults.reservations);
  const [dsCleanings, setDsCleanings] = useState<Cleaning[]>(cleanings ?? defaults.cleanings);
  const scheduleRef = useRef<ScheduleComponent | null>(null);
  const [viewMode, setViewMode] = useState<"properties" | "cleaners">("properties");
  const [data, setData] = useState<CalendarEvent[]>(() => {
    const propMap = new Map(dsProperties.map((p) => [p.id, p] as const));
    const cleanerMap = new Map(dsCleaners.map((c) => [c.id, c] as const));
    const r = dsReservations.map((rv) => mapReservationToEvent(rv, propMap.get(rv.propertyId)));
    const c = dsCleanings.map((cl) => mapCleaningToEvent(cl, propMap.get(cl.propertyId), cl.cleanerId ? cleanerMap.get(cl.cleanerId) : undefined));
    return [...r, ...c];
  });
  const [drawerOpen, setDrawerOpen] = useState(false);
  const [selectedEvent, setSelectedEvent] = useState<CalendarEvent | null>(null);
  const [selectedDate, setSelectedDate] = useState<Date>(() => new Date());

  const propertyResource = useMemo(
    () => dsProperties.map((p) => ({ id: p.id, text: p.name || p.code || p.id, color: p.color || "#888" })),
    [dsProperties]
  );

  const cleanerResource = useMemo(() => dsCleaners.map((c) => ({ id: c.id, text: c.name, color: c.color || "#666" })), [dsCleaners]);

  const hasCleanerResources = dsCleaners.length > 0;
  const hasCleaningEvents = useMemo(() => data.some((e) => e.Type === "cleaning"), [data]);
  const hasReservationEvents = useMemo(() => data.some((e) => e.Type === "reservation"), [data]);

  function onEventClick(args: EventClickArgs) {
    const raw = Array.isArray(args?.event) ? args.event[0] : args?.event;
    const e = raw as CalendarEvent | undefined;
    if (!e) return;
    if (e.Type === "cleaning") {
      setSelectedEvent(e);
      setDrawerOpen(true);
    }
  }

  function onAssign(cleanerId: string) {
    if (!selectedEvent) return;
    setData((curr) => curr.map((ev) => (ev.Id === selectedEvent.Id ? { ...ev, CleanerId: cleanerId } : ev)));
    setDrawerOpen(false);
    setSelectedEvent(null);
  }

  function validateNoOverlap(next: CalendarEvent, all: CalendarEvent[]) {
    // prevent cleaning overlap on: same cleaner OR same property for cleaning tasks
    if (next.Type !== "cleaning") return true;
    const a = { start: next.StartTime, end: next.EndTime };
    for (const ev of all) {
      if (ev.Id === next.Id) continue;
      if (ev.Type !== "cleaning") continue;
      const sameCleaner = next.CleanerId && ev.CleanerId && next.CleanerId === ev.CleanerId;
      const sameProperty = next.PropertyId && ev.PropertyId && next.PropertyId === ev.PropertyId;
      if ((sameCleaner || sameProperty) && overlaps(a, { start: ev.StartTime, end: ev.EndTime })) {
        return false;
      }
    }
    return true;
  }

  function onActionBegin(args: any) {
    // validate cleaning overlap on create/resize/drag
    if (args.requestType === "eventChange" || args.requestType === "eventCreate") {
      const items: CalendarEvent[] = Array.isArray(args.data) ? args.data : [args.data];
      const next = items[0];
      if (!next) return;
      const ok = validateNoOverlap(next, data);
      if (!ok) {
        args.cancel = true;
        // naive toast/badge
        if (typeof window !== "undefined") {
          window.alert("Cleaning conflict: overlapping assignment detected.");
        }
      } else {
        // commit change into local state since we use a plain array dataSource
        if (args.requestType === "eventChange") {
          setData((curr) => curr.map((e) => (e.Id === next.Id ? { ...e, ...next } : e)));
        }
        if (args.requestType === "eventCreate") {
          setData((curr) => [...curr, ...items]);
        }
      }
    }
  }

  // --- Backend integration -------------------------------------------------
  function normalizeDateTime(input?: string): string | undefined {
    if (!input) return undefined;
    // If already ISO-like, return as-is
    if (input.includes("T")) return input;
    // Convert "YYYY-MM-DD HH:mm:ss" -> "YYYY-MM-DDTHH:mm:ssZ" (assume UTC)
    return input.replace(" ", "T") + "Z";
  }

  function toReservationStatus(s?: string): "confirmed" | "cancelled" | "hold" {
    const v = (s || "").toUpperCase();
    if (v === "CANCELLED" || v === "CANCELED") return "cancelled";
    if (v === "HOLD" || v === "ON_HOLD") return "hold";
    return "confirmed"; // default for NEW/UNKNOWN
  }

  function adaptFromBackend(payload: any) {
    const root = payload?.data ?? payload ?? {};
    const asArray = (v: any) => (Array.isArray(v) ? v : v ? [v] : []);
    const apiProps: any[] = asArray(root.properties);
    const apiResv: any[] = asArray(root.reservations);
    const apiClean: any[] = asArray(cleanings);
    const apiCleaners: any[] = asArray(cleaners);

    const adaptedReservations: Reservation[] = apiResv.map((r) => ({
      id: String(r.id ?? r.reservationId ?? ""),
      propertyId: String(r.propertyId ?? r.property_id ?? ""),
      guestName: String("Faizan"),
      start: normalizeDateTime(r.start) ?? new Date().toISOString(),
      end: normalizeDateTime(r.end) ?? new Date().toISOString(),
      status: toReservationStatus(r.status),
      source: r.source ?? undefined,
    }));

    const adaptedCleanings: Cleaning[] = apiClean.map((c) => ({
      id: String(c.id ?? ""),
      propertyId: String(c.propertyId ?? c.property_id ?? ""),
      cleanerId: c.cleanerId ?? c.cleaner_id ?? undefined,
      type: (c.type ?? "turnover") as Cleaning["type"],
      start: normalizeDateTime(c.start) ?? new Date().toISOString(),
      end: normalizeDateTime(c.end) ?? new Date().toISOString(),
      status: c.status ?? "pending",
      notes: c.notes ?? undefined,
      reservationId: c.reservationId ?? c.reservation_id ?? undefined,
      jobName: c.jobName ?? c.name ?? c.title ?? c.job_name ?? undefined,
    }));

    const adaptedProperties: Property[] = apiProps.map((p) => ({
      id: String(p.id ?? p.propertyId ?? ""),
      name: String(p.name ?? p.title ?? p.code ?? p.id ?? "Property"),
      code: p.code ?? undefined,
      timezone: p.timezone ?? p.tz ?? undefined,
      color: p.color ?? undefined,
      address: p.address ?? undefined,
    }));

    const adaptedCleaners: Cleaner[] = apiCleaners.map((c) => ({
      id: String(c.email?? ""),
      name: String(c.name ?? c.fullName ?? c.initials ?? c.id ?? "Cleaner"),
      color: c.color ?? undefined,
      capacity: c.capacity ?? undefined,
      status: c.status ?? "active",
    }));

    // Ensure property list contains all referenced ids
    const referencedPropIds = new Set<string>();
    for (const r of adaptedReservations) referencedPropIds.add(r.propertyId);
    for (const c of adaptedCleanings) referencedPropIds.add(c.propertyId);
    const propIdsWeHave = new Set(adaptedProperties.map((p) => p.id));
    const missingProps: Property[] = Array.from(referencedPropIds)
      .filter((id) => id && !propIdsWeHave.has(id))
      .map((id) => ({ id, name: id, code: undefined, timezone: undefined, color: "#888", address: undefined }));

    const finalProperties = adaptedProperties.concat(missingProps);

    return {
      properties: finalProperties,
      reservations: adaptedReservations,
      cleanings: adaptedCleanings,
      cleaners: adaptedCleaners,
    };
  }

  useEffect(() => {
    let cancelled = false;
    (async () => {
      try {
        const payload = await getAllTheData();
        const adapted = adaptFromBackend(payload);

        // Prefer backend payload as source of truth, even if empty
        const nextProperties = adapted.properties;
        const nextCleaners = adapted.cleaners;
        const nextReservations = adapted.reservations;
        const nextCleanings = adapted.cleanings;

        if (cancelled) return;
        setDsProperties(nextProperties);
        setDsCleaners(nextCleaners);
        setDsReservations(nextReservations);
        setDsCleanings(nextCleanings);

        // Recompute event data source
        const propMap = new Map(nextProperties.map((p) => [p.id, p] as const));
        const cleanerMap = new Map(nextCleaners.map((c) => [c.id, c] as const));
        const r = nextReservations.map((rv) => mapReservationToEvent(rv, propMap.get(rv.propertyId)));
        const c = nextCleanings.map((cl) =>
          mapCleaningToEvent(cl, propMap.get(cl.propertyId), cl.cleanerId ? cleanerMap.get(cl.cleanerId) : undefined)
        );
        setData([...r, ...c]);

        // Adjust selected date to the center of backend range or first reservation
        const range = (payload?.data ?? payload)?.range;
        const rangeFrom = normalizeDateTime(range?.from ?? range?.start);
        const rangeTo = normalizeDateTime(range?.to ?? range?.end);
        if (rangeFrom && rangeTo) {
          const from = new Date(rangeFrom);
          const to = new Date(rangeTo);
          const mid = new Date((from.getTime() + to.getTime()) / 2);
          setSelectedDate(mid);
        } else if (nextReservations.length) {
          setSelectedDate(new Date(nextReservations[0].start));
        } else if (nextCleanings.length) {
          setSelectedDate(new Date(nextCleanings[0].start));
        }
      } catch (e) {
        // Swallow errors; continue with existing defaults/props
        // console.error("Failed to load scheduler data", e);
      }
    })();
    return () => {
      cancelled = true;
    };
    // Intentionally run once on mount; do not depend on ds* setters
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Button
            variant={viewMode === "properties" ? "default" : "secondary"}
            onClick={() => setViewMode("properties")}
          >
            Properties view
          </Button>
          <Button
            variant={viewMode === "cleaners" ? "default" : "secondary"}
            disabled={!hasCleanerResources}
            onClick={() => hasCleanerResources && setViewMode("cleaners")}
          >
            Cleaners view
          </Button>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          {hasReservationEvents && (
            <span className="inline-flex items-center gap-1"><i className="h-2 w-2 rounded-full bg-emerald-500" /> Reservation</span>
          )}
          {hasCleaningEvents && (
            <span className="inline-flex items-center gap-1"><i className="h-2 w-2 rounded-full bg-blue-500" /> Cleaning</span>
          )}
        </div>
      </div>

      <ScheduleComponent
        ref={(s) => {
          scheduleRef.current = s;
        }}
        height="78vh"
        selectedDate={selectedDate}
        currentView="TimelineWeek"
        allowDragAndDrop={true}
        allowResizing={true}
        eventSettings={{
          dataSource: data as any,
          template: eventTemplateAdapter as any,
          fields: {
            id: "Id",
            subject: { name: "Subject" },
            startTime: { name: "StartTime" },
            endTime: { name: "EndTime" },
            isAllDay: { name: "IsAllDay" },
            color: { name: "Color" },
          },
        }}
        group={{ byGroupID: true, resources: viewMode === "properties" ? ["Properties"] : ["Cleaners"], enableCompactView: false }}
        actionBegin={onActionBegin}
        eventClick={onEventClick}
      >
        <ResourcesDirective>
          <ResourceDirective
            field="PropertyId"
            title="Property"
            name="Properties"
            textField="text"
            idField="id"
            colorField="color"
            dataSource={propertyResource}
          />
          <ResourceDirective
            field="CleanerId"
            title="Cleaner"
            name="Cleaners"
            textField="text"
            idField="id"
            colorField="color"
            dataSource={cleanerResource}
            allowMultiple={false}
          />
        </ResourcesDirective>

        <ViewsDirective>
          <ViewDirective option="TimelineDay" />
          <ViewDirective option="TimelineWeek" />
          <ViewDirective option="TimelineMonth" />
        </ViewsDirective>
        <Inject services={[TimelineViews, TimelineMonth, DragAndDrop, Resize]} />
      </ScheduleComponent>

      <AssignmentDrawer
        open={drawerOpen}
        event={selectedEvent}
        cleaners={dsCleaners}
        onClose={() => setDrawerOpen(false)}
        onAssign={onAssign}
      />
    </div>
  );
}
