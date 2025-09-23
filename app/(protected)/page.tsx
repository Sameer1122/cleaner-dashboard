"use client";
import PingStatus from "@/components/utils/PingStatus";
import Scheduler from "@/components/scheduler/Scheduler";
import AssignmentsTable from "@/components/scheduler/AssignmentsTable";
import { generateMockData } from "@/components/scheduler/mockData";
import { Loader } from "lucide-react";

// Import only the required Syncfusion styles to avoid bundling issues
import "@syncfusion/ej2-base/styles/material.css";
import "@syncfusion/ej2-buttons/styles/material.css";
import "@syncfusion/ej2-calendars/styles/material.css";
import "@syncfusion/ej2-dropdowns/styles/material.css";
import "@syncfusion/ej2-inputs/styles/material.css";
import "@syncfusion/ej2-lists/styles/material.css";
import "@syncfusion/ej2-navigations/styles/material.css";
import "@syncfusion/ej2-popups/styles/material.css";
import "@syncfusion/ej2-schedule/styles/material.css";
import { useQuery } from "@tanstack/react-query";
import {
  getAllTheCleanersAndJobs,
  getAllTheData,
} from "@/components/scheduler/request";

export default function Home() {
  // Generate 50 dummy properties with reservations and turnover cleaning between stays
  const { properties, reservations, cleanings, cleaners } = generateMockData(
    50,
    2
  );

  const { data, isPending, isError, error } = useQuery({
    queryKey: ["get-all-the-data"],
    queryFn: getAllTheData,
  });
  const {
    data: cleanersData,
    isPending: cleanersPending,
    isError: cleanersError,
    error: cleanersErrorData,
  } = useQuery({
    queryKey: ["get-all-the-cleaners-and-jobs"],
    queryFn: getAllTheCleanersAndJobs,
  });
  if (isPending || !data) {
    return (
      <div className="h-[100vh] flex justify-center items-center">
        <Loader className="animate-spin" />
      </div>
    );
  }

  return (
    <div className="">
      <div className="flex items-center justify-between px-4">
        <div>
          <h1 className="text-2xl font-semibold">Operations</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Scheduler and assignments overview.
          </p>
        </div>
        <div className="text-xs text-muted-foreground">
          <PingStatus />
        </div>
      </div>

      <div className="mt-4 px-4">
        <Scheduler
          properties={data?.properties}
          reservations={data?.reservations}
          cleanings={cleanersData?.cleaning_job}
          cleaners={cleanersData?.cleaners}
        />
      </div>
      <div className="px-4">
        <AssignmentsTable
          properties={properties}
          reservations={reservations}
          cleanings={cleanings}
        />
      </div>
    </div>
  );
}
