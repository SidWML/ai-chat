/* ═══════════════════════════════════════════════════════
   Mock data for all app features
   ═══════════════════════════════════════════════════════ */

import { MOCK_DATABASES } from "./mock-data";

// ─── Database Explorer ───

export interface TableInfo {
  name: string;
  schema: string;
  rowCount: number;
  columns: ColumnInfo[];
}

export interface ColumnInfo {
  name: string;
  type: string;
  nullable: boolean;
  isPrimaryKey: boolean;
  isForeignKey: boolean;
  defaultValue?: string;
}

export const MOCK_TABLES: Record<string, TableInfo[]> = {
  "db-1": [
    {
      name: "users",
      schema: "public",
      rowCount: 45230,
      columns: [
        { name: "id", type: "uuid", nullable: false, isPrimaryKey: true, isForeignKey: false },
        { name: "email", type: "varchar(255)", nullable: false, isPrimaryKey: false, isForeignKey: false },
        { name: "name", type: "varchar(100)", nullable: false, isPrimaryKey: false, isForeignKey: false },
        { name: "created_at", type: "timestamp", nullable: false, isPrimaryKey: false, isForeignKey: false },
        { name: "last_login", type: "timestamp", nullable: true, isPrimaryKey: false, isForeignKey: false },
      ],
    },
    {
      name: "events",
      schema: "public",
      rowCount: 1250000,
      columns: [
        { name: "id", type: "bigint", nullable: false, isPrimaryKey: true, isForeignKey: false },
        { name: "user_id", type: "uuid", nullable: false, isPrimaryKey: false, isForeignKey: true },
        { name: "event_type", type: "varchar(50)", nullable: false, isPrimaryKey: false, isForeignKey: false },
        { name: "properties", type: "jsonb", nullable: true, isPrimaryKey: false, isForeignKey: false },
        { name: "created_at", type: "timestamp", nullable: false, isPrimaryKey: false, isForeignKey: false },
      ],
    },
    {
      name: "sessions",
      schema: "public",
      rowCount: 89400,
      columns: [
        { name: "id", type: "uuid", nullable: false, isPrimaryKey: true, isForeignKey: false },
        { name: "user_id", type: "uuid", nullable: false, isPrimaryKey: false, isForeignKey: true },
        { name: "started_at", type: "timestamp", nullable: false, isPrimaryKey: false, isForeignKey: false },
        { name: "ended_at", type: "timestamp", nullable: true, isPrimaryKey: false, isForeignKey: false },
        { name: "duration_ms", type: "integer", nullable: true, isPrimaryKey: false, isForeignKey: false },
      ],
    },
    {
      name: "page_views",
      schema: "public",
      rowCount: 3400000,
      columns: [
        { name: "id", type: "bigint", nullable: false, isPrimaryKey: true, isForeignKey: false },
        { name: "session_id", type: "uuid", nullable: false, isPrimaryKey: false, isForeignKey: true },
        { name: "url", type: "text", nullable: false, isPrimaryKey: false, isForeignKey: false },
        { name: "referrer", type: "text", nullable: true, isPrimaryKey: false, isForeignKey: false },
        { name: "viewed_at", type: "timestamp", nullable: false, isPrimaryKey: false, isForeignKey: false },
      ],
    },
    {
      name: "conversions",
      schema: "public",
      rowCount: 12800,
      columns: [
        { name: "id", type: "bigint", nullable: false, isPrimaryKey: true, isForeignKey: false },
        { name: "user_id", type: "uuid", nullable: false, isPrimaryKey: false, isForeignKey: true },
        { name: "event_id", type: "bigint", nullable: false, isPrimaryKey: false, isForeignKey: true },
        { name: "amount", type: "decimal(10,2)", nullable: false, isPrimaryKey: false, isForeignKey: false },
        { name: "currency", type: "varchar(3)", nullable: false, isPrimaryKey: false, isForeignKey: false, defaultValue: "'USD'" },
      ],
    },
  ],
  "db-2": [
    {
      name: "customers",
      schema: "public",
      rowCount: 8500,
      columns: [
        { name: "id", type: "int", nullable: false, isPrimaryKey: true, isForeignKey: false },
        { name: "name", type: "varchar(200)", nullable: false, isPrimaryKey: false, isForeignKey: false },
        { name: "email", type: "varchar(255)", nullable: false, isPrimaryKey: false, isForeignKey: false },
        { name: "segment", type: "enum('enterprise','mid-market','smb')", nullable: false, isPrimaryKey: false, isForeignKey: false },
        { name: "created_at", type: "datetime", nullable: false, isPrimaryKey: false, isForeignKey: false },
      ],
    },
    {
      name: "deals",
      schema: "public",
      rowCount: 23400,
      columns: [
        { name: "id", type: "int", nullable: false, isPrimaryKey: true, isForeignKey: false },
        { name: "customer_id", type: "int", nullable: false, isPrimaryKey: false, isForeignKey: true },
        { name: "title", type: "varchar(300)", nullable: false, isPrimaryKey: false, isForeignKey: false },
        { name: "value", type: "decimal(12,2)", nullable: false, isPrimaryKey: false, isForeignKey: false },
        { name: "stage", type: "varchar(50)", nullable: false, isPrimaryKey: false, isForeignKey: false },
        { name: "closed_at", type: "datetime", nullable: true, isPrimaryKey: false, isForeignKey: false },
      ],
    },
  ],
};

