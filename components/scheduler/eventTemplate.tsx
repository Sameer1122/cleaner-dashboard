import { CalendarEvent } from "@/types/domain";

type Props = { data: CalendarEvent };

export function EventTemplate({ data }: Props) {
  const isCleaning = data.Type === "cleaning";
  const isReservation = data.Type === "reservation";

  return (
    <div
      className={
        "pointer-events-none w-full overflow-hidden rounded-md border px-2 py-1 text-[11px] leading-tight " +
        (isCleaning
          ? "border-blue-200 bg-blue-50 text-blue-900"
          : isReservation
          ? "border-emerald-200 bg-emerald-50 text-emerald-900"
          : "border-gray-200 bg-gray-50 text-gray-900")
      }
    >
      <div className="line-clamp-1 font-medium">{data.Subject}</div>
      <div className="mt-0.5 flex items-center gap-2 text-[10px] opacity-80">
        {isCleaning && data.CleanerId ? <span>Cleaner: {data.CleanerId}</span> : null}
        {isReservation && data.ReservationId ? <span>Resv: TestingId</span> : null}
      </div>
    </div>
  );
}

// Adapter for Syncfusion's eventTemplate prop
export function eventTemplateAdapter(props: any) {
  return <EventTemplate data={props as CalendarEvent} />;
}

