"use client";

import { useMemo, useState } from "react";
import {
  BarChart,
  LineChart,
  AreaChart,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  Legend,
  CartesianGrid,
  XAxis,
  YAxis,
  Bar,
  Line,
  Area,
  Pie,
  Cell,
} from "recharts";
import type { CanvasBlock } from "@/lib/canvas-types";

type ChartType = "bar" | "line" | "area" | "pie";

interface ChartDataset {
  name: string;
  data: number[];
  color?: string;
  colors?: string[];
}

interface ChartBlockData {
  chartType: ChartType;
  data: {
    labels: string[];
    datasets: ChartDataset[];
  };
}

const BRAND_COLORS = [
  "#6366F1",
  "#CF384D",
  "#4F5D8A",
  "#16A34A",
  "#D97706",
  "#8B5CF6",
  "#06B6D4",
  "#EC4899",
];

const CHART_TYPE_OPTIONS: { value: ChartType; label: string }[] = [
  { value: "bar", label: "Bar" },
  { value: "line", label: "Line" },
  { value: "area", label: "Area" },
  { value: "pie", label: "Pie" },
];

function getColor(dataset: ChartDataset, index: number): string {
  return dataset.color || BRAND_COLORS[index % BRAND_COLORS.length];
}

/**
 * Normalize chart data from two possible formats:
 * 1. Mock server format: { labels: string[], datasets: [{name, data: number[], color?}] }
 * 2. Claude tool format: Array of objects like [{name: "Jan", revenue: 100}]
 */
function normalizeChartData(raw: any): { labels: string[]; datasets: ChartDataset[] } | null {
  if (!raw) return null;

  // Already in labels+datasets format
  if (raw.labels && raw.datasets) {
    return raw;
  }

  // Array of objects format from Claude — convert to labels+datasets
  if (Array.isArray(raw) && raw.length > 0) {
    const sample = raw[0];
    const keys = Object.keys(sample);
    // First string-valued key is the label, rest are numeric datasets
    const labelKey = keys.find((k) => typeof sample[k] === "string") || keys[0];
    const numericKeys = keys.filter((k) => k !== labelKey && typeof sample[k] === "number");

    if (numericKeys.length === 0) {
      // Try: all keys except the label key might be parseable as numbers
      const fallbackKeys = keys.filter((k) => k !== labelKey && !isNaN(Number(sample[k])));
      if (fallbackKeys.length > 0) {
        return {
          labels: raw.map((d: any) => String(d[labelKey] ?? "")),
          datasets: fallbackKeys.map((key, i) => ({
            name: key,
            data: raw.map((d: any) => Number(d[key]) || 0),
            color: BRAND_COLORS[i % BRAND_COLORS.length],
          })),
        };
      }
      return null;
    }

    return {
      labels: raw.map((d: any) => String(d[labelKey] ?? "")),
      datasets: numericKeys.map((key, i) => ({
        name: key,
        data: raw.map((d: any) => Number(d[key]) || 0),
        color: BRAND_COLORS[i % BRAND_COLORS.length],
      })),
    };
  }

  return null;
}

