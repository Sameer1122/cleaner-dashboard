"use client"
import { Cleaner } from "@/types/domain";
import AddCleanerDialog from "./AddCleanerDialog";

type Props = {
  cleaners: Cleaner[];
};

function StatusBadge({ status }: { status?: Cleaner["status"] }) {
  const label = status ?? "inactive";
  const color =
    label === "active" ? "bg-emerald-500" : label === "holiday" ? "bg-amber-500" : "bg-gray-400";
  return (
    <span className="inline-flex items-center gap-1 text-xs">
      <i className={`h-2.5 w-2.5 rounded-full ${color}`} />
      <span className="capitalize text-muted-foreground">{label}</span>
    </span>
  );
}

function Th({ children }: { children: React.ReactNode }) {
  return <th className="px-3 py-2 text-left text-xs font-medium uppercase tracking-wide">{children}</th>;
}
function Td({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  return <td className={`px-3 py-2 ${className}`}>{children}</td>;
}

export default function CleanerList({ cleaners }: Props) {
  const rows = cleaners.slice().sort((a, b) => a.name.localeCompare(b.name));
  return (
    <div>
      <div className="mb-3 flex items-center justify-end">
        <AddCleanerDialog />
      </div>

      <div className="overflow-hidden rounded-xl border border-input/50">
        <table className="w-full text-sm">
        <thead className="bg-accent/50 text-muted-foreground">
          <tr>
            <Th>Cleaner</Th>
            <Th>Status</Th>
            <Th>Capacity</Th>
          </tr>
        </thead>
        <tbody>
          {rows.map((c) => (
            <tr key={c.id} className="border-t border-input/50">
              <Td>
                <div className="flex items-center gap-2">
                  <span className="h-2.5 w-2.5 rounded-full" style={{ background: c.color || "#999" }} />
                  <span className="truncate">{c.name}</span>
                </div>
              </Td>
              <Td>
                <StatusBadge status={c.status} />
              </Td>
              <Td>{c.capacity ?? "—"}</Td>
            </tr>
          ))}
        </tbody>
        </table>
      </div>
    </div>
  );
}
