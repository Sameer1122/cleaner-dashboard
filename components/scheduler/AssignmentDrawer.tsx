"use client";

import { Cleaner, CalendarEvent } from "@/types/domain";
import { Button } from "@/components/ui/button";

type Props = {
  open: boolean;
  event?: CalendarEvent | null;
  cleaners: Cleaner[];
  onClose: () => void;
  onAssign: (cleanerId: string) => void;
};

export default function AssignmentDrawer({ open, event, cleaners, onClose, onAssign }: Props) {
  if (!open || !event) return null;
  return (
    <div className="fixed inset-0 z-50">
      <div className="absolute inset-0 bg-black/30" onClick={onClose} />
      <aside className="absolute right-0 top-0 h-dvh w-full max-w-md overflow-auto border-l border-input/50 bg-background p-4 shadow-xl">
        <div className="mb-3 flex items-center justify-between">
          <h3 className="text-lg font-semibold">Assign Cleaner</h3>
          <button onClick={onClose} aria-label="Close" className="rounded-md p-2 hover:bg-accent">
            <svg viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="1.5">
              <path d="M18 6L6 18M6 6l12 12" />
            </svg>
          </button>
        </div>
        <div className="rounded-md border border-input/50 p-3 text-sm">
          <div className="font-medium">{event.Subject}</div>
          <div className="mt-1 text-muted-foreground">{event.StartTime.toLocaleString()} → {event.EndTime.toLocaleString()}</div>
        </div>

        <div className="mt-4">
          <p className="mb-2 text-sm text-muted-foreground">Select a cleaner:</p>
          <div className="grid gap-2">
            {cleaners.map((c) => (
              <button
                key={c.id}
                className="flex items-center justify-between rounded-md border border-input/50 p-3 text-left hover:bg-accent"
                onClick={() => onAssign(c.id)}
              >
                <span>{c.name}</span>
                <span className="h-3 w-3 rounded-full" style={{ background: c.color || "#999" }} />
              </button>
            ))}
          </div>
        </div>

        <div className="mt-6 flex justify-end gap-2">
          <Button variant="secondary" onClick={onClose}>Cancel</Button>
        </div>
      </aside>
    </div>
  );
}

