"use client";

import { useState, useMemo } from "react";
import Link from "next/link";
import {
  MOCK_DASHBOARDS,
  MOCK_WIDGETS,
  Dashboard,
  DashboardWidget,
} from "@/lib/mock-features";
import {
  IconArrowLeft,
  IconGrid,
  IconPlus,
  IconTrash,
  IconX,
  IconCheck,
  IconChart,
  IconTable,
} from "@/components/v2/ui/Icons";
import { Toast } from "@/components/settings/Toast";
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

/* ── Constants ── */

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

type ChartType = "bar" | "line" | "area" | "pie";

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

const typeBadgeColors: Record<string, { bg: string; color: string }> = {
  chart: { bg: "var(--ci-accent-subtle)", color: "var(--ci-navy)" },
  table: { bg: "rgba(16, 185, 129, 0.1)", color: "#10b981" },
};

/* ── Chart Widget ── */

function WidgetChart({ widget }: { widget: DashboardWidget }) {
  const chartData = widget.data as {
    chartType: ChartType;
    data: { labels: string[]; datasets: { name: string; data: number[]; color?: string; colors?: string[] }[] };
  } | undefined;

  const [activeType, setActiveType] = useState<ChartType>(
    chartData?.chartType ?? "bar"
  );

  const rechartsData = useMemo(() => {
    if (!chartData?.data) return [];
    const { labels, datasets } = chartData.data;
    return labels.map((label, i) => {
      const entry: Record<string, string | number> = { label };
      datasets.forEach((ds) => {
        entry[ds.name] = ds.data[i] ?? 0;
      });
      return entry;
    });
  }, [chartData]);

  const pieData = useMemo(() => {
    if (!chartData?.data) return [];
    const { labels, datasets } = chartData.data;
    const ds = datasets[0];
    if (!ds) return [];
    return labels.map((label, i) => ({
      name: label,
      value: ds.data[i] ?? 0,
      color: ds.colors?.[i] || BRAND_COLORS[i % BRAND_COLORS.length],
    }));
  }, [chartData]);

  const datasets = chartData?.data?.datasets ?? [];

  if (!chartData?.data) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 160, color: "var(--ci-text-muted)", fontSize: 12 }}>
        No chart data available
      </div>
    );
  }

  const getColor = (ds: (typeof datasets)[0], index: number) =>
    ds.color || BRAND_COLORS[index % BRAND_COLORS.length];

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
            <Bar key={ds.name} dataKey={ds.name} fill={getColor(ds, i)} radius={[3, 3, 0, 0]} animationDuration={600} />
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
              <linearGradient key={ds.name} id={`ci-grad-${widget.id}-${i}`} x1="0" y1="0" x2="0" y2="1">
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
            fill={`url(#ci-grad-${widget.id}-${i})`}
            animationDuration={600}
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
      <Legend wrapperStyle={{ fontSize: 11, color: "var(--ci-text-secondary)" }} iconType="square" iconSize={8} />
    </PieChart>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      {/* Chart type selector */}
      <div style={{ display: "flex", gap: 4, marginBottom: 12, flexShrink: 0 }}>
        {chartTypeOptions.map((opt) => (
          <button
            key={opt.value}
            onClick={() => setActiveType(opt.value)}
            style={{
              padding: "4px 8px",
              borderRadius: 6,
              fontSize: 11,
              fontWeight: 500,
              border: activeType === opt.value ? "1px solid #3C4C73" : "1px solid var(--ci-border)",
              background: activeType === opt.value ? "#3C4C73" : "transparent",
              color: activeType === opt.value ? "#fff" : "var(--ci-text-secondary)",
              cursor: "pointer",
              transition: "all 0.15s",
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div style={{ flex: 1, minHeight: 200 }}>
        <ResponsiveContainer width="100%" height="100%">
          {activeType === "pie" ? renderPieChart() : renderCartesianChart()}
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/* ── Table Widget ── */

function WidgetTable({ widget }: { widget: DashboardWidget }) {
  const tableData = widget.data as {
    columns: string[];
    rows: Record<string, unknown>[];
  } | undefined;

  if (!tableData?.columns || tableData.columns.length === 0) {
    return (
      <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 160, color: "var(--ci-text-muted)", fontSize: 12 }}>
        No table data available
      </div>
    );
  }

  const { columns, rows } = tableData;
  const displayCols = columns.slice(0, 5);
  const displayRows = rows.slice(0, 8);

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse" }}>
        <thead>
          <tr>
            {displayCols.map((col) => (
              <th
                key={col}
                style={{
                  whiteSpace: "nowrap",
                  padding: "8px 12px",
                  textAlign: "left",
                  fontSize: 11,
                  fontWeight: 600,
                  textTransform: "uppercase",
                  letterSpacing: "0.05em",
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
            <tr key={ri}>
              {displayCols.map((col) => (
                <td
                  key={col}
                  style={{
                    whiteSpace: "nowrap",
                    padding: "6px 12px",
                    color: "var(--ci-text-secondary)",
                    borderBottom: "1px solid var(--ci-border)",
                    maxWidth: 180,
                    overflow: "hidden",
                    textOverflow: "ellipsis",
                    background: ri % 2 === 1 ? "var(--ci-bg-wash)" : "transparent",
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
        <div style={{ padding: "8px 12px", borderTop: "1px solid var(--ci-border)" }}>
          <p style={{ fontSize: 10, fontWeight: 500, color: "var(--ci-text-muted)", margin: 0 }}>
            Showing 8 of {rows.length} rows
          </p>
        </div>
      )}
    </div>
  );
}

/* ── Create Dashboard Modal ── */

function CreateDashboardModal({
  open,
  onClose,
  onCreate,
}: {
  open: boolean;
  onClose: () => void;
  onCreate: (title: string, description: string) => void;
}) {
  const [title, setTitle] = useState("");
  const [desc, setDesc] = useState("");
  const [creating, setCreating] = useState(false);

  if (!open) return null;

  const handleCreate = () => {
    if (!title.trim()) return;
    setCreating(true);
    setTimeout(() => {
      onCreate(title.trim(), desc.trim());
      setTitle("");
      setDesc("");
      setCreating(false);
    }, 600);
  };

  const handleClose = () => {
    setTitle("");
    setDesc("");
    setCreating(false);
    onClose();
  };

  return (
    <div
      style={{
        position: "fixed",
        inset: 0,
        zIndex: 50,
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        padding: 16,
        background: "rgba(0,0,0,0.5)",
        backdropFilter: "blur(4px)",
        animation: "ciModalFadeIn 0.2s ease-out",
      }}
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <style>{`
        @keyframes ciModalFadeIn { from { opacity: 0; } to { opacity: 1; } }
        @keyframes ciModalSlideIn { from { opacity: 0; transform: translateY(16px) scale(0.97); } to { opacity: 1; transform: translateY(0) scale(1); } }
      `}</style>
      <div
        style={{
          width: "100%",
          maxWidth: 420,
          background: "var(--ci-bg-surface)",
          border: "1px solid var(--ci-border)",
          borderRadius: 16,
          overflow: "hidden",
          boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
          animation: "ciModalSlideIn 0.25s ease-out",
        }}
      >
        <div style={{ height: 4, background: "linear-gradient(90deg, var(--ci-navy), #5A6B8A)" }} />
        <div style={{ padding: 24 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 12 }}>
              <div
                style={{
                  width: 40, height: 40, borderRadius: 12,
                  background: "linear-gradient(135deg, var(--ci-navy), #5A6B8A)",
                  display: "flex", alignItems: "center", justifyContent: "center",
                }}
              >
                <IconGrid className="h-5 w-5" style={{ color: "#fff" }} />
              </div>
              <div>
                <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--ci-text)", margin: 0 }}>
                  New Dashboard
                </h2>
                <p style={{ fontSize: 11, color: "var(--ci-text-muted)", margin: 0 }}>
                  Create a new analytics dashboard
                </p>
              </div>
            </div>
            <button
              onClick={handleClose}
              style={{
                width: 32, height: 32, borderRadius: 8, border: "none", background: "transparent",
                color: "var(--ci-text-muted)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <IconX className="h-4 w-4" />
            </button>
          </div>

          <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--ci-text-muted)", marginBottom: 6 }}>
            Dashboard Title
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Sales Overview"
            style={{
              width: "100%", padding: "10px 12px", borderRadius: 10,
              border: "1px solid var(--ci-border)", background: "var(--ci-bg)",
              color: "var(--ci-text)", fontSize: 13, outline: "none",
              boxSizing: "border-box",
            }}
          />

          <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--ci-text-muted)", marginTop: 14, marginBottom: 6 }}>
            Description
          </label>
          <textarea
            value={desc}
            onChange={(e) => setDesc(e.target.value)}
            placeholder="Brief description..."
            rows={3}
            style={{
              width: "100%", padding: "10px 12px", borderRadius: 10,
              border: "1px solid var(--ci-border)", background: "var(--ci-bg)",
              color: "var(--ci-text)", fontSize: 13, outline: "none", resize: "vertical",
              boxSizing: "border-box",
            }}
          />

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 20, paddingTop: 16, borderTop: "1px solid var(--ci-border)" }}>
            <button
              onClick={handleClose}
              style={{
                padding: "10px 16px", borderRadius: 12, border: "none",
                background: "transparent", color: "var(--ci-text-muted)",
                fontSize: 12, fontWeight: 600, cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleCreate}
              disabled={!title.trim() || creating}
              style={{
                padding: "10px 20px", borderRadius: 12, border: "none",
                background: "linear-gradient(135deg, var(--ci-navy), #5A6B8A)",
                color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer",
                opacity: !title.trim() || creating ? 0.5 : 1,
                transition: "opacity 0.15s",
              }}
            >
              {creating ? "Creating..." : "Create Dashboard"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Add Widget Modal ── */

function AddWidgetModal({
  open,
  onClose,
  onAdd,
}: {
  open: boolean;
  onClose: () => void;
  onAdd: (title: string, type: "chart" | "table") => void;
}) {
  const [title, setTitle] = useState("");
  const [type, setType] = useState<"chart" | "table">("chart");

  if (!open) return null;

  const handleAdd = () => {
    if (!title.trim()) return;
    onAdd(title.trim(), type);
    setTitle("");
    setType("chart");
  };

  const handleClose = () => {
    setTitle("");
    setType("chart");
    onClose();
  };

  return (
    <div
      style={{
        position: "fixed", inset: 0, zIndex: 50,
        display: "flex", alignItems: "center", justifyContent: "center", padding: 16,
        background: "rgba(0,0,0,0.5)", backdropFilter: "blur(4px)",
        animation: "ciModalFadeIn 0.2s ease-out",
      }}
      onClick={(e) => { if (e.target === e.currentTarget) handleClose(); }}
    >
      <div
        style={{
          width: "100%", maxWidth: 420,
          background: "var(--ci-bg-surface)", border: "1px solid var(--ci-border)",
          borderRadius: 16, overflow: "hidden",
          boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
          animation: "ciModalSlideIn 0.25s ease-out",
        }}
      >
        <div style={{ height: 4, background: "linear-gradient(90deg, var(--ci-navy), #5A6B8A)" }} />
        <div style={{ padding: 24 }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 20 }}>
            <h2 style={{ fontSize: 16, fontWeight: 700, color: "var(--ci-text)", margin: 0 }}>
              Add Widget
            </h2>
            <button
              onClick={handleClose}
              style={{
                width: 32, height: 32, borderRadius: 8, border: "none", background: "transparent",
                color: "var(--ci-text-muted)", cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
              }}
            >
              <IconX className="h-4 w-4" />
            </button>
          </div>

          <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--ci-text-muted)", marginBottom: 6 }}>
            Widget Title
          </label>
          <input
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="e.g. Revenue by Month"
            style={{
              width: "100%", padding: "10px 12px", borderRadius: 10,
              border: "1px solid var(--ci-border)", background: "var(--ci-bg)",
              color: "var(--ci-text)", fontSize: 13, outline: "none",
              boxSizing: "border-box",
            }}
          />

          <label style={{ display: "block", fontSize: 12, fontWeight: 600, color: "var(--ci-text-muted)", marginTop: 14, marginBottom: 6 }}>
            Widget Type
          </label>
          <div style={{ display: "flex", gap: 10 }}>
            {(["chart", "table"] as const).map((t) => (
              <button
                key={t}
                onClick={() => setType(t)}
                style={{
                  flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8,
                  padding: "12px 16px", borderRadius: 12, cursor: "pointer",
                  border: type === t ? "2px solid var(--ci-navy)" : "1px solid var(--ci-border)",
                  background: type === t ? "var(--ci-accent-subtle)" : "transparent",
                  color: type === t ? "var(--ci-navy)" : "var(--ci-text-secondary)",
                  fontSize: 13, fontWeight: type === t ? 600 : 400,
                  transition: "all 0.15s",
                }}
              >
                {t === "chart" ? <IconChart className="h-4 w-4" /> : <IconTable className="h-4 w-4" />}
                {t === "chart" ? "Chart" : "Table"}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 12, marginTop: 20, paddingTop: 16, borderTop: "1px solid var(--ci-border)" }}>
            <button
              onClick={handleClose}
              style={{
                padding: "10px 16px", borderRadius: 12, border: "none",
                background: "transparent", color: "var(--ci-text-muted)",
                fontSize: 12, fontWeight: 600, cursor: "pointer",
              }}
            >
              Cancel
            </button>
            <button
              onClick={handleAdd}
              disabled={!title.trim()}
              style={{
                padding: "10px 20px", borderRadius: 12, border: "none",
                background: "linear-gradient(135deg, var(--ci-navy), #5A6B8A)",
                color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer",
                opacity: !title.trim() ? 0.5 : 1,
              }}
            >
              Add Widget
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Main Page ── */

export default function DashboardsPage() {
  const [dashboards, setDashboards] = useState(MOCK_DASHBOARDS);
  const [widgetList, setWidgetList] = useState(MOCK_WIDGETS);
  const [selectedDashboard, setSelectedDashboard] = useState<Dashboard | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAddWidget, setShowAddWidget] = useState(false);
  const [deletingDashId, setDeletingDashId] = useState<string | null>(null);
  const [deletingWidgetId, setDeletingWidgetId] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; title: string; message: string } | null>(null);

  const widgets = selectedDashboard
    ? widgetList.filter((w) => w.dashboardId === selectedDashboard.id)
    : [];

  const handleCreateDashboard = (title: string, description: string) => {
    const newDash: Dashboard = {
      id: `dash-${Date.now()}`,
      title,
      description: description || "New dashboard",
      widgetCount: 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };
    setDashboards((prev) => [...prev, newDash]);
    setShowCreateModal(false);
    setToast({ type: "success", title: "Dashboard Created", message: `"${title}" has been created.` });
  };

  const handleDeleteDashboard = (id: string) => {
    const dash = dashboards.find((d) => d.id === id);
    setDashboards((prev) => prev.filter((d) => d.id !== id));
    setWidgetList((prev) => prev.filter((w) => w.dashboardId !== id));
    setDeletingDashId(null);
    setToast({ type: "success", title: "Dashboard Deleted", message: `"${dash?.title}" has been removed.` });
  };

  const handleAddWidget = (title: string, type: "chart" | "table") => {
    if (!selectedDashboard) return;
    const sampleChartData = {
      chartType: "bar" as ChartType,
      data: {
        labels: ["Mon", "Tue", "Wed", "Thu", "Fri"],
        datasets: [{ name: "Value", data: [Math.round(Math.random() * 100), Math.round(Math.random() * 100), Math.round(Math.random() * 100), Math.round(Math.random() * 100), Math.round(Math.random() * 100)], color: "#3C4C73" }],
      },
    };
    const sampleTableData = {
      columns: ["Name", "Value", "Status"],
      rows: [
        { Name: "Item A", Value: Math.round(Math.random() * 1000), Status: "Active" },
        { Name: "Item B", Value: Math.round(Math.random() * 1000), Status: "Active" },
        { Name: "Item C", Value: Math.round(Math.random() * 1000), Status: "Inactive" },
      ],
    };
    const newWidget: DashboardWidget = {
      id: `w-${Date.now()}`,
      dashboardId: selectedDashboard.id,
      title,
      type,
      width: 6,
      height: 4,
      data: type === "chart" ? sampleChartData : sampleTableData,
    };
    setWidgetList((prev) => [...prev, newWidget]);
    setShowAddWidget(false);
    setToast({ type: "success", title: "Widget Added", message: `"${title}" has been added.` });
  };

  const handleDeleteWidget = (id: string) => {
    const w = widgetList.find((w) => w.id === id);
    setWidgetList((prev) => prev.filter((w) => w.id !== id));
    setDeletingWidgetId(null);
    setToast({ type: "success", title: "Widget Removed", message: `"${w?.title}" has been removed.` });
  };

  return (
    <div
      className="ci-fade-in"
      style={{
        minHeight: "100vh",
        background: "var(--ci-bg)",
        display: "flex",
        flexDirection: "column",
      }}
    >
      {/* Header */}
      <header
        style={{
          padding: "16px 24px",
          borderBottom: "1px solid var(--ci-border)",
          background: "var(--ci-bg-surface)",
          display: "flex",
          alignItems: "center",
          gap: 12,
        }}
      >
        <Link
          href="/chat"
          style={{
            display: "flex", alignItems: "center", gap: 6,
            color: "var(--ci-text-secondary)", textDecoration: "none",
            fontSize: 14, borderRadius: 6, padding: "6px 10px", transition: "background 0.15s",
          }}
          onMouseEnter={(e) => (e.currentTarget.style.background = "var(--ci-bg-hover)")}
          onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}
        >
          <IconArrowLeft className="h-4 w-4" />
          Back
        </Link>
        <div style={{ width: 1, height: 20, background: "var(--ci-border)" }} />
        <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
          <IconGrid className="h-5 w-5" style={{ color: "var(--ci-navy)" }} />
          <h1 style={{ fontSize: 18, fontWeight: 600, color: "var(--ci-text)", margin: 0 }}>
            {selectedDashboard ? selectedDashboard.title : "Dashboards"}
          </h1>
        </div>

        <div style={{ marginLeft: "auto", display: "flex", alignItems: "center", gap: 8 }}>
          {selectedDashboard && (
            <>
              <button
                onClick={() => setShowAddWidget(true)}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "8px 16px", border: "none", borderRadius: 8,
                  background: "linear-gradient(135deg, var(--ci-navy), #5A6B8A)",
                  color: "#fff", fontSize: 13, fontWeight: 500, cursor: "pointer",
                }}
              >
                <IconPlus className="h-4 w-4" />
                Add Widget
              </button>
              <button
                onClick={() => setSelectedDashboard(null)}
                style={{
                  display: "flex", alignItems: "center", gap: 6,
                  padding: "6px 12px", border: "1px solid var(--ci-border)", borderRadius: 6,
                  background: "var(--ci-bg-surface)", color: "var(--ci-text-secondary)",
                  fontSize: 13, cursor: "pointer", transition: "background 0.15s",
                }}
                onMouseEnter={(e) => (e.currentTarget.style.background = "var(--ci-bg-hover)")}
                onMouseLeave={(e) => (e.currentTarget.style.background = "var(--ci-bg-surface)")}
              >
                <IconArrowLeft className="h-3.5 w-3.5" />
                All Dashboards
              </button>
            </>
          )}

          {!selectedDashboard && (
            <button
              onClick={() => setShowCreateModal(true)}
              style={{
                display: "flex", alignItems: "center", gap: 6,
                padding: "8px 16px", border: "none", borderRadius: 8,
                background: "linear-gradient(135deg, var(--ci-navy), #5A6B8A)",
                color: "#fff", fontSize: 13, fontWeight: 500, cursor: "pointer",
              }}
            >
              <IconPlus className="h-4 w-4" />
              New Dashboard
            </button>
          )}
        </div>
      </header>

      {/* Content */}
      <div style={{ flex: 1, padding: 24, maxWidth: 1200, margin: "0 auto", width: "100%" }}>
        {!selectedDashboard ? (
          /* ── Dashboard List ── */
          <div
            style={{
              display: "grid",
              gridTemplateColumns: "repeat(auto-fill, minmax(320px, 1fr))",
              gap: 16,
            }}
          >
            {dashboards.map((dash, i) => (
              <div
                key={dash.id}
                className="ci-fade-up"
                style={{
                  animationDelay: `${i * 0.06}s`,
                  background: "var(--ci-bg-surface)",
                  border: "1px solid var(--ci-border)",
                  borderRadius: 12,
                  padding: 20,
                  boxShadow: "var(--ci-shadow-sm)",
                  transition: "border-color 0.15s, box-shadow 0.15s, transform 0.15s",
                  position: "relative",
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.borderColor = "var(--ci-navy)";
                  e.currentTarget.style.transform = "translateY(-1px)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.borderColor = "var(--ci-border)";
                  e.currentTarget.style.transform = "translateY(0)";
                }}
              >
                {/* Delete confirmation overlay */}
                {deletingDashId === dash.id && (
                  <div
                    style={{
                      position: "absolute", inset: 0, zIndex: 10,
                      background: "rgba(255,255,255,0.95)", borderRadius: 12,
                      display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                      gap: 12, padding: 20,
                    }}
                  >
                    <p style={{ fontSize: 13, fontWeight: 600, color: "var(--ci-text)", textAlign: "center", margin: 0 }}>
                      Delete &quot;{dash.title}&quot;?
                    </p>
                    <div style={{ display: "flex", gap: 8 }}>
                      <button
                        onClick={() => setDeletingDashId(null)}
                        style={{
                          padding: "6px 14px", borderRadius: 8, border: "1px solid var(--ci-border)",
                          background: "transparent", color: "var(--ci-text-secondary)", fontSize: 12, cursor: "pointer",
                        }}
                      >
                        Cancel
                      </button>
                      <button
                        onClick={() => handleDeleteDashboard(dash.id)}
                        style={{
                          padding: "6px 14px", borderRadius: 8, border: "none",
                          background: "#EF4444", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer",
                        }}
                      >
                        Delete
                      </button>
                    </div>
                  </div>
                )}

                <div
                  style={{ cursor: "pointer" }}
                  onClick={() => setSelectedDashboard(dash)}
                >
                  <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 10 }}>
                    <div
                      style={{
                        width: 36, height: 36, borderRadius: 8,
                        background: "var(--ci-accent-subtle)",
                        display: "flex", alignItems: "center", justifyContent: "center",
                        color: "var(--ci-navy)",
                      }}
                    >
                      <IconGrid className="h-5 w-5" />
                    </div>
                    <h3 style={{ fontSize: 15, fontWeight: 600, color: "var(--ci-text)", margin: 0, flex: 1 }}>
                      {dash.title}
                    </h3>
                  </div>

                  <p style={{ fontSize: 13, color: "var(--ci-text-secondary)", margin: "0 0 14px", lineHeight: 1.5 }}>
                    {dash.description}
                  </p>
                </div>

                <div style={{ display: "flex", alignItems: "center", gap: 12, fontSize: 12 }}>
                  <span
                    style={{
                      padding: "2px 8px", borderRadius: 10,
                      background: "var(--ci-accent-subtle)", color: "var(--ci-navy)",
                      fontWeight: 500, fontSize: 11,
                    }}
                  >
                    {widgetList.filter((w) => w.dashboardId === dash.id).length} widgets
                  </span>
                  <span style={{ color: "var(--ci-text-muted)" }}>
                    Updated {formatDate(dash.updatedAt)}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      setDeletingDashId(dash.id);
                    }}
                    style={{
                      marginLeft: "auto", padding: 4, borderRadius: 6,
                      border: "none", background: "transparent",
                      color: "var(--ci-text-muted)", cursor: "pointer",
                      display: "flex", alignItems: "center", justifyContent: "center",
                      transition: "color 0.15s",
                    }}
                    onMouseEnter={(e) => (e.currentTarget.style.color = "#EF4444")}
                    onMouseLeave={(e) => (e.currentTarget.style.color = "var(--ci-text-muted)")}
                  >
                    <IconTrash className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          /* ── Dashboard Detail with Widgets ── */
          <div className="ci-fade-up">
            <div style={{ marginBottom: 20 }}>
              <p style={{ fontSize: 13, color: "var(--ci-text-secondary)", margin: 0 }}>
                {selectedDashboard.description}
              </p>
            </div>

            {widgets.length === 0 ? (
              <div
                style={{
                  background: "var(--ci-bg-surface)", borderRadius: 12,
                  border: "2px dashed var(--ci-border)", padding: 48, textAlign: "center",
                }}
              >
                <IconGrid className="h-10 w-10" style={{ color: "var(--ci-text-muted)", margin: "0 auto 12px" }} />
                <p style={{ fontSize: 14, fontWeight: 600, color: "var(--ci-text)", margin: 0 }}>
                  No widgets yet
                </p>
                <p style={{ fontSize: 12, color: "var(--ci-text-muted)", marginTop: 4 }}>
                  Add widgets to start building your dashboard.
                </p>
                <button
                  onClick={() => setShowAddWidget(true)}
                  style={{
                    marginTop: 16, display: "inline-flex", alignItems: "center", gap: 6,
                    padding: "8px 16px", borderRadius: 10, border: "none",
                    background: "linear-gradient(135deg, var(--ci-navy), #5A6B8A)",
                    color: "#fff", fontSize: 13, fontWeight: 500, cursor: "pointer",
                  }}
                >
                  <IconPlus className="h-4 w-4" />
                  Add Widget
                </button>
              </div>
            ) : (
              <div
                style={{
                  display: "grid",
                  gridTemplateColumns: "repeat(2, 1fr)",
                  gap: 16,
                }}
              >
                {widgets.map((widget, i) => (
                  <div
                    key={widget.id}
                    className="ci-fade-up"
                    style={{
                      animationDelay: `${i * 0.06}s`,
                      background: "var(--ci-bg-surface)",
                      border: "1px solid var(--ci-border)",
                      borderRadius: 12,
                      padding: 20,
                      boxShadow: "0 1px 3px rgba(0,0,0,0.04)",
                      transition: "border-color 0.15s, box-shadow 0.15s",
                      gridColumn: widget.width > 6 ? "1 / -1" : undefined,
                      position: "relative",
                    }}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = "var(--ci-navy)";
                      e.currentTarget.style.boxShadow = "0 4px 16px rgba(0,0,0,0.08)";
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = "var(--ci-border)";
                      e.currentTarget.style.boxShadow = "0 1px 3px rgba(0,0,0,0.04)";
                    }}
                  >
                    {/* Delete confirmation */}
                    {deletingWidgetId === widget.id && (
                      <div
                        style={{
                          position: "absolute", inset: 0, zIndex: 10,
                          background: "rgba(255,255,255,0.95)", borderRadius: 12,
                          display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center",
                          gap: 12, padding: 20,
                        }}
                      >
                        <p style={{ fontSize: 13, fontWeight: 600, color: "var(--ci-text)", margin: 0 }}>
                          Remove &quot;{widget.title}&quot;?
                        </p>
                        <div style={{ display: "flex", gap: 8 }}>
                          <button
                            onClick={() => setDeletingWidgetId(null)}
                            style={{
                              padding: "6px 14px", borderRadius: 8, border: "1px solid var(--ci-border)",
                              background: "transparent", color: "var(--ci-text-secondary)", fontSize: 12, cursor: "pointer",
                            }}
                          >
                            Cancel
                          </button>
                          <button
                            onClick={() => handleDeleteWidget(widget.id)}
                            style={{
                              padding: "6px 14px", borderRadius: 8, border: "none",
                              background: "#EF4444", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer",
                            }}
                          >
                            Remove
                          </button>
                        </div>
                      </div>
                    )}

                    {/* Widget Header */}
                    <div style={{ display: "flex", alignItems: "flex-start", justifyContent: "space-between", marginBottom: 14 }}>
                      <h4 style={{ fontSize: 14, fontWeight: 600, color: "var(--ci-text)", margin: 0 }}>
                        {widget.title}
                      </h4>
                      <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                        <span
                          style={{
                            fontSize: 11, fontWeight: 500, padding: "2px 8px", borderRadius: 10,
                            background: typeBadgeColors[widget.type]?.bg ?? "var(--ci-bg-wash)",
                            color: typeBadgeColors[widget.type]?.color ?? "var(--ci-text-secondary)",
                            textTransform: "capitalize", whiteSpace: "nowrap",
                          }}
                        >
                          {widget.type}
                        </span>
                        <button
                          onClick={() => setDeletingWidgetId(widget.id)}
                          style={{
                            padding: 4, borderRadius: 6, border: "none",
                            background: "transparent", color: "var(--ci-text-muted)",
                            cursor: "pointer", display: "flex", alignItems: "center", justifyContent: "center",
                            transition: "color 0.15s",
                          }}
                          onMouseEnter={(e) => (e.currentTarget.style.color = "#EF4444")}
                          onMouseLeave={(e) => (e.currentTarget.style.color = "var(--ci-text-muted)")}
                        >
                          <IconTrash className="h-3 w-3" />
                        </button>
                      </div>
                    </div>

                    {/* Widget Content */}
                    {widget.type === "chart" && <WidgetChart widget={widget} />}
                    {widget.type === "table" && <WidgetTable widget={widget} />}
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Modals */}
      <CreateDashboardModal
        open={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        onCreate={handleCreateDashboard}
      />
      <AddWidgetModal
        open={showAddWidget}
        onClose={() => setShowAddWidget(false)}
        onAdd={handleAddWidget}
      />

      {/* Toast */}
      <Toast
        open={!!toast}
        type={toast?.type || "success"}
        title={toast?.title || ""}
        message={toast?.message || ""}
        onClose={() => setToast(null)}
      />
    </div>
  );
}
