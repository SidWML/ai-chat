"use client";

import { useState, useMemo } from "react";
import { useRouter } from "next/navigation";
import {
  MOCK_DASHBOARDS,
  MOCK_WIDGETS,
  Dashboard,
  DashboardWidget,
} from "@/lib/mock-features";
import { V3Sidebar } from "@/components/v3/V3Sidebar";
import {
  IconArrowLeft,
  IconGrid,
  IconPlus,
  IconTrash,
  IconX,
  IconCheck,
  IconChart,
  IconTable,
  IconPanelLeft,
  IconSparkles,
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

/* ── Constants ── */

type ChartType = "bar" | "line" | "area" | "pie";

const BRAND_COLORS = [
  "#6366F1", "#F472B6", "#34D399", "#FBBF24",
  "#818CF8", "#F87171", "#22D3EE", "#A78BFA",
];

const TOOLTIP_STYLE = {
  fontSize: 12,
  background: "rgba(18, 20, 29, 0.95)",
  border: "1px solid rgba(255,255,255,0.08)",
  borderRadius: 10,
  boxShadow: "0 8px 24px rgba(0,0,0,0.4)",
  color: "#E8E9ED",
  backdropFilter: "blur(12px)",
};

/* ── Chart Widget ── */

function WidgetChart({ widget }: { widget: DashboardWidget }) {
  const chartData = widget.data as {
    chartType: ChartType;
    data: { labels: string[]; datasets: { name: string; data: number[]; color?: string; colors?: string[] }[] };
  } | undefined;

  const [activeType, setActiveType] = useState<ChartType>(chartData?.chartType ?? "bar");

  const rechartsData = useMemo(() => {
    if (!chartData?.data) return [];
    return chartData.data.labels.map((label, i) => {
      const entry: Record<string, string | number> = { label };
      chartData.data.datasets.forEach((ds) => { entry[ds.name] = ds.data[i] ?? 0; });
      return entry;
    });
  }, [chartData]);

  const pieData = useMemo(() => {
    if (!chartData?.data) return [];
    const ds = chartData.data.datasets[0];
    if (!ds) return [];
    return chartData.data.labels.map((label, i) => ({
      name: label,
      value: ds.data[i] ?? 0,
      color: ds.colors?.[i] || BRAND_COLORS[i % BRAND_COLORS.length],
    }));
  }, [chartData]);

  const datasets = chartData?.data?.datasets ?? [];
  if (!chartData?.data) return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 180, color: "var(--v3-text-muted)", fontSize: 12 }}>No data</div>;

  const getColor = (ds: (typeof datasets)[0], idx: number) => ds.color || BRAND_COLORS[idx % BRAND_COLORS.length];

  const chartTypes: { value: ChartType; label: string }[] = [
    { value: "bar", label: "Bar" },
    { value: "line", label: "Line" },
    { value: "area", label: "Area" },
    { value: "pie", label: "Pie" },
  ];

  const renderCartesian = () => {
    const props = { data: rechartsData, margin: { top: 8, right: 16, left: -8, bottom: 0 } };
    const shared = (
      <>
        <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.04)" vertical={false} />
        <XAxis dataKey="label" tick={{ fontSize: 10, fill: "var(--v3-text-muted)" }} axisLine={{ stroke: "rgba(255,255,255,0.06)" }} tickLine={false} />
        <YAxis tick={{ fontSize: 10, fill: "var(--v3-text-muted)" }} axisLine={false} tickLine={false} />
        <Tooltip contentStyle={TOOLTIP_STYLE} labelStyle={{ color: "var(--v3-text-secondary)", fontWeight: 500 }} cursor={{ fill: "rgba(255,255,255,0.03)" }} />
        <Legend wrapperStyle={{ fontSize: 10, color: "var(--v3-text-secondary)" }} iconType="circle" iconSize={6} />
      </>
    );

    if (activeType === "bar") return <BarChart {...props}>{shared}{datasets.map((ds, i) => <Bar key={ds.name} dataKey={ds.name} fill={getColor(ds, i)} radius={[4, 4, 0, 0]} animationDuration={700} />)}</BarChart>;
    if (activeType === "line") return <LineChart {...props}>{shared}{datasets.map((ds, i) => <Line key={ds.name} type="monotone" dataKey={ds.name} stroke={getColor(ds, i)} strokeWidth={2} dot={{ r: 3, fill: "var(--v3-bg-surface)", strokeWidth: 2 }} activeDot={{ r: 5, fill: getColor(ds, i) }} animationDuration={700} />)}</LineChart>;
    return (
      <AreaChart {...props}>
        <defs>{datasets.map((ds, i) => {
          const c = getColor(ds, i);
          return <linearGradient key={ds.name} id={`v3g-${widget.id}-${i}`} x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={c} stopOpacity={0.25} /><stop offset="100%" stopColor={c} stopOpacity={0.02} /></linearGradient>;
        })}</defs>
        {shared}
        {datasets.map((ds, i) => <Area key={ds.name} type="monotone" dataKey={ds.name} stroke={getColor(ds, i)} strokeWidth={2} fill={`url(#v3g-${widget.id}-${i})`} animationDuration={700} />)}
      </AreaChart>
    );
  };

  const renderPie = () => (
    <PieChart>
      <Pie data={pieData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius="75%" innerRadius="40%" paddingAngle={2} animationDuration={700}>
        {pieData.map((e, i) => <Cell key={i} fill={e.color} />)}
      </Pie>
      <Tooltip contentStyle={TOOLTIP_STYLE} />
      <Legend wrapperStyle={{ fontSize: 10, color: "var(--v3-text-secondary)" }} iconType="circle" iconSize={6} />
    </PieChart>
  );

  return (
    <div style={{ display: "flex", flexDirection: "column", height: "100%" }}>
      <div style={{ display: "flex", gap: 3, marginBottom: 12, flexShrink: 0 }}>
        {chartTypes.map((t) => (
          <button
            key={t.value}
            onClick={() => setActiveType(t.value)}
            style={{
              padding: "3px 8px", borderRadius: 6, fontSize: 10, fontWeight: 500,
              border: "none", cursor: "pointer", transition: "all 0.12s",
              background: activeType === t.value ? "var(--v3-accent)" : "transparent",
              color: activeType === t.value ? "#fff" : "var(--v3-text-muted)",
            }}
          >
            {t.label}
          </button>
        ))}
      </div>
      <div style={{ flex: 1, minHeight: 200 }}>
        <ResponsiveContainer width="100%" height="100%">
          {activeType === "pie" ? renderPie() : renderCartesian()}
        </ResponsiveContainer>
      </div>
    </div>
  );
}