// ─── Dashboards ───

export interface Dashboard {
  id: string;
  title: string;
  description: string;
  widgetCount: number;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardWidget {
  id: string;
  dashboardId: string;
  title: string;
  type: "chart" | "table" | "map" | "text" | "metric";
  width: number;
  height: number;
  data?: any;
}

export const MOCK_DASHBOARDS: Dashboard[] = [
  {
    id: "dash-1",
    title: "Sales Overview",
    description: "Key sales metrics and revenue tracking",
    widgetCount: 4,
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 3600000).toISOString(),
  },
  {
    id: "dash-2",
    title: "Customer Analytics",
    description: "Customer segments, LTV, and retention analysis",
    widgetCount: 5,
    createdAt: new Date(Date.now() - 86400000 * 12).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "dash-3",
    title: "Product Performance",
    description: "Product metrics, inventory levels, and trends",
    widgetCount: 3,
    createdAt: new Date(Date.now() - 86400000 * 20).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
  },
];

export const MOCK_WIDGETS: DashboardWidget[] = [
  {
    id: "w-1",
    dashboardId: "dash-1",
    title: "Monthly Revenue",
    type: "chart",
    width: 6,
    height: 4,
    data: {
      chartType: "bar",
      data: {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun"],
        datasets: [
          { name: "Revenue", data: [42000, 48000, 55000, 51000, 62000, 68000], color: "#3C4C73" },
          { name: "Expenses", data: [28000, 31000, 34000, 30000, 36000, 39000], color: "#CF384D" },
        ],
      },
    },
  },
  {
    id: "w-2",
    dashboardId: "dash-1",
    title: "Top Customers",
    type: "table",
    width: 6,
    height: 4,
    data: {
      columns: ["Customer", "Revenue", "Orders", "Segment"],
      rows: [
        { Customer: "Acme Corp", Revenue: "$124,500", Orders: 47, Segment: "Enterprise" },
        { Customer: "TechFlow Inc", Revenue: "$98,200", Orders: 32, Segment: "Enterprise" },
        { Customer: "DataBridge", Revenue: "$76,800", Orders: 28, Segment: "Mid-Market" },
        { Customer: "CloudSync", Revenue: "$65,400", Orders: 21, Segment: "Mid-Market" },
        { Customer: "NetPulse", Revenue: "$54,100", Orders: 18, Segment: "SMB" },
        { Customer: "ByteWave", Revenue: "$48,900", Orders: 15, Segment: "SMB" },
      ],
    },
  },
  {
    id: "w-3",
    dashboardId: "dash-1",
    title: "Revenue by Region",
    type: "chart",
    width: 12,
    height: 4,
    data: {
      chartType: "pie",
      data: {
        labels: ["North America", "Europe", "Asia Pacific", "Latin America", "Middle East"],
        datasets: [
          { name: "Revenue", data: [185000, 124000, 98000, 45000, 32000], colors: ["#3C4C73", "#CF384D", "#4F5D8A", "#16A34A", "#D97706"] },
        ],
      },
    },
  },
  {
    id: "w-4",
    dashboardId: "dash-1",
    title: "Revenue Trend",
    type: "chart",
    width: 6,
    height: 4,
    data: {
      chartType: "area",
      data: {
        labels: ["W1", "W2", "W3", "W4", "W5", "W6", "W7", "W8"],
        datasets: [
          { name: "This Year", data: [12000, 14500, 13800, 16200, 15800, 18000, 17500, 19200], color: "#3C4C73" },
          { name: "Last Year", data: [10000, 11200, 12500, 13000, 12800, 14500, 15000, 16000], color: "#D97706" },
        ],
      },
    },
  },
  {
    id: "w-5",
    dashboardId: "dash-2",
    title: "Customer Segments",
    type: "chart",
    width: 6,
    height: 4,
    data: {
      chartType: "pie",
      data: {
        labels: ["Enterprise", "Mid-Market", "SMB", "Startup"],
        datasets: [
          { name: "Customers", data: [120, 340, 890, 450], colors: ["#3C4C73", "#CF384D", "#16A34A", "#D97706"] },
        ],
      },
    },
  },
  {
    id: "w-6",
    dashboardId: "dash-2",
    title: "LTV Distribution",
    type: "chart",
    width: 6,
    height: 4,
    data: {
      chartType: "line",
      data: {
        labels: ["Q1 '24", "Q2 '24", "Q3 '24", "Q4 '24", "Q1 '25", "Q2 '25"],
        datasets: [
          { name: "Enterprise", data: [8500, 9200, 9800, 10500, 11200, 12000], color: "#3C4C73" },
          { name: "Mid-Market", data: [3200, 3500, 3800, 4100, 4400, 4800], color: "#CF384D" },
          { name: "SMB", data: [800, 950, 1100, 1200, 1350, 1500], color: "#16A34A" },
        ],
      },
    },
  },
  {
    id: "w-7",
    dashboardId: "dash-2",
    title: "Recent Signups",
    type: "table",
    width: 6,
    height: 4,
    data: {
      columns: ["Name", "Email", "Plan", "MRR", "Joined"],
      rows: [
        { Name: "Sarah Chen", Email: "sarah@techflow.io", Plan: "Enterprise", MRR: "$2,400", Joined: "Mar 5" },
        { Name: "James Wilson", Email: "james@databridge.com", Plan: "Pro", MRR: "$480", Joined: "Mar 3" },
        { Name: "Emily Davis", Email: "emily@cloudsync.co", Plan: "Pro", MRR: "$480", Joined: "Mar 1" },
        { Name: "Alex Kim", Email: "alex@netpulse.io", Plan: "Starter", MRR: "$120", Joined: "Feb 28" },
        { Name: "Maria Lopez", Email: "maria@bytewave.dev", Plan: "Enterprise", MRR: "$2,400", Joined: "Feb 25" },
      ],
    },
  },
  {
    id: "w-8",
    dashboardId: "dash-2",
    title: "Retention by Cohort",
    type: "chart",
    width: 6,
    height: 4,
    data: {
      chartType: "area",
      data: {
        labels: ["Month 1", "Month 2", "Month 3", "Month 4", "Month 5", "Month 6"],
        datasets: [
          { name: "Jan Cohort", data: [100, 85, 72, 68, 65, 62], color: "#3C4C73" },
          { name: "Feb Cohort", data: [100, 88, 78, 74, 70, 67], color: "#16A34A" },
          { name: "Mar Cohort", data: [100, 90, 82, 79, 76, 73], color: "#8B5CF6" },
        ],
      },
    },
  },
  {
    id: "w-9",
    dashboardId: "dash-2",
    title: "Churn Reasons",
    type: "chart",
    width: 6,
    height: 4,
    data: {
      chartType: "bar",
      data: {
        labels: ["Price", "Features", "Support", "Competitor", "No Need", "Other"],
        datasets: [
          { name: "Count", data: [45, 32, 28, 22, 18, 12], color: "#CF384D" },
        ],
      },
    },
  },
  {
    id: "w-10",
    dashboardId: "dash-3",
    title: "Product Sales",
    type: "chart",
    width: 6,
    height: 4,
    data: {
      chartType: "bar",
      data: {
        labels: ["Widget A", "Widget B", "Widget C", "Widget D", "Widget E"],
        datasets: [
          { name: "Units Sold", data: [1250, 980, 870, 650, 420], color: "#3C4C73" },
          { name: "Returns", data: [45, 32, 28, 15, 12], color: "#CF384D" },
        ],
      },
    },
  },
  {
    id: "w-11",
    dashboardId: "dash-3",
    title: "Inventory Levels",
    type: "table",
    width: 6,
    height: 4,
    data: {
      columns: ["Product", "In Stock", "Reserved", "Reorder Point", "Status"],
      rows: [
        { Product: "Widget A", "In Stock": 2450, Reserved: 180, "Reorder Point": 500, Status: "OK" },
        { Product: "Widget B", "In Stock": 890, Reserved: 120, "Reorder Point": 400, Status: "OK" },
        { Product: "Widget C", "In Stock": 340, Reserved: 95, "Reorder Point": 300, Status: "Low" },
        { Product: "Widget D", "In Stock": 1200, Reserved: 60, "Reorder Point": 200, Status: "OK" },
        { Product: "Widget E", "In Stock": 150, Reserved: 45, "Reorder Point": 200, Status: "Critical" },
      ],
    },
  },
  {
    id: "w-12",
    dashboardId: "dash-3",
    title: "Sales Trend",
    type: "chart",
    width: 12,
    height: 4,
    data: {
      chartType: "line",
      data: {
        labels: ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"],
        datasets: [
          { name: "2024", data: [320, 380, 420, 390, 450, 480, 520, 510, 560, 600, 580, 640], color: "#3C4C73" },
          { name: "2025", data: [380, 420, 490, 460, 530, 570], color: "#16A34A" },
        ],
      },
    },
  },
];

