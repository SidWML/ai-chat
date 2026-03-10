"use client";

import { useState, useMemo, useRef, useCallback, useEffect } from "react";
import {
  useDashboard,
  useRemoveWidget,
  useAddWidget,
  useUpdateWidget,
} from "@/lib/v2/queries";
import {
  IconPlus,
  IconTable,
  IconChart,
  IconTrash,
  IconDatabase,
} from "@/components/v2/ui/Icons";
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
import type { DashboardWidget } from "@/lib/v2/types";

/* ── Constants ──────────────────────────────────────────────── */

interface DashboardGridProps {
  dashboardId: string;
}

type ChartType = "bar" | "line" | "area" | "pie";

const COLS = 12;
const ROW_HEIGHT = 80; // px per grid row unit
const GAP = 16;

const BRAND_COLORS = [
  "#3C4C73",
  "#CF384D",
  "#4F5D8A",
  "#16A34A",
  "#D97706",
  "#8B5CF6",
  "#06B6D4",
  "#EC4899",
];

const WIDGET_TYPE_CONFIG: Record<
  string,
  { icon: typeof IconChart; color: string; bg: string; label: string }
> = {
  chart: { icon: IconChart, color: "#D97706", bg: "#FFFBEB", label: "Chart" },
  table: { icon: IconTable, color: "#16A34A", bg: "#F0FDF4", label: "Table" },
};

const DEFAULT_WIDGET_CONFIG = {
  icon: IconDatabase,
  color: "var(--ci-navy)",
  bg: "#EEF2FF",
  label: "Widget",
};

/* ── Layout types ───────────────────────────────────────────── */

interface LayoutItem {
  id: string;
  x: number; // grid column (0-based)
  y: number; // grid row (0-based)
  w: number; // width in columns
  h: number; // height in row units
}

function buildLayout(widgets: DashboardWidget[]): LayoutItem[] {
  const layout: LayoutItem[] = [];
  const occupied: boolean[][] = []; // occupied[row][col]

  const isOccupied = (row: number, col: number) =>
    occupied[row]?.[col] ?? false;

  const markOccupied = (x: number, y: number, w: number, h: number) => {
    for (let r = y; r < y + h; r++) {
      if (!occupied[r]) occupied[r] = [];
      for (let c = x; c < x + w; c++) {
        occupied[r][c] = true;
      }
    }
  };

  const findNextPosition = (w: number, h: number): { x: number; y: number } => {
    for (let row = 0; ; row++) {
      for (let col = 0; col <= COLS - w; col++) {
        let fits = true;
        for (let r = row; r < row + h && fits; r++) {
          for (let c = col; c < col + w && fits; c++) {
            if (isOccupied(r, c)) fits = false;
          }
        }
        if (fits) return { x: col, y: row };
      }
    }
  };

  for (const widget of widgets) {
    const w = Math.min(Math.max(widget.grid_width ?? 6, 3), 12);
    const h = Math.max(widget.grid_height ?? 4, 2);

    // If widget has explicit position, try to use it
    if (widget.position_x != null && widget.position_y != null && widget.position_x >= 0 && widget.position_y >= 0) {
      const x = Math.min(widget.position_x, COLS - w);
      const y = widget.position_y;
      // Check if position is free
      let fits = true;
      for (let r = y; r < y + h && fits; r++) {
        for (let c = x; c < x + w && fits; c++) {
          if (isOccupied(r, c)) fits = false;
        }
      }
      if (fits) {
        markOccupied(x, y, w, h);
        layout.push({ id: widget.id, x, y, w, h });
        continue;
      }
    }

    // Auto-place
    const pos = findNextPosition(w, h);
    markOccupied(pos.x, pos.y, w, h);
    layout.push({ id: widget.id, ...pos, w, h });
  }

  return layout;
}

/* ── Chart Rendering ────────────────────────────────────────── */

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

function getColor(dataset: ChartDataset, index: number): string {
  return dataset.color || BRAND_COLORS[index % BRAND_COLORS.length];
}

