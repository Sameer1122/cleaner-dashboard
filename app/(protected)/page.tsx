import PingStatus from "@/components/utils/PingStatus";
import Scheduler from "@/components/scheduler/Scheduler";
import AssignmentsTable from "@/components/scheduler/AssignmentsTable";
import { generateMockData } from "@/components/scheduler/mockData";

// Import Syncfusion theme CSS for the scheduler
import "@syncfusion/ej2/material.css";

export default function Home() {
  // Generate 50 dummy properties with reservations and turnover cleaning between stays
  const { properties, reservations, cleanings, cleaners } = generateMockData(50, 2);

  return (
    <div className="">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Operations</h1>
          <p className="mt-1 text-sm text-muted-foreground">Scheduler and assignments overview.</p>
        </div>
        <div className="text-xs text-muted-foreground">
          <PingStatus />
        </div>
      </div>

      <div className="mt-4">
        <Scheduler properties={properties} reservations={reservations} cleanings={cleanings} cleaners={cleaners} />
      </div>

      <AssignmentsTable properties={properties} reservations={reservations} cleanings={cleanings} />
    </div>
  );
}