// ─── Ingestion ───

export interface IntrospectionJob {
  id: string;
  connectionId: string;
  connectionName: string;
  status: "pending" | "running" | "completed" | "failed";
  progress: number;
  stage: string;
  tablesDiscovered: number;
  startedAt: string;
  completedAt?: string;
}

export const MOCK_INTROSPECTIONS: IntrospectionJob[] = [
  {
    id: "ingest-1",
    connectionId: "db-1",
    connectionName: "Production Analytics",
    status: "completed",
    progress: 100,
    stage: "Complete",
    tablesDiscovered: 5,
    startedAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    completedAt: new Date(Date.now() - 86400000 * 3 + 120000).toISOString(),
  },
  {
    id: "ingest-2",
    connectionId: "db-2",
    connectionName: "Customer CRM",
    status: "completed",
    progress: 100,
    stage: "Complete",
    tablesDiscovered: 5,
    startedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    completedAt: new Date(Date.now() - 86400000 * 2 + 95000).toISOString(),
  },
  {
    id: "ingest-3",
    connectionId: "db-3",
    connectionName: "Inventory System",
    status: "running",
    progress: 65,
    stage: "Analyzing relationships",
    tablesDiscovered: 3,
    startedAt: new Date(Date.now() - 60000).toISOString(),
  },
];

