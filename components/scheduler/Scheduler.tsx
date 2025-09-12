"use client";

import { useMemo, useRef, useState } from "react";
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

import { CalendarEvent, Cleaner, Property, Reservation, Cleaning, mapCleaningToEvent, mapReservationToEvent, overlaps } from "@/types/domain";
import { generateMockData } from "./mockData";
import { eventTemplateAdapter } from "./eventTemplate";
import AssignmentDrawer from "./AssignmentDrawer";
import { Button } from "@/components/ui/button";

type Props = {
  properties?: Property[];
  cleaners?: Cleaner[];
  reservations?: Reservation[];
  cleanings?: Cleaning[];
};

export default function Scheduler({ properties, cleaners, reservations, cleanings }: Props) {
  // Default dataset: 50 properties with turnover cleaning between consecutive stays
  const defaults = useMemo(() => generateMockData(50, 2), []);
  const dsProperties = properties ?? defaults.properties;
  const dsCleaners = cleaners ?? defaults.cleaners;
  const dsReservations = reservations ?? defaults.reservations;
  const dsCleanings = cleanings ?? defaults.cleanings;
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
  const selectedDate = useMemo(() => new Date(), []);

  const propertyResource = useMemo(() => dsProperties.map((p) => ({ id: p.id, text: p.name, color: p.color || "#888" })), [dsProperties]);

  const cleanerResource = useMemo(() => dsCleaners.map((c) => ({ id: c.id, text: c.name, color: c.color || "#666" })), [dsCleaners]);

  function onEventClick(args: any) {
    const e = args?.data as CalendarEvent | undefined;
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
            onClick={() => setViewMode("cleaners")}
          >
            Cleaners view
          </Button>
        </div>
        <div className="flex items-center gap-3 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1"><i className="h-2 w-2 rounded-full bg-emerald-500" /> Reservation</span>
          <span className="inline-flex items-center gap-1"><i className="h-2 w-2 rounded-full bg-blue-500" /> Cleaning</span>
        </div>
      </div>

      <ScheduleComponent
        ref={(s) => (scheduleRef.current = s)}
        height="78vh"
        selectedDate={selectedDate}
        currentView="TimelineWeek"
        allowDragAndDrop={true}
        allowResizing={true}
        allowVirtualization={true}
        eventSettings={{
          dataSource: data as any,
          template: eventTemplateAdapter as any,
          fields: {
            id: "Id",
            subject: "Subject",
            startTime: "StartTime",
            endTime: "EndTime",
            isAllDay: "IsAllDay",
            cssClass: "CssClass",
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
