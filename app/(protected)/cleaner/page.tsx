import CleanerList from "@/components/cleaners/CleanerList";
import { generateMockData } from "@/components/scheduler/mockData";

export default function CleanerPage() {
  const { cleaners } = generateMockData(10, 1);
  return (
    <div className="">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-semibold">Cleaners</h1>
          <p className="mt-1 text-sm text-muted-foreground">Current status and capacity.</p>
        </div>
      </div>

      <div className="mt-4">
        <CleanerList cleaners={cleaners} />
      </div>
    </div>
  );
}
