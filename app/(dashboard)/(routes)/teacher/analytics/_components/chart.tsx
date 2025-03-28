"use client";

import {
  Bar,
  BarChart,
  Cell,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { Card } from "@/components/ui/card";
import { randomColorWithIntensity } from "@/tools/handlerColors";

interface ChartProps {
  data: {
    name: string;
    total: number;
    color: string;
  }[];
}

export const Chart = ({
  data
}: ChartProps) => {
  const roundUp = (num: number) => Math.ceil(num);
  return (
    <Card>
      <ResponsiveContainer width="100%" height={350}>
        <BarChart data={data}>
          <XAxis
            dataKey="name"
            stroke="#888888"
            fontSize={12}
            // tickLine={false}
            // axisLine={false}
            // label="Curso"
          />
          <YAxis
            stroke="#888888"
            fontSize={12}
            name="Cantidad"
            // tickLine={false}
            // axisLine={false}
            tickFormatter={(value) => `${value}`}
            domain={[0, (dataMax: number) => roundUp(dataMax)]} // Redondear hacia arriba el máximo valor del dominio
            allowDecimals={false} // Asegurar que los ticks sean valores enteros
          />
            <Tooltip />
          <Bar
            dataKey="total"
            radius={[0,0, 0, 0]}
          >
          {data.map((entry, index) => {
            return <Cell cursor="pointer" fill={entry.color} key={`cell-${index}`} />
          })
          }
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </Card>
  )
}