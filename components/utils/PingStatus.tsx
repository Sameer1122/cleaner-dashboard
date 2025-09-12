"use client";

import axios from "axios";
import { useQuery } from "@tanstack/react-query";

export default function PingStatus() {
  const { data, error, isFetching } = useQuery({
    queryKey: ["ping"],
    queryFn: async () => {
      const res = await axios.get("/api/ping");
      return res.data as { ok: boolean; time: string };
    },
    refetchInterval: false,
  });

  if (error) return <span className="text-red-600">Query error</span>;
  if (!data) return <span className="opacity-70">Loading…</span>;

  return (
    <span className="opacity-70">
      React Query OK • {new Date(data.time).toLocaleTimeString()} {isFetching ? "(refreshing)" : ""}
    </span>
  );
}