// ─── Knowledge Base ───

export interface KnowledgeBase {
  id: string;
  title: string;
  description: string;
  fileCount: number;
  totalSize: string;
  createdAt: string;
  updatedAt: string;
}

export interface KBDocument {
  id: string;
  knowledgeBaseId: string;
  name: string;
  type: string;
  size: string;
  uploadedAt: string;
}

export const MOCK_KNOWLEDGE_BASES: KnowledgeBase[] = [
  {
    id: "kb-1",
    title: "Sales Playbook",
    description: "Sales procedures, pricing rules, and discount policies",
    fileCount: 8,
    totalSize: "2.4 MB",
    createdAt: new Date(Date.now() - 86400000 * 15).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString(),
  },
  {
    id: "kb-2",
    title: "Product Documentation",
    description: "Product specs, feature guides, and release notes",
    fileCount: 12,
    totalSize: "5.1 MB",
    createdAt: new Date(Date.now() - 86400000 * 30).toISOString(),
    updatedAt: new Date(Date.now() - 86400000).toISOString(),
  },
  {
    id: "kb-3",
    title: "Data Dictionary",
    description: "Database schema documentation and field descriptions",
    fileCount: 3,
    totalSize: "890 KB",
    createdAt: new Date(Date.now() - 86400000 * 7).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 5).toISOString(),
  },
];

