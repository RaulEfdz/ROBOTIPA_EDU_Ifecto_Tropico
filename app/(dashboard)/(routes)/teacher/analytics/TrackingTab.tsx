"use client";

import React, { useEffect, useState, useMemo } from "react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  CartesianGrid,
  Legend,
  Cell,
} from "recharts";

interface TrackingDataPoint {
  date: string;
  totalClicks: number;
  functions: {
    [func: string]: number;
  };
}

interface DetailedFunctionData {
  context: string;
  action: string;
  count: number;
}

const COLORS = [
  "#4F46E5",
  "#10B981",
  "#F59E0B",
  "#EF4444",
  "#8B5CF6",
  "#EC4899",
];

const TrackingTab: React.FC = () => {
  const [data, setData] = useState<TrackingDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedFunction, setSelectedFunction] = useState<string>("all");
  const [detailedData, setDetailedData] = useState<DetailedFunctionData[]>([]);
  const [showDetails, setShowDetails] = useState(false);
  const [showModal, setShowModal] = useState(false);

  useEffect(() => {
    const fetchTrackingData = async () => {
      try {
        const res = await fetch("/api/tracking");
        const json = await res.json();
        if (json.status === "success") {
          setData(json.data);
        }
      } catch (error) {
        console.error("Error fetching tracking data", error);
      } finally {
        setLoading(false);
      }
    };

    fetchTrackingData();
  }, []);

  const functionsList = useMemo(() => {
    const funcs = new Set<string>();
    data.forEach((day) => {
      Object.keys(day.functions).forEach((func) => {
        // Remove static normalization to make it fully dynamic
        funcs.add(func);
      });
    });
    return Array.from(funcs);
  }, [data]);

  // Prepare detailed data when selectedFunction changes
  useEffect(() => {
    if (selectedFunction === "all") {
      setShowDetails(false);
      setDetailedData([]);
      return;
    }

    // Aggregate context and action counts for the selected function
    const contextActionCounts: { [key: string]: number } = {};

    data.forEach((day) => {
      Object.entries(day.functions).forEach(([fullEventName, count]) => {
        const func = fullEventName.split("_")[0] || "unknown";
        if (func !== selectedFunction) return;

        // Extract context and action parts with improved validation
        const parts = fullEventName.split("_");
        const context =
          parts.length > 1 && parts[1] ? parts[1] : "Sin Contexto";
        const action =
          parts.length > 2 && parts.slice(2).join("_")
            ? parts.slice(2).join("_")
            : "Sin Acción";

        const key = context + "||" + action;
        contextActionCounts[key] = (contextActionCounts[key] || 0) + count;
      });
    });

    const detailedArray: DetailedFunctionData[] = Object.entries(
      contextActionCounts
    ).map(([key, count]) => {
      const [context, action] = key.split("||");
      return { context, action, count };
    });

    setDetailedData(detailedArray);
    setShowDetails(true);
  }, [selectedFunction, data]);

  if (loading) {
    return (
      <div className="w-full h-80 flex items-center justify-center">
        <div className="loader">Cargando datos de tracking...</div>
      </div>
    );
  }

  // Filter data by selected function
  const filteredData = data.map((day) => {
    if (selectedFunction === "all") {
      return { date: day.date, clicks: day.totalClicks };
    } else {
      return {
        date: day.date,
        clicks: day.functions[selectedFunction] || 0,
      };
    }
  });

  const totalClicks = filteredData.reduce(
    (acc, point) => acc + point.clicks,
    0
  );

  // Prepare data for modal charts
  const contextData = detailedData.reduce(
    (acc, item) => {
      const existing = acc.find((d) => d.name === item.context);
      if (existing) {
        existing.value += item.count;
      } else {
        acc.push({ name: item.context, value: item.count });
      }
      return acc;
    },
    [] as { name: string; value: number }[]
  );

  const actionData = detailedData.map((item) => ({
    name: item.action,
    value: item.count,
  }));

  return (
    <div>
      <h2 className="text-xl font-semibold mb-4">
        Resumen de Tracking - Últimos 30 días
      </h2>

      <div className="mb-4">
        <label htmlFor="functionSelect" className="mr-2 font-medium">
          Filtrar por función:
        </label>
        <select
          id="functionSelect"
          value={selectedFunction}
          onChange={(e) => setSelectedFunction(e.target.value)}
          className="rounded border border-gray-300 px-2 py-1"
        >
          <option value="all">Todas</option>
          {functionsList.map((func) => (
            <option key={func} value={func}>
              {func}
            </option>
          ))}
        </select>
      </div>

      <div className="mb-8 h-80 bg-white p-4 rounded shadow">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={filteredData}>
            <CartesianGrid stroke="#ccc" strokeDasharray="5 5" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Line
              type="monotone"
              dataKey="clicks"
              name="Clics diarios"
              stroke="#4F46E5"
              strokeWidth={2}
              dot={{ r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      <div className="mb-8 h-64 bg-white p-4 rounded shadow">
        <h3 className="mb-2 font-medium">
          Total de clics en el periodo: {totalClicks}
        </h3>

        {/* Bar chart showing total clicks by function */}
        <ResponsiveContainer width="100%" height={200}>
          <BarChart
            data={functionsList.map((func, index) => {
              // Sum clicks for this exact function name
              const totalClicksForFunc = data.reduce((acc, day) => {
                let sum = 0;
                Object.entries(day.functions).forEach(([eventName, count]) => {
                  if (eventName === func) {
                    sum += count;
                  }
                });
                return acc + sum;
              }, 0);
              return {
                name: func,
                clicks: totalClicksForFunc,
                fill: COLORS[index % COLORS.length],
              };
            })}
            margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
            onClick={(e) => {
              if (e && e.activeLabel) {
                setSelectedFunction(e.activeLabel);
                setShowModal(true);
              }
            }}
          >
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="clicks" name="Clics totales" />
          </BarChart>
        </ResponsiveContainer>
      </div>

      {showDetails && (
        <div>
          {showModal && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
              <div className="bg-white rounded-lg p-6 max-w-4xl w-full max-h-[80vh] overflow-y-auto">
                <h3 className="text-xl font-semibold mb-4">
                  Detalles del evento: {selectedFunction}
                </h3>
                <h4 className="mb-2 font-semibold">
                  Distribución por Contexto
                </h4>
                <ResponsiveContainer width="100%" height={250}>
                  <BarChart
                    data={contextData}
                    margin={{ top: 20, right: 30, left: 20, bottom: 5 }}
                  >
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="name" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="value" fill="#4F46E5" name="Clics" />
                  </BarChart>
                </ResponsiveContainer>

                <h4 className="mt-6 mb-2 font-semibold">
                  Distribución por Acción
                </h4>
                <ResponsiveContainer width="100%" height={250}>
                  <PieChart>
                    <Pie
                      data={actionData}
                      dataKey="value"
                      nameKey="name"
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      label
                    >
                      {actionData.map((entry, index) => (
                        <Cell
                          key={`cell-${index}`}
                          fill={COLORS[index % COLORS.length]}
                        />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>

                <button
                  className="mt-6 px-4 py-2 bg-emerald-600 text-white rounded hover:bg-emerald-700"
                  onClick={() => setShowModal(false)}
                >
                  Cerrar
                </button>
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default TrackingTab;