/* ── Table Widget ── */

function WidgetTable({ widget }: { widget: DashboardWidget }) {
  const d = widget.data as { columns: string[]; rows: Record<string, unknown>[] } | undefined;
  if (!d?.columns?.length) return <div style={{ display: "flex", alignItems: "center", justifyContent: "center", height: 180, color: "var(--v3-text-muted)", fontSize: 12 }}>No data</div>;

  const cols = d.columns.slice(0, 5);
  const rows = d.rows.slice(0, 8);

  return (
    <div style={{ overflowX: "auto" }}>
      <table style={{ width: "100%", fontSize: 12, borderCollapse: "collapse" }}>
        <thead>
          <tr>
            {cols.map((c) => (
              <th key={c} style={{ whiteSpace: "nowrap", padding: "8px 12px", textAlign: "left", fontSize: 10, fontWeight: 600, textTransform: "uppercase", letterSpacing: "0.08em", color: "var(--v3-text-muted)", borderBottom: "1px solid var(--v3-border)" }}>
                {c}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, ri) => (
            <tr key={ri} style={{ transition: "background 0.1s" }} onMouseEnter={(e) => (e.currentTarget.style.background = "var(--v3-bg-hover)")} onMouseLeave={(e) => (e.currentTarget.style.background = "transparent")}>
              {cols.map((c) => (
                <td key={c} style={{ whiteSpace: "nowrap", padding: "7px 12px", color: "var(--v3-text-secondary)", borderBottom: "1px solid var(--v3-border-subtle)", maxWidth: 180, overflow: "hidden", textOverflow: "ellipsis" }}>
                  {row[c] != null ? String(row[c]) : "\u2014"}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

/* ── Create Dashboard Modal ── */

function CreateModal({ open, onClose, onCreate }: { open: boolean; onClose: () => void; onCreate: (t: string, d: string) => void }) {
  const [t, setT] = useState("");
  const [d, setD] = useState("");
  const [loading, setLoading] = useState(false);
  if (!open) return null;

  const submit = () => {
    if (!t.trim()) return;
    setLoading(true);
    setTimeout(() => { onCreate(t.trim(), d.trim()); setT(""); setD(""); setLoading(false); }, 600);
  };

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 60, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)", animation: "v3-fade-in 0.15s ease-out" }}
      onClick={(e) => { if (e.target === e.currentTarget) { setT(""); setD(""); onClose(); } }}
    >
      <div className="v3-scale-in" style={{ width: "100%", maxWidth: 420, background: "var(--v3-bg-elevated)", border: "1px solid var(--v3-border)", borderRadius: 20, overflow: "hidden", boxShadow: "var(--v3-shadow-xl)" }}>
        <div style={{ height: 3, background: "var(--v3-gradient)" }} />
        <div style={{ padding: 24 }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: "var(--v3-text)", margin: "0 0 20px" }}>New Dashboard</h2>

          <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "var(--v3-text-muted)", marginBottom: 6 }}>Title</label>
          <input value={t} onChange={(e) => setT(e.target.value)} placeholder="e.g. Sales Overview" style={{ width: "100%", padding: "10px 14px", borderRadius: 12, border: "1px solid var(--v3-border)", background: "var(--v3-bg-input)", color: "var(--v3-text)", fontSize: 13, outline: "none", boxSizing: "border-box" }} />

          <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "var(--v3-text-muted)", marginTop: 14, marginBottom: 6 }}>Description</label>
          <textarea value={d} onChange={(e) => setD(e.target.value)} placeholder="Brief description..." rows={2} style={{ width: "100%", padding: "10px 14px", borderRadius: 12, border: "1px solid var(--v3-border)", background: "var(--v3-bg-input)", color: "var(--v3-text)", fontSize: 13, outline: "none", resize: "vertical", boxSizing: "border-box" }} />

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20, paddingTop: 16, borderTop: "1px solid var(--v3-border)" }}>
            <button onClick={() => { setT(""); setD(""); onClose(); }} style={{ padding: "9px 16px", borderRadius: 12, border: "none", background: "transparent", color: "var(--v3-text-muted)", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Cancel</button>
            <button onClick={submit} disabled={!t.trim() || loading} style={{ padding: "9px 20px", borderRadius: 12, border: "none", background: "var(--v3-accent)", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer", opacity: !t.trim() || loading ? 0.5 : 1 }}>
              {loading ? "Creating..." : "Create"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Add Widget Modal ── */

function AddWidgetModal({ open, onClose, onAdd }: { open: boolean; onClose: () => void; onAdd: (t: string, ty: "chart" | "table") => void }) {
  const [t, setT] = useState("");
  const [ty, setTy] = useState<"chart" | "table">("chart");
  if (!open) return null;

  return (
    <div
      style={{ position: "fixed", inset: 0, zIndex: 60, display: "flex", alignItems: "center", justifyContent: "center", padding: 16, background: "rgba(0,0,0,0.7)", backdropFilter: "blur(8px)", animation: "v3-fade-in 0.15s ease-out" }}
      onClick={(e) => { if (e.target === e.currentTarget) { setT(""); onClose(); } }}
    >
      <div className="v3-scale-in" style={{ width: "100%", maxWidth: 420, background: "var(--v3-bg-elevated)", border: "1px solid var(--v3-border)", borderRadius: 20, overflow: "hidden", boxShadow: "var(--v3-shadow-xl)" }}>
        <div style={{ height: 3, background: "var(--v3-gradient)" }} />
        <div style={{ padding: 24 }}>
          <h2 style={{ fontSize: 17, fontWeight: 700, color: "var(--v3-text)", margin: "0 0 20px" }}>Add Widget</h2>

          <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "var(--v3-text-muted)", marginBottom: 6 }}>Title</label>
          <input value={t} onChange={(e) => setT(e.target.value)} placeholder="e.g. Revenue Chart" style={{ width: "100%", padding: "10px 14px", borderRadius: 12, border: "1px solid var(--v3-border)", background: "var(--v3-bg-input)", color: "var(--v3-text)", fontSize: 13, outline: "none", boxSizing: "border-box" }} />

          <label style={{ display: "block", fontSize: 11, fontWeight: 600, color: "var(--v3-text-muted)", marginTop: 14, marginBottom: 6 }}>Type</label>
          <div style={{ display: "flex", gap: 10 }}>
            {(["chart", "table"] as const).map((v) => (
              <button key={v} onClick={() => setTy(v)} style={{ flex: 1, display: "flex", alignItems: "center", justifyContent: "center", gap: 8, padding: "12px 16px", borderRadius: 12, border: ty === v ? "2px solid var(--v3-accent)" : "1px solid var(--v3-border)", background: ty === v ? "var(--v3-accent-subtle)" : "transparent", color: ty === v ? "var(--v3-text)" : "var(--v3-text-muted)", fontSize: 13, fontWeight: ty === v ? 600 : 400, cursor: "pointer", transition: "all 0.15s" }}>
                {v === "chart" ? <IconChart className="h-4 w-4" /> : <IconTable className="h-4 w-4" />}
                {v === "chart" ? "Chart" : "Table"}
              </button>
            ))}
          </div>

          <div style={{ display: "flex", justifyContent: "flex-end", gap: 10, marginTop: 20, paddingTop: 16, borderTop: "1px solid var(--v3-border)" }}>
            <button onClick={() => { setT(""); onClose(); }} style={{ padding: "9px 16px", borderRadius: 12, border: "none", background: "transparent", color: "var(--v3-text-muted)", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Cancel</button>
            <button onClick={() => { if (t.trim()) { onAdd(t.trim(), ty); setT(""); } }} disabled={!t.trim()} style={{ padding: "9px 20px", borderRadius: 12, border: "none", background: "var(--v3-accent)", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer", opacity: !t.trim() ? 0.5 : 1 }}>Add</button>
          </div>
        </div>
      </div>
    </div>
  );
}

/* ── Toast ── */

function V3Toast({ open, type, title, message, onClose }: { open: boolean; type: "success" | "error"; title: string; message: string; onClose: () => void }) {
  if (!open) return null;
  return (
    <div
      className="v3-slide-up"
      style={{
        position: "fixed", bottom: 24, right: 24, zIndex: 70,
        display: "flex", alignItems: "center", gap: 12,
        padding: "14px 18px", borderRadius: 14,
        background: "var(--v3-bg-elevated)",
        border: `1px solid ${type === "success" ? "rgba(52, 211, 153, 0.2)" : "rgba(248, 113, 113, 0.2)"}`,
        boxShadow: "var(--v3-shadow-lg)",
        color: "var(--v3-text)",
      }}
    >
      <div style={{ width: 8, height: 8, borderRadius: "50%", background: type === "success" ? "var(--v3-success)" : "var(--v3-error)", flexShrink: 0 }} />
      <div>
        <p style={{ fontSize: 13, fontWeight: 600, margin: 0 }}>{title}</p>
        <p style={{ fontSize: 11, color: "var(--v3-text-secondary)", margin: "2px 0 0" }}>{message}</p>
      </div>
      <button onClick={onClose} style={{ marginLeft: 8, padding: 4, borderRadius: 6, border: "none", background: "transparent", color: "var(--v3-text-muted)", cursor: "pointer", display: "flex" }}>
        <IconX className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

/* ── Main Page ── */

export default function V3DashboardsPage() {
  const router = useRouter();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [dashboards, setDashboards] = useState(MOCK_DASHBOARDS);
  const [widgetList, setWidgetList] = useState(MOCK_WIDGETS);
  const [selected, setSelected] = useState<Dashboard | null>(null);
  const [showCreate, setShowCreate] = useState(false);
  const [showAddWidget, setShowAddWidget] = useState(false);
  const [deletingDash, setDeletingDash] = useState<string | null>(null);
  const [deletingWidget, setDeletingWidget] = useState<string | null>(null);
  const [toast, setToast] = useState<{ type: "success" | "error"; title: string; message: string } | null>(null);

  const widgets = selected ? widgetList.filter((w) => w.dashboardId === selected.id) : [];

  const showToast = (type: "success" | "error", title: string, message: string) => {
    setToast({ type, title, message });
    setTimeout(() => setToast(null), 4000);
  };

  const handleCreate = (title: string, desc: string) => {
    setDashboards((p) => [...p, { id: `d-${Date.now()}`, title, description: desc || "New dashboard", widgetCount: 0, createdAt: new Date().toISOString(), updatedAt: new Date().toISOString() }]);
    setShowCreate(false);
    showToast("success", "Created", `"${title}" is ready.`);
  };

  const handleDeleteDash = (id: string) => {
    const d = dashboards.find((x) => x.id === id);
    setDashboards((p) => p.filter((x) => x.id !== id));
    setWidgetList((p) => p.filter((w) => w.dashboardId !== id));
    setDeletingDash(null);
    showToast("success", "Deleted", `"${d?.title}" removed.`);
  };

  const handleAddWidget = (title: string, type: "chart" | "table") => {
    if (!selected) return;
    const data = type === "chart"
      ? { chartType: "bar" as ChartType, data: { labels: ["Mon", "Tue", "Wed", "Thu", "Fri"], datasets: [{ name: "Value", data: [Math.round(Math.random() * 100), Math.round(Math.random() * 100), Math.round(Math.random() * 100), Math.round(Math.random() * 100), Math.round(Math.random() * 100)], color: "#6366F1" }] } }
      : { columns: ["Name", "Value", "Status"], rows: [{ Name: "A", Value: Math.round(Math.random() * 1000), Status: "Active" }, { Name: "B", Value: Math.round(Math.random() * 1000), Status: "Active" }, { Name: "C", Value: Math.round(Math.random() * 1000), Status: "Pending" }] };
    setWidgetList((p) => [...p, { id: `w-${Date.now()}`, dashboardId: selected.id, title, type, width: 6, height: 4, data }]);
    setShowAddWidget(false);
    showToast("success", "Added", `"${title}" widget added.`);
  };

  const handleDeleteWidget = (id: string) => {
    const w = widgetList.find((x) => x.id === id);
    setWidgetList((p) => p.filter((x) => x.id !== id));
    setDeletingWidget(null);
    showToast("success", "Removed", `"${w?.title}" removed.`);
  };

  return (
    <div style={{ display: "flex", height: "100vh", background: "var(--v3-bg)" }}>
      <V3Sidebar isOpen={sidebarOpen} onToggle={() => setSidebarOpen(!sidebarOpen)} onClose={() => setSidebarOpen(false)} />

      <div style={{ flex: 1, display: "flex", flexDirection: "column", minWidth: 0 }}>
        {/* Header */}
        <div style={{ display: "flex", alignItems: "center", gap: 12, padding: "12px 24px", borderBottom: "1px solid var(--v3-border)", flexShrink: 0 }}>
          {!sidebarOpen && (
            <button onClick={() => setSidebarOpen(true)} style={{ padding: 8, borderRadius: 8, border: "none", background: "transparent", color: "var(--v3-text-muted)", cursor: "pointer", display: "flex" }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "var(--v3-bg-hover)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
            >
              <IconPanelLeft className="h-4 w-4" />
            </button>
          )}

          {selected && (
            <button onClick={() => setSelected(null)} style={{ padding: "6px 10px", borderRadius: 8, border: "none", background: "transparent", color: "var(--v3-text-muted)", cursor: "pointer", display: "flex", alignItems: "center", gap: 6, fontSize: 13 }}
              onMouseEnter={(e) => { e.currentTarget.style.background = "var(--v3-bg-hover)"; }}
              onMouseLeave={(e) => { e.currentTarget.style.background = "transparent"; }}
            >
              <IconArrowLeft className="h-3.5 w-3.5" />
              Back
            </button>
          )}

          <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
            <IconGrid className="h-4.5 w-4.5" style={{ color: "var(--v3-accent)" }} />
            <h1 style={{ fontSize: 16, fontWeight: 600, color: "var(--v3-text)", margin: 0, letterSpacing: "-0.02em" }}>
              {selected ? selected.title : "Dashboards"}
            </h1>
          </div>

          <div style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
            {selected && (
              <button onClick={() => setShowAddWidget(true)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 10, border: "none", background: "var(--v3-accent)", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                <IconPlus className="h-3.5 w-3.5" />
                Add Widget
              </button>
            )}
            {!selected && (
              <button onClick={() => setShowCreate(true)} style={{ display: "flex", alignItems: "center", gap: 6, padding: "7px 14px", borderRadius: 10, border: "none", background: "var(--v3-accent)", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>
                <IconPlus className="h-3.5 w-3.5" />
                New Dashboard
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="v3-scroll" style={{ flex: 1, overflowY: "auto", padding: 24 }}>
          {!selected ? (
            /* Dashboard List */
            <div style={{ maxWidth: 1100, margin: "0 auto" }}>
              <div style={{ display: "grid", gridTemplateColumns: "repeat(auto-fill, minmax(300px, 1fr))", gap: 16 }}>
                {dashboards.map((dash, i) => (
                  <div
                    key={dash.id}
                    className="v3-fade-up"
                    style={{
                      animationDelay: `${i * 0.05}s`,
                      background: "var(--v3-bg-surface)",
                      border: "1px solid var(--v3-border)",
                      borderRadius: 16,
                      padding: 20,
                      position: "relative",
                      transition: "all 0.15s",
                      cursor: "pointer",
                    }}
                    onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--v3-border-hover)"; e.currentTarget.style.transform = "translateY(-2px)"; e.currentTarget.style.boxShadow = "var(--v3-shadow-md)"; }}
                    onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--v3-border)"; e.currentTarget.style.transform = "translateY(0)"; e.currentTarget.style.boxShadow = "none"; }}
                  >
                    {/* Delete overlay */}
                    {deletingDash === dash.id && (
                      <div style={{ position: "absolute", inset: 0, zIndex: 10, background: "rgba(18, 20, 29, 0.95)", borderRadius: 16, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12 }}>
                        <p style={{ fontSize: 13, fontWeight: 600, color: "var(--v3-text)", margin: 0 }}>Delete &quot;{dash.title}&quot;?</p>
                        <div style={{ display: "flex", gap: 8 }}>
                          <button onClick={(e) => { e.stopPropagation(); setDeletingDash(null); }} style={{ padding: "6px 14px", borderRadius: 8, border: "1px solid var(--v3-border)", background: "transparent", color: "var(--v3-text-secondary)", fontSize: 12, cursor: "pointer" }}>Cancel</button>
                          <button onClick={(e) => { e.stopPropagation(); handleDeleteDash(dash.id); }} style={{ padding: "6px 14px", borderRadius: 8, border: "none", background: "var(--v3-error)", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Delete</button>
                        </div>
                      </div>
                    )}

                    <div onClick={() => setSelected(dash)}>
                      <div style={{ display: "flex", alignItems: "center", gap: 10, marginBottom: 12 }}>
                        <div style={{ width: 36, height: 36, borderRadius: 10, background: "var(--v3-gradient-subtle)", display: "flex", alignItems: "center", justifyContent: "center" }}>
                          <IconGrid className="h-4.5 w-4.5" style={{ color: "var(--v3-accent)" }} />
                        </div>
                        <h3 style={{ fontSize: 15, fontWeight: 600, color: "var(--v3-text)", margin: 0, flex: 1, letterSpacing: "-0.01em" }}>
                          {dash.title}
                        </h3>
                      </div>
                      <p style={{ fontSize: 13, color: "var(--v3-text-secondary)", margin: "0 0 16px", lineHeight: 1.5 }}>
                        {dash.description}
                      </p>
                    </div>

                    <div style={{ display: "flex", alignItems: "center", gap: 10, fontSize: 11 }}>
                      <span style={{ padding: "3px 10px", borderRadius: 20, background: "var(--v3-accent-subtle)", color: "var(--v3-accent)", fontWeight: 600 }}>
                        {widgetList.filter((w) => w.dashboardId === dash.id).length} widgets
                      </span>
                      <span style={{ color: "var(--v3-text-muted)" }}>
                        Updated {new Date(dash.updatedAt).toLocaleDateString("en-US", { month: "short", day: "numeric" })}
                      </span>
                      <button
                        onClick={(e) => { e.stopPropagation(); setDeletingDash(dash.id); }}
                        style={{ marginLeft: "auto", padding: 4, borderRadius: 6, border: "none", background: "transparent", color: "var(--v3-text-muted)", cursor: "pointer", display: "flex", transition: "color 0.12s" }}
                        onMouseEnter={(e) => (e.currentTarget.style.color = "var(--v3-error)")}
                        onMouseLeave={(e) => (e.currentTarget.style.color = "var(--v3-text-muted)")}
                      >
                        <IconTrash className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            /* Dashboard Detail */
            <div className="v3-fade-up" style={{ maxWidth: 1200, margin: "0 auto" }}>
              <p style={{ fontSize: 13, color: "var(--v3-text-secondary)", margin: "0 0 20px" }}>
                {selected.description}
              </p>

              {widgets.length === 0 ? (
                <div style={{ background: "var(--v3-bg-surface)", border: "2px dashed var(--v3-border)", borderRadius: 20, padding: 48, textAlign: "center" }}>
                  <div style={{ width: 48, height: 48, borderRadius: 14, background: "var(--v3-gradient-subtle)", display: "flex", alignItems: "center", justifyContent: "center", margin: "0 auto 16px" }}>
                    <IconSparkles className="h-6 w-6" style={{ color: "var(--v3-accent)" }} />
                  </div>
                  <p style={{ fontSize: 15, fontWeight: 600, color: "var(--v3-text)", margin: 0 }}>No widgets yet</p>
                  <p style={{ fontSize: 12, color: "var(--v3-text-muted)", margin: "6px 0 20px" }}>Add charts and tables to build your dashboard.</p>
                  <button onClick={() => setShowAddWidget(true)} style={{ display: "inline-flex", alignItems: "center", gap: 6, padding: "9px 18px", borderRadius: 12, border: "none", background: "var(--v3-accent)", color: "#fff", fontSize: 13, fontWeight: 600, cursor: "pointer" }}>
                    <IconPlus className="h-4 w-4" />
                    Add Widget
                  </button>
                </div>
              ) : (
                <div style={{ display: "grid", gridTemplateColumns: "repeat(2, 1fr)", gap: 16 }}>
                  {widgets.map((widget, i) => (
                    <div
                      key={widget.id}
                      className="v3-fade-up"
                      style={{
                        animationDelay: `${i * 0.05}s`,
                        background: "var(--v3-bg-surface)",
                        border: "1px solid var(--v3-border)",
                        borderRadius: 16,
                        padding: 20,
                        position: "relative",
                        transition: "all 0.15s",
                        gridColumn: widget.width > 6 ? "1 / -1" : undefined,
                      }}
                      onMouseEnter={(e) => { e.currentTarget.style.borderColor = "var(--v3-border-hover)"; e.currentTarget.style.boxShadow = "var(--v3-shadow-sm)"; }}
                      onMouseLeave={(e) => { e.currentTarget.style.borderColor = "var(--v3-border)"; e.currentTarget.style.boxShadow = "none"; }}
                    >
                      {/* Delete overlay */}
                      {deletingWidget === widget.id && (
                        <div style={{ position: "absolute", inset: 0, zIndex: 10, background: "rgba(18, 20, 29, 0.95)", borderRadius: 16, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", gap: 12 }}>
                          <p style={{ fontSize: 13, fontWeight: 600, color: "var(--v3-text)", margin: 0 }}>Remove &quot;{widget.title}&quot;?</p>
                          <div style={{ display: "flex", gap: 8 }}>
                            <button onClick={() => setDeletingWidget(null)} style={{ padding: "6px 14px", borderRadius: 8, border: "1px solid var(--v3-border)", background: "transparent", color: "var(--v3-text-secondary)", fontSize: 12, cursor: "pointer" }}>Cancel</button>
                            <button onClick={() => handleDeleteWidget(widget.id)} style={{ padding: "6px 14px", borderRadius: 8, border: "none", background: "var(--v3-error)", color: "#fff", fontSize: 12, fontWeight: 600, cursor: "pointer" }}>Remove</button>
                          </div>
                        </div>
                      )}

                      {/* Widget header */}
                      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 14 }}>
                        <h4 style={{ fontSize: 14, fontWeight: 600, color: "var(--v3-text)", margin: 0, letterSpacing: "-0.01em" }}>
                          {widget.title}
                        </h4>
                        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
                          <span style={{ fontSize: 10, fontWeight: 600, padding: "3px 8px", borderRadius: 20, background: widget.type === "chart" ? "var(--v3-accent-subtle)" : "var(--v3-success-bg)", color: widget.type === "chart" ? "var(--v3-accent)" : "var(--v3-success)", textTransform: "uppercase", letterSpacing: "0.05em" }}>
                            {widget.type}
                          </span>
                          <button
                            onClick={() => setDeletingWidget(widget.id)}
                            style={{ padding: 4, borderRadius: 6, border: "none", background: "transparent", color: "var(--v3-text-muted)", cursor: "pointer", display: "flex", transition: "color 0.12s" }}
                            onMouseEnter={(e) => (e.currentTarget.style.color = "var(--v3-error)")}
                            onMouseLeave={(e) => (e.currentTarget.style.color = "var(--v3-text-muted)")}
                          >
                            <IconTrash className="h-3 w-3" />
                          </button>
                        </div>
                      </div>

                      {widget.type === "chart" && <WidgetChart widget={widget} />}
                      {widget.type === "table" && <WidgetTable widget={widget} />}
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <CreateModal open={showCreate} onClose={() => setShowCreate(false)} onCreate={handleCreate} />
      <AddWidgetModal open={showAddWidget} onClose={() => setShowAddWidget(false)} onAdd={handleAddWidget} />
      <V3Toast open={!!toast} type={toast?.type || "success"} title={toast?.title || ""} message={toast?.message || ""} onClose={() => setToast(null)} />
    </div>
  );
}