export const MOCK_KB_DOCUMENTS: KBDocument[] = [
  { id: "doc-1", knowledgeBaseId: "kb-1", name: "pricing-rules-2024.pdf", type: "PDF", size: "450 KB", uploadedAt: new Date(Date.now() - 86400000 * 10).toISOString() },
  { id: "doc-2", knowledgeBaseId: "kb-1", name: "discount-policy.docx", type: "DOCX", size: "120 KB", uploadedAt: new Date(Date.now() - 86400000 * 8).toISOString() },
  { id: "doc-3", knowledgeBaseId: "kb-1", name: "sales-territories.csv", type: "CSV", size: "85 KB", uploadedAt: new Date(Date.now() - 86400000 * 5).toISOString() },
  { id: "doc-4", knowledgeBaseId: "kb-2", name: "feature-guide-v3.pdf", type: "PDF", size: "1.2 MB", uploadedAt: new Date(Date.now() - 86400000 * 3).toISOString() },
  { id: "doc-5", knowledgeBaseId: "kb-2", name: "release-notes-q4.md", type: "MD", size: "45 KB", uploadedAt: new Date(Date.now() - 86400000 * 2).toISOString() },
];

// ─── Users ───

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: "admin" | "editor" | "viewer";
  status: "active" | "inactive";
  createdAt: string;
  lastLogin?: string;
}

export const MOCK_USERS: AppUser[] = [
  { id: "u-1", name: "Alex Johnson", email: "alex@company.com", role: "admin", status: "active", createdAt: new Date(Date.now() - 86400000 * 90).toISOString(), lastLogin: new Date(Date.now() - 3600000).toISOString() },
  { id: "u-2", name: "Sarah Chen", email: "sarah@company.com", role: "editor", status: "active", createdAt: new Date(Date.now() - 86400000 * 60).toISOString(), lastLogin: new Date(Date.now() - 86400000).toISOString() },
  { id: "u-3", name: "Mike Peters", email: "mike@company.com", role: "viewer", status: "active", createdAt: new Date(Date.now() - 86400000 * 45).toISOString(), lastLogin: new Date(Date.now() - 86400000 * 3).toISOString() },
  { id: "u-4", name: "Emily Davis", email: "emily@company.com", role: "editor", status: "active", createdAt: new Date(Date.now() - 86400000 * 30).toISOString(), lastLogin: new Date(Date.now() - 86400000 * 7).toISOString() },
  { id: "u-5", name: "James Wilson", email: "james@company.com", role: "viewer", status: "inactive", createdAt: new Date(Date.now() - 86400000 * 120).toISOString() },
];

// ─── Suggestions ───

export interface QuerySuggestion {
  id: string;
  category: "table" | "chart" | "map" | "analysis";
  title: string;
  description: string;
  query: string;
  databaseId: string;
}

export const MOCK_SUGGESTIONS: QuerySuggestion[] = [
  { id: "sg-1", category: "table", title: "Top 10 Customers by Revenue", description: "Show the highest-value customers based on total order value", query: "Show me the top 10 customers by revenue", databaseId: "db-1" },
  { id: "sg-2", category: "chart", title: "Monthly Revenue Trend", description: "Visualize revenue trends over the last 12 months", query: "Chart monthly revenue for the last 12 months", databaseId: "db-1" },
  { id: "sg-3", category: "map", title: "Store Locations Map", description: "Map all store locations with revenue data", query: "Map all store locations near New York", databaseId: "db-4" },
  { id: "sg-4", category: "analysis", title: "Customer Churn Analysis", description: "Analyze customer churn patterns and risk factors", query: "Analyze customer churn patterns", databaseId: "db-2" },
  { id: "sg-5", category: "table", title: "Low Stock Products", description: "Products running low on inventory", query: "Which products are running low on stock?", databaseId: "db-3" },
  { id: "sg-6", category: "chart", title: "Conversion Funnel", description: "Visualize the conversion funnel stages", query: "Show me the conversion funnel for last quarter", databaseId: "db-1" },
  { id: "sg-7", category: "analysis", title: "Sales by Region", description: "Break down sales performance by geographic region", query: "Break down sales by region", databaseId: "db-1" },
  { id: "sg-8", category: "table", title: "Recent Orders", description: "Show the most recent orders with details", query: "Show me the 20 most recent orders", databaseId: "db-2" },
];