export function ChartBlock({ block }: { block: CanvasBlock }) {
  const rawData = block.data as any;
  const chartType = rawData?.chartType ?? "bar";
  const normalizedData = useMemo(() => normalizeChartData(rawData?.data), [rawData?.data]);

  const [activeType, setActiveType] = useState<ChartType>(chartType);

  const rechartsData = useMemo(() => {
    if (!normalizedData) return [];
    const { labels, datasets } = normalizedData;
    return labels.map((label: string, i: number) => {
      const entry: Record<string, string | number> = { label };
      datasets.forEach((ds) => {
        entry[ds.name] = ds.data[i] ?? 0;
      });
      return entry;
    });
  }, [normalizedData]);

  const pieData = useMemo(() => {
    if (!normalizedData) return [];
    const { labels, datasets } = normalizedData;
    const ds = datasets[0];
    if (!ds) return [];
    return labels.map((label: string, i: number) => ({
      name: label,
      value: ds.data[i] ?? 0,
      color: ds.colors?.[i] || BRAND_COLORS[i % BRAND_COLORS.length],
    }));
  }, [normalizedData]);

  const datasets = normalizedData?.datasets ?? [];

  if (!normalizedData) {
    return (
      <div
        className="flex items-center justify-center px-4 py-8 text-[12px]"
        style={{ color: "var(--ci-text-muted)" }}
      >
        No chart data available
      </div>
    );
  }

  const renderCartesianChart = () => {
    const commonProps = {
      data: rechartsData,
      margin: { top: 8, right: 16, left: -8, bottom: 0 },
    };

    const sharedChildren = (
      <>
        <CartesianGrid
          strokeDasharray="3 3"
          stroke="var(--ci-border)"
          vertical={false}
        />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 12, fill: "var(--ci-text-muted)" }}
          axisLine={{ stroke: "var(--ci-border)" }}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 12, fill: "var(--ci-text-muted)" }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            fontSize: 12,
            background: "var(--ci-bg-surface)",
            border: "1px solid var(--ci-border)",
            borderRadius: 6,
            boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
          }}
          labelStyle={{ color: "var(--ci-text-secondary)", fontWeight: 500 }}
        />
        <Legend
          wrapperStyle={{ fontSize: 12, color: "var(--ci-text-secondary)" }}
          iconType="square"
          iconSize={10}
        />
      </>
    );

    if (activeType === "bar") {
      return (
        <BarChart {...commonProps}>
          {sharedChildren}
          {datasets.map((ds, i) => (
            <Bar
              key={ds.name}
              dataKey={ds.name}
              fill={getColor(ds, i)}
              radius={[3, 3, 0, 0]}
              animationDuration={600}
              animationEasing="ease-out"
            />
          ))}
        </BarChart>
      );
    }

    if (activeType === "line") {
      return (
        <LineChart {...commonProps}>
          {sharedChildren}
          {datasets.map((ds, i) => (
            <Line
              key={ds.name}
              type="monotone"
              dataKey={ds.name}
              stroke={getColor(ds, i)}
              strokeWidth={2}
              dot={{ r: 3, fill: "var(--ci-bg-surface)", strokeWidth: 2 }}
              activeDot={{ r: 5 }}
              animationDuration={600}
              animationEasing="ease-out"
            />
          ))}
        </LineChart>
      );
    }

    // area
    return (
      <AreaChart {...commonProps}>
        <defs>
          {datasets.map((ds, i) => {
            const color = getColor(ds, i);
            return (
              <linearGradient
                key={ds.name}
                id={`gradient-${i}`}
                x1="0"
                y1="0"
                x2="0"
                y2="1"
              >
                <stop offset="0%" stopColor={color} stopOpacity={0.3} />
                <stop offset="100%" stopColor={color} stopOpacity={0.02} />
              </linearGradient>
            );
          })}
        </defs>
        {sharedChildren}
        {datasets.map((ds, i) => (
          <Area
            key={ds.name}
            type="monotone"
            dataKey={ds.name}
            stroke={getColor(ds, i)}
            strokeWidth={2}
            fill={`url(#gradient-${i})`}
            animationDuration={600}
            animationEasing="ease-out"
          />
        ))}
      </AreaChart>
    );
  };

  const renderPieChart = () => (
    <PieChart>
      <Pie
        data={pieData}
        dataKey="value"
        nameKey="name"
        cx="50%"
        cy="50%"
        outerRadius="75%"
        innerRadius="40%"
        paddingAngle={2}
        animationDuration={600}
        animationEasing="ease-out"
      >
        {pieData.map((entry, i) => (
          <Cell key={i} fill={entry.color} />
        ))}
      </Pie>
      <Tooltip
        contentStyle={{
          fontSize: 12,
          background: "var(--ci-bg-surface)",
          border: "1px solid var(--ci-border)",
          borderRadius: 6,
          boxShadow: "0 2px 8px rgba(0,0,0,0.08)",
        }}
      />
      <Legend
        wrapperStyle={{ fontSize: 12, color: "var(--ci-text-secondary)" }}
        iconType="square"
        iconSize={10}
      />
    </PieChart>
  );

  return (
    <div className="px-4 py-3">
      {/* Chart type selector pills */}
      <div className="mb-3 flex items-center gap-1">
        {CHART_TYPE_OPTIONS.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setActiveType(opt.value)}
            className="rounded-md px-2.5 py-1 text-[12px] font-medium transition-colors"
            style={{
              background:
                activeType === opt.value
                  ? "var(--ci-accent)"
                  : "transparent",
              color:
                activeType === opt.value
                  ? "#ffffff"
                  : "var(--ci-text-secondary)",
              border:
                activeType === opt.value
                  ? "1px solid var(--ci-accent)"
                  : "1px solid var(--ci-border)",
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div style={{ width: "100%", height: 260 }}>
        <ResponsiveContainer width="100%" height="100%">
          {activeType === "pie" ? renderPieChart() : renderCartesianChart()}
        </ResponsiveContainer>
      </div>
    </div>
  );
}