function WidgetChartContent({ widget }: { widget: DashboardWidget }) {
  // Support both block_data format and flat widget format (from db.json)
  const blockData = (widget.block_data ?? {
    chartType: (widget as any).chartType,
    data: (widget as any).data,
  }) as ChartBlockData | undefined;
  const [activeType, setActiveType] = useState<ChartType>(
    blockData?.chartType ?? "bar"
  );

  const rechartsData = useMemo(() => {
    if (!blockData?.data) return [];
    const { labels, datasets } = blockData.data;
    return labels.map((label, i) => {
      const entry: Record<string, string | number> = { label };
      datasets.forEach((ds) => {
        entry[ds.name] = ds.data[i] ?? 0;
      });
      return entry;
    });
  }, [blockData]);

  const pieData = useMemo(() => {
    if (!blockData?.data) return [];
    const { labels, datasets } = blockData.data;
    const ds = datasets[0];
    if (!ds) return [];
    return labels.map((label, i) => ({
      name: label,
      value: ds.data[i] ?? 0,
      color: ds.colors?.[i] || BRAND_COLORS[i % BRAND_COLORS.length],
    }));
  }, [blockData]);

  const datasets = blockData?.data?.datasets ?? [];

  if (!blockData?.data) {
    return (
      <div
        className="flex items-center justify-center py-12 text-[12px]"
        style={{ color: "var(--ci-text-muted)" }}
      >
        No chart data available
      </div>
    );
  }

  const chartTypeOptions: { value: ChartType; label: string }[] = [
    { value: "bar", label: "Bar" },
    { value: "line", label: "Line" },
    { value: "area", label: "Area" },
    { value: "pie", label: "Pie" },
  ];

  const renderCartesianChart = () => {
    const commonProps = {
      data: rechartsData,
      margin: { top: 8, right: 16, left: -8, bottom: 0 },
    };

    const sharedChildren = (
      <>
        <CartesianGrid strokeDasharray="3 3" stroke="var(--ci-border)" vertical={false} />
        <XAxis
          dataKey="label"
          tick={{ fontSize: 11, fill: "var(--ci-text-muted)" }}
          axisLine={{ stroke: "var(--ci-border)" }}
          tickLine={false}
        />
        <YAxis
          tick={{ fontSize: 11, fill: "var(--ci-text-muted)" }}
          axisLine={false}
          tickLine={false}
        />
        <Tooltip
          contentStyle={{
            fontSize: 12,
            background: "var(--ci-bg-surface)",
            border: "1px solid var(--ci-border)",
            borderRadius: 8,
            boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
          }}
          labelStyle={{ color: "var(--ci-text-secondary)", fontWeight: 500 }}
        />
        <Legend
          wrapperStyle={{ fontSize: 11, color: "var(--ci-text-secondary)" }}
          iconType="square"
          iconSize={8}
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

    return (
      <AreaChart {...commonProps}>
        <defs>
          {datasets.map((ds, i) => {
            const color = getColor(ds, i);
            return (
              <linearGradient
                key={ds.name}
                id={`dash-gradient-${widget.id}-${i}`}
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
            fill={`url(#dash-gradient-${widget.id}-${i})`}
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
          borderRadius: 8,
          boxShadow: "0 4px 12px rgba(0,0,0,0.08)",
        }}
      />
      <Legend
        wrapperStyle={{ fontSize: 11, color: "var(--ci-text-secondary)" }}
        iconType="square"
        iconSize={8}
      />
    </PieChart>
  );

  return (
    <div className="h-full flex flex-col">
      {/* Chart type selector */}
      <div className="mb-3 flex items-center gap-1 shrink-0">
        {chartTypeOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={(e) => {
              e.stopPropagation();
              setActiveType(opt.value);
            }}
            className="rounded-md px-2 py-1 text-[11px] font-medium transition-colors"
            style={{
              background: activeType === opt.value ? "#3C4C73" : "transparent",
              color: activeType === opt.value ? "#ffffff" : "var(--ci-text-secondary)",
              border: activeType === opt.value ? "1px solid #3C4C73" : "1px solid var(--ci-border)",
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div className="flex-1 min-h-0" style={{ minHeight: 160 }}>
        <ResponsiveContainer width="100%" height="100%">
          {activeType === "pie" ? renderPieChart() : renderCartesianChart()}
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/* ── Table Rendering ────────────────────────────────────────── */

interface TableBlockData {
  columns: string[];
  rows: Record<string, unknown>[];
}

function WidgetTableContent({ widget }: { widget: DashboardWidget }) {
  // Support both block_data format and flat widget format (from db.json)
  const blockData = (widget.block_data ?? {
    columns: (widget as any).columns,
    rows: (widget as any).rows,
  }) as TableBlockData | undefined;

  if (!blockData?.columns || blockData.columns.length === 0) {
    return (
      <div
        className="flex items-center justify-center py-12 text-[12px]"
        style={{ color: "var(--ci-text-muted)" }}
      >
        No table data available
      </div>
    );
  }

  const { columns, rows } = blockData;
  const displayCols = columns.slice(0, 5);
  const displayRows = rows.slice(0, 8);

  return (
    <div className="overflow-x-auto">
      <table className="w-full text-[12px]">
        <thead>
          <tr>
            {displayCols.map((col) => (
              <th
                key={col}
                className="whitespace-nowrap px-3 py-2 text-left text-[11px] font-semibold uppercase tracking-wide"
                style={{
                  color: "var(--ci-text-tertiary)",
                  background: "var(--ci-bg-wash)",
                  borderBottom: "2px solid var(--ci-border)",
                }}
              >
                {col}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {displayRows.map((row, ri) => (
            <tr
              key={ri}
              className="transition-colors hover:bg-black/2"
              style={{
                background: ri % 2 === 1 ? "var(--ci-bg-wash)" : "transparent",
              }}
            >
              {displayCols.map((col) => (
                <td
                  key={col}
                  className="whitespace-nowrap px-3 py-1.5 truncate"
                  style={{
                    color: "var(--ci-text-secondary)",
                    borderBottom: "1px solid var(--ci-border)",
                    maxWidth: 180,
                  }}
                >
                  {row[col] != null ? String(row[col]) : "\u2014"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
      {rows.length > 8 && (
        <div className="px-3 py-2" style={{ borderTop: "1px solid var(--ci-border)" }}>
          <p className="text-[10px] font-medium" style={{ color: "var(--ci-text-muted)" }}>
            +{rows.length - 8} more rows
            {columns.length > 5 && ` \u00b7 ${columns.length - 5} more columns`}
          </p>
        </div>
      )}
    </div>
  );
}

/* ── Widget Content Router ──────────────────────────────────── */

function WidgetContent({ widget }: { widget: DashboardWidget }) {
  // Support both block_type (new widgets) and type (existing db.json data)
  const blockType = widget.block_type ?? (widget as any).type ?? "unknown";

  if (blockType === "chart") {
    return <WidgetChartContent widget={widget} />;
  }

  if (blockType === "table") {
    return <WidgetTableContent widget={widget} />;
  }

  // Fallback
  return (
    <div className="flex items-center justify-center py-12">
      <p className="text-[12px]" style={{ color: "var(--ci-text-muted)" }}>
        Unsupported widget type
      </p>
    </div>
  );
}

/* ── Skeleton Widget ────────────────────────────────────────── */

function SkeletonWidget({ delay, span = 6 }: { delay: number; span?: number }) {
  return (
    <div
      className="v2-fade-up rounded-xl p-5"
      style={{
        background: "var(--ci-bg-surface)",
        border: "1px solid var(--ci-border)",
        boxShadow: "var(--ci-shadow-sm)",
        animationDelay: `${delay}ms`,
        gridColumn: `span ${span}`,
      }}
    >
      <div className="mb-3 flex items-center gap-2">
        <div className="h-7 w-7 animate-pulse rounded-lg" style={{ background: "var(--ci-border)" }} />
        <div className="h-4 w-28 animate-pulse rounded" style={{ background: "var(--ci-border)" }} />
      </div>
      <div className="space-y-2 py-4">
        <div className="h-3 w-full animate-pulse rounded" style={{ background: "var(--ci-border)" }} />
        <div className="h-3 w-3/4 animate-pulse rounded" style={{ background: "var(--ci-border)" }} />
        <div className="h-3 w-1/2 animate-pulse rounded" style={{ background: "var(--ci-border)" }} />
      </div>
    </div>
  );
}

/* ── Add Widget Modal ───────────────────────────────────────── */

function AddWidgetModal({
  open,
  dashboardId,
  onClose,
}: {
  open: boolean;
  dashboardId: string;
  onClose: () => void;
}) {
  const [title, setTitle] = useState("");
  const [widgetType, setWidgetType] = useState<"chart" | "table">("chart");
  const addWidget = useAddWidget();

  if (!open) return null;

  const handleAdd = () => {
    if (!title.trim()) return;

    const sampleData =
      widgetType === "chart"
        ? {
            block_type: "chart",
            title: title.trim(),
            block_data: {
              chartType: "bar",
              data: {
                labels: ["Jan", "Feb", "Mar", "Apr", "May"],
                datasets: [
                  { name: "Series A", data: [30, 45, 28, 55, 40] },
                ],
              },
            },
            position_x: 0,
            position_y: 0,
            grid_width: 6,
            grid_height: 4,
          }
        : {
            block_type: "table",
            title: title.trim(),
            block_data: {
              columns: ["Name", "Value", "Status"],
              rows: [
                { Name: "Item 1", Value: "100", Status: "Active" },
                { Name: "Item 2", Value: "250", Status: "Pending" },
                { Name: "Item 3", Value: "75", Status: "Active" },
              ],
            },
            position_x: 0,
            position_y: 0,
            grid_width: 6,
            grid_height: 4,
          };

    addWidget.mutate(
      { dashboardId, data: sampleData },
      {
        onSuccess: () => {
          setTitle("");
          onClose();
        },
      }
    );
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center"
      style={{ background: "rgba(0,0,0,0.4)", backdropFilter: "blur(4px)" }}
    >
      <div
        className="v2-fade-up relative w-full max-w-sm rounded-2xl p-6"
        style={{
          background: "var(--ci-bg-surface)",
          border: "1px solid var(--ci-border)",
          boxShadow: "var(--ci-shadow-lg)",
        }}
      >
        <h2 className="mb-4 text-[15px] font-semibold" style={{ color: "var(--ci-text)" }}>
          Add Widget
        </h2>

        {/* Title */}
        <div className="mb-4">
          <label
            className="mb-1.5 block text-[12px] font-semibold"
            style={{ color: "var(--ci-text-secondary)" }}
          >
            Widget Title
          </label>
          <input
            type="text"
            placeholder="e.g. Monthly Revenue"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && handleAdd()}
            autoFocus
            className="w-full rounded-xl px-3.5 py-2.5 text-[13px] outline-none"
            style={{
              background: "var(--ci-bg-wash)",
              border: "1px solid var(--ci-border)",
              color: "var(--ci-text)",
            }}
          />
        </div>

        {/* Type selector */}
        <div className="mb-5">
          <label
            className="mb-1.5 block text-[12px] font-semibold"
            style={{ color: "var(--ci-text-secondary)" }}
          >
            Type
          </label>
          <div className="flex gap-2">
            {(["chart", "table"] as const).map((t) => {
              const isActive = widgetType === t;
              const config = WIDGET_TYPE_CONFIG[t];
              const Icon = config.icon;
              return (
                <button
                  key={t}
                  onClick={() => setWidgetType(t)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-xl py-2.5 text-[13px] font-medium transition-all"
                  style={{
                    background: isActive ? config.bg : "var(--ci-bg-wash)",
                    border: isActive
                      ? `2px solid ${config.color}`
                      : "1px solid var(--ci-border)",
                    color: isActive ? config.color : "var(--ci-text-muted)",
                  }}
                >
                  <Icon className="h-4 w-4" />
                  {config.label}
                </button>
              );
            })}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-end gap-2">
          <button
            onClick={onClose}
            className="rounded-xl px-4 py-2.5 text-[13px] font-medium transition-colors hover:bg-black/5"
            style={{ color: "var(--ci-text-muted)" }}
          >
            Cancel
          </button>
          <button
            onClick={handleAdd}
            disabled={!title.trim() || addWidget.isPending}
            className="rounded-xl px-5 py-2.5 text-[13px] font-semibold text-white transition-all hover:shadow-lg active:scale-[0.98] disabled:opacity-50"
            style={{ background: "linear-gradient(135deg, var(--ci-navy), #5A6B8A)" }}
          >
            {addWidget.isPending ? "Adding..." : "Add Widget"}
          </button>
        </div>
      </div>
    </div>
  );
}

/* ── Draggable / Resizable Widget ──────────────────────────── */

interface DraggableWidgetProps {
  widget: DashboardWidget;
  layoutItem: LayoutItem;
  colWidth: number;
  isDeleting: boolean;
  onDelete: () => void;
  onCancelDelete: () => void;
  onConfirmDelete: () => void;
  deletePending: boolean;
  onDragStart: (id: string, e: React.MouseEvent) => void;
  onResizeStart: (id: string, e: React.MouseEvent) => void;
  isDragging: boolean;
  isResizing: boolean;
}

function DraggableWidget({
  widget,
  layoutItem,
  colWidth,
  isDeleting,
  onDelete,
  onCancelDelete,
  onConfirmDelete,
  deletePending,
  onDragStart,
  onResizeStart,
  isDragging,
  isResizing,
}: DraggableWidgetProps) {
  const blockType = widget.block_type ?? (widget as any).type ?? "unknown";
  const config = WIDGET_TYPE_CONFIG[blockType] ?? DEFAULT_WIDGET_CONFIG;
  const Icon = config.icon;

  const left = layoutItem.x * (colWidth + GAP);
  const top = layoutItem.y * (ROW_HEIGHT + GAP);
  const width = layoutItem.w * colWidth + (layoutItem.w - 1) * GAP;
  const height = layoutItem.h * ROW_HEIGHT + (layoutItem.h - 1) * GAP;

  return (
    <div
      className="group absolute rounded-xl transition-shadow duration-200"
      style={{
        left,
        top,
        width,
        height,
        background: "var(--ci-bg-surface)",
        border: isDragging ? "2px solid var(--ci-navy)" : "1px solid var(--ci-border)",
        boxShadow: isDragging ? "var(--ci-shadow-lg)" : "var(--ci-shadow-sm)",
        zIndex: isDragging || isResizing ? 50 : 1,
        opacity: isDragging ? 0.9 : 1,
        transition: isDragging || isResizing ? "box-shadow 0.2s" : "all 0.3s ease",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Widget Header - drag handle */}
      <div
        className="flex items-center justify-between px-5 py-3.5 shrink-0"
        style={{
          borderBottom: "1px solid var(--ci-border)",
          cursor: "grab",
        }}
        onMouseDown={(e) => onDragStart(widget.id, e)}
      >
        <div className="flex items-center gap-2.5 min-w-0">
          <div
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg"
            style={{ background: config.bg }}
          >
            <Icon className="h-3.5 w-3.5" style={{ color: config.color }} />
          </div>
          <span className="text-[13px] font-semibold truncate" style={{ color: "var(--ci-text)" }}>
            {widget.title ?? config.label}
          </span>
          <span
            className="rounded-md px-1.5 py-0.5 text-[10px] font-medium uppercase tracking-wide shrink-0"
            style={{ background: config.bg, color: config.color }}
          >
            {config.label}
          </span>
        </div>

        {/* Delete button */}
        {isDeleting ? (
          <div className="flex items-center gap-1.5 shrink-0">
            <span className="text-[11px] font-medium" style={{ color: "var(--ci-text)" }}>
              Remove?
            </span>
            <button
              onClick={(e) => { e.stopPropagation(); onConfirmDelete(); }}
              disabled={deletePending}
              className="rounded px-2 py-0.5 text-[11px] font-semibold text-white transition-colors disabled:opacity-50"
              style={{ background: "#EF4444" }}
            >
              {deletePending ? "..." : "Yes"}
            </button>
            <button
              onClick={(e) => { e.stopPropagation(); onCancelDelete(); }}
              className="rounded px-2 py-0.5 text-[11px] font-medium transition-colors hover:bg-black/5"
              style={{ color: "var(--ci-text-muted)" }}
            >
              No
            </button>
          </div>
        ) : (
          <button
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-lg opacity-0 transition-all duration-200 group-hover:opacity-100 hover:bg-red-50"
            style={{ color: "var(--ci-text-muted)" }}
            title="Remove widget"
          >
            <IconTrash className="h-3.5 w-3.5" />
          </button>
        )}
      </div>

      {/* Widget Body */}
      <div className="flex-1 min-h-0 overflow-auto px-5 py-4">
        <WidgetContent widget={widget} />
      </div>

      {/* Resize handle */}
      <div
        className="absolute bottom-0 right-0 h-6 w-6 cursor-se-resize opacity-0 transition-opacity group-hover:opacity-60"
        style={{ color: "var(--ci-text-muted)" }}
        onMouseDown={(e) => {
          e.stopPropagation();
          onResizeStart(widget.id, e);
        }}
      >
        <svg viewBox="0 0 16 16" fill="currentColor" className="h-4 w-4 absolute bottom-1 right-1">
          <circle cx="12" cy="12" r="1.5" />
          <circle cx="7" cy="12" r="1.5" />
          <circle cx="12" cy="7" r="1.5" />
        </svg>
      </div>
    </div>
  );
}

/* ── Main Component ─────────────────────────────────────────── */

export function DashboardGrid({ dashboardId }: DashboardGridProps) {
  const { data: dashboard, isLoading, error } = useDashboard(dashboardId);
  const removeWidget = useRemoveWidget();
  const updateWidget = useUpdateWidget();
  const [showAddModal, setShowAddModal] = useState(false);
  const [deleteConfirmId, setDeleteConfirmId] = useState<string | null>(null);

  // Layout state
  const [layout, setLayout] = useState<LayoutItem[]>([]);
  const containerRef = useRef<HTMLDivElement>(null);
  const [containerWidth, setContainerWidth] = useState(0);

  // Drag state
  const [dragId, setDragId] = useState<string | null>(null);
  const dragStartRef = useRef<{ mouseX: number; mouseY: number; origX: number; origY: number } | null>(null);

  // Resize state
  const [resizeId, setResizeId] = useState<string | null>(null);
  const resizeStartRef = useRef<{ mouseX: number; mouseY: number; origW: number; origH: number } | null>(null);

  // Refs for current layout (avoid stale closures)
  const layoutRef = useRef(layout);
  layoutRef.current = layout;

  const widgets: DashboardWidget[] = useMemo(
    () => dashboard?.widgets ?? [],
    [dashboard]
  );

  // Measure container width
  useEffect(() => {
    if (!containerRef.current) return;
    const observer = new ResizeObserver((entries) => {
      for (const entry of entries) {
        setContainerWidth(entry.contentRect.width);
      }
    });
    observer.observe(containerRef.current);
    return () => observer.disconnect();
  }, []);

  // Build layout from widget data when widgets change
  useEffect(() => {
    if (widgets.length > 0) {
      setLayout(buildLayout(widgets));
    } else {
      setLayout([]);
    }
  }, [widgets]);

  const colWidth = containerWidth > 0
    ? (containerWidth - (COLS - 1) * GAP) / COLS
    : 0;

  // Total grid height
  const maxRow = useMemo(() => {
    if (layout.length === 0) return 4;
    return Math.max(...layout.map((l) => l.y + l.h));
  }, [layout]);

  const gridHeight = maxRow * ROW_HEIGHT + (maxRow - 1) * GAP;

  // Persist layout change to API
  const persistLayout = useCallback(
    (item: LayoutItem) => {
      updateWidget.mutate({
        dashboardId,
        widgetId: item.id,
        data: {
          position_x: item.x,
          position_y: item.y,
          grid_width: item.w,
          grid_height: item.h,
        },
      });
    },
    [dashboardId, updateWidget]
  );

  // ── Drag handlers ──────────────────────────────────────────

  const handleDragStart = useCallback(
    (id: string, e: React.MouseEvent) => {
      if (e.button !== 0) return; // left click only
      e.preventDefault();
      const item = layoutRef.current.find((l) => l.id === id);
      if (!item) return;
      setDragId(id);
      dragStartRef.current = {
        mouseX: e.clientX,
        mouseY: e.clientY,
        origX: item.x,
        origY: item.y,
      };
    },
    []
  );

  useEffect(() => {
    if (!dragId) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!dragStartRef.current || colWidth <= 0) return;
      const dx = e.clientX - dragStartRef.current.mouseX;
      const dy = e.clientY - dragStartRef.current.mouseY;

      const newX = Math.round(dragStartRef.current.origX + dx / (colWidth + GAP));
      const newY = Math.round(dragStartRef.current.origY + dy / (ROW_HEIGHT + GAP));

      setLayout((prev) =>
        prev.map((l) => {
          if (l.id !== dragId) return l;
          const clampedX = Math.max(0, Math.min(COLS - l.w, newX));
          const clampedY = Math.max(0, newY);
          return { ...l, x: clampedX, y: clampedY };
        })
      );
    };

    const handleMouseUp = () => {
      const item = layoutRef.current.find((l) => l.id === dragId);
      if (item) persistLayout(item);
      setDragId(null);
      dragStartRef.current = null;
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [dragId, colWidth, persistLayout]);

  // ── Resize handlers ────────────────────────────────────────

  const handleResizeStart = useCallback(
    (id: string, e: React.MouseEvent) => {
      if (e.button !== 0) return;
      e.preventDefault();
      const item = layoutRef.current.find((l) => l.id === id);
      if (!item) return;
      setResizeId(id);
      resizeStartRef.current = {
        mouseX: e.clientX,
        mouseY: e.clientY,
        origW: item.w,
        origH: item.h,
      };
    },
    []
  );

  useEffect(() => {
    if (!resizeId) return;

    const handleMouseMove = (e: MouseEvent) => {
      if (!resizeStartRef.current || colWidth <= 0) return;
      const dx = e.clientX - resizeStartRef.current.mouseX;
      const dy = e.clientY - resizeStartRef.current.mouseY;

      const newW = Math.round(resizeStartRef.current.origW + dx / (colWidth + GAP));
      const newH = Math.round(resizeStartRef.current.origH + dy / (ROW_HEIGHT + GAP));

      setLayout((prev) =>
        prev.map((l) => {
          if (l.id !== resizeId) return l;
          const clampedW = Math.max(3, Math.min(COLS - l.x, newW));
          const clampedH = Math.max(2, newH);
          return { ...l, w: clampedW, h: clampedH };
        })
      );
    };

    const handleMouseUp = () => {
      const item = layoutRef.current.find((l) => l.id === resizeId);
      if (item) persistLayout(item);
      setResizeId(null);
      resizeStartRef.current = null;
    };

    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    return () => {
      document.removeEventListener("mousemove", handleMouseMove);
      document.removeEventListener("mouseup", handleMouseUp);
    };
  }, [resizeId, colWidth, persistLayout]);

  // ── Delete handler ─────────────────────────────────────────

  const handleRemoveWidget = (widgetId: string) => {
    removeWidget.mutate(
      { dashboardId, widgetId },
      { onSuccess: () => setDeleteConfirmId(null) }
    );
  };

  // ── Loading state ──────────────────────────────────────────

  if (isLoading) {
    return (
      <div
        className="grid gap-4"
        style={{ gridTemplateColumns: "repeat(12, 1fr)" }}
      >
        <SkeletonWidget delay={0} span={6} />
        <SkeletonWidget delay={60} span={6} />
        <SkeletonWidget delay={120} span={6} />
        <SkeletonWidget delay={180} span={6} />
      </div>
    );
  }

  // ── Error state ────────────────────────────────────────────

  if (error || !dashboard) {
    return (
      <div className="flex flex-col items-center justify-center py-20 v2-fade-up">
        <div
          className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl"
          style={{ background: "#FEF2F2" }}
        >
          <IconDatabase className="h-6 w-6" style={{ color: "#EF4444" }} />
        </div>
        <p className="mb-2 text-[15px] font-semibold" style={{ color: "var(--ci-text)" }}>
          Failed to load dashboard
        </p>
        <p className="text-[13px]" style={{ color: "var(--ci-text-muted)" }}>
          Something went wrong. Please try again later.
        </p>
      </div>
    );
  }

  // ── Empty state ────────────────────────────────────────────

  if (widgets.length === 0) {
    return (
      <div className="v2-fade-up">
        {/* Dashboard header */}
        {dashboard && (
          <div className="mb-8">
            <h1 className="text-[20px] font-bold tracking-tight" style={{ color: "var(--ci-text)" }}>
              {dashboard.title || "Untitled Dashboard"}
            </h1>
            {dashboard.description && (
              <p className="mt-1 text-[13px]" style={{ color: "var(--ci-text-muted)" }}>
                {dashboard.description}
              </p>
            )}
          </div>
        )}
        <div className="flex flex-col items-center justify-center py-20">
          <div
            className="mb-5 flex h-20 w-20 items-center justify-center rounded-2xl"
            style={{ background: "var(--ci-bg-wash)" }}
          >
            <IconPlus className="h-8 w-8" style={{ color: "var(--ci-text-muted)" }} />
          </div>
          <p className="mb-2 text-[16px] font-semibold" style={{ color: "var(--ci-text)" }}>
            No widgets yet
          </p>
          <p className="mb-6 max-w-xs text-center text-[13px] leading-relaxed" style={{ color: "var(--ci-text-muted)" }}>
            Pin charts, tables, and insights from your chats to build your dashboard.
          </p>
          <button
            onClick={() => setShowAddModal(true)}
            className="flex items-center gap-2 rounded-xl px-6 py-2.5 text-[13px] font-semibold text-white transition-all hover:shadow-lg active:scale-[0.98]"
            style={{ background: "linear-gradient(135deg, var(--ci-navy), #5A6B8A)" }}
          >
            <IconPlus className="h-4 w-4" />
            Add Widget
          </button>
        </div>

        <AddWidgetModal
          open={showAddModal}
          dashboardId={dashboardId}
          onClose={() => setShowAddModal(false)}
        />
      </div>
    );
  }

  // ── Grid with widgets ──────────────────────────────────────

  return (
    <div>
      {/* Dashboard header */}
      {dashboard && (
        <div className="mb-5">
          <h1 className="text-[20px] font-bold tracking-tight" style={{ color: "var(--ci-text)" }}>
            {dashboard.title || "Untitled Dashboard"}
          </h1>
          {dashboard.description && (
            <p className="mt-1 text-[13px]" style={{ color: "var(--ci-text-muted)" }}>
              {dashboard.description}
            </p>
          )}
        </div>
      )}

      {/* Toolbar */}
      <div className="mb-5 flex items-center justify-between">
        <p className="text-[13px] font-medium" style={{ color: "var(--ci-text-muted)" }}>
          {widgets.length} widget{widgets.length !== 1 ? "s" : ""}
          <span className="ml-2 text-[11px]" style={{ color: "var(--ci-text-muted)", opacity: 0.6 }}>
            Drag headers to move, drag corners to resize
          </span>
        </p>
        <button
          onClick={() => setShowAddModal(true)}
          className="flex items-center gap-2 rounded-xl px-4 py-2 text-[13px] font-semibold text-white transition-all hover:shadow-lg active:scale-[0.98]"
          style={{ background: "linear-gradient(135deg, var(--ci-navy), #5A6B8A)" }}
        >
          <IconPlus className="h-4 w-4" />
          Add Widget
        </button>
      </div>

      {/* Absolutely positioned widget container */}
      <div
        ref={containerRef}
        className="relative"
        style={{
          height: gridHeight + 40, // extra space at bottom
          userSelect: dragId || resizeId ? "none" : "auto",
        }}
      >
        {/* Grid lines (visual guide) */}
        {(dragId || resizeId) && colWidth > 0 && (
          <div
            className="absolute inset-0 pointer-events-none"
            style={{ opacity: 0.3 }}
          >
            {Array.from({ length: COLS }).map((_, i) => (
              <div
                key={i}
                className="absolute top-0 bottom-0 rounded"
                style={{
                  left: i * (colWidth + GAP),
                  width: colWidth,
                  background: "var(--ci-border)",
                  opacity: 0.3,
                }}
              />
            ))}
          </div>
        )}

        {/* Widgets */}
        {colWidth > 0 &&
          layout.map((item) => {
            const widget = widgets.find((w) => w.id === item.id);
            if (!widget) return null;
            return (
              <DraggableWidget
                key={item.id}
                widget={widget}
                layoutItem={item}
                colWidth={colWidth}
                isDeleting={deleteConfirmId === widget.id}
                onDelete={() => setDeleteConfirmId(widget.id)}
                onCancelDelete={() => setDeleteConfirmId(null)}
                onConfirmDelete={() => handleRemoveWidget(widget.id)}
                deletePending={removeWidget.isPending}
                onDragStart={handleDragStart}
                onResizeStart={handleResizeStart}
                isDragging={dragId === item.id}
                isResizing={resizeId === item.id}
              />
            );
          })}
      </div>

      {/* Add Widget Modal */}
      <AddWidgetModal
        open={showAddModal}
        dashboardId={dashboardId}
        onClose={() => setShowAddModal(false)}
      />
    </div>
  );
}
