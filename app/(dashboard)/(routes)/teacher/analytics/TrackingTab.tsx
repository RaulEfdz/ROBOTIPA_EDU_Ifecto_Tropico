"use client";

import React, { useEffect, useState } from "react";
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from "recharts";

interface TrackingDataPoint {
  date: string;
  clicks: number;
  pageviews: number;
}

export function TrackingTab() {
  const [data, setData] = useState<TrackingDataPoint[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchTrackingData() {
      try {
        const res = await fetch("/api/analytics/tracking");
        const json = await res.json();
        if (json.status === "success") {
          setData(json.data);
        }
      } catch (error) {
        console.error("Error fetching tracking data:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchTrackingData();
  }, []);

  if (loading) {
    return <div>Cargando datos de seguimiento...</div>;
  }

  return (
    <div className="rounded-xl bg-white p-6 shadow dark:bg-gray-800">
      <h2 className="mb-4 text-xl font-semibold">
        Seguimiento de Actividad de Usuario
      </h2>
      <div className="h-80">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={data}>
            <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="clicks"
              stroke="#8884d8"
              name="Clics"
            />
            <Line
              type="monotone"
              dataKey="pageviews"
              stroke="#82ca9d"
              name="Vistas de Página"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
