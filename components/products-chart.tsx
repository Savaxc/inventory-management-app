"use client";

import { PackagePlus } from "lucide-react";
import {
  Area,
  AreaChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

interface ChartData {
  week: string;
  products: number;
}

export default function ProductChart({ data }: { data: ChartData[] }) {
  const hasData = data.some((item) => item.products > 0);

  if (!hasData) {
    return (
      <div className="h-48 w-full border-2 border-dashed border-gray-100 rounded-xl flex flex-col items-center justify-center bg-gray-50/50">
        <PackagePlus className="w-8 h-8 text-purple-200 mb-2" />
        <p className="text-sm text-gray-400 font-medium">No inventory data yet</p>
        <p className="text-xs text-gray-300">New products will appear here</p>
      </div>
    );
  }

  return (
    <div className="h-48 w-full">
      <ResponsiveContainer width="100%" height="100%">
        <AreaChart
          data={data}
          margin={{ top: 10, right: 10, left: -20, bottom: 0 }}
        >
          <defs>
            <linearGradient id="colorProducts" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#9333ea" stopOpacity={0.15}/>
              <stop offset="95%" stopColor="#9333ea" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
          <XAxis
            dataKey="week"
            stroke="#94a3b8"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            padding={{ left: 10, right: 10 }}
          />
          <YAxis
            stroke="#94a3b8"
            fontSize={11}
            tickLine={false}
            axisLine={false}
            allowDecimals={false}
          />
          <Tooltip
            contentStyle={{
              backgroundColor: "white",
              border: "1px solid #f1f5f9",
              borderRadius: "10px",
              boxShadow: "0 10px 15px -3px rgba(0, 0, 0, 0.05)",
            }}
            cursor={{ stroke: '#9333ea', strokeWidth: 1 }}
          />
          <Area
            type="monotone"
            dataKey="products"
            stroke="#9333ea"
            fill="url(#colorProducts)"
            fillOpacity={1}
            strokeWidth={2.5}
            dot={{ fill: "#9333ea", strokeWidth: 1, r: 3, stroke: "#fff" }}
            activeDot={{ r: 6, strokeWidth: 0, fill: "#9333ea" }}
          />
        </AreaChart>
      </ResponsiveContainer>
    </div>
  );
}